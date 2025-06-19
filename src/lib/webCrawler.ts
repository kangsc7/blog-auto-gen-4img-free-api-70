
interface CrawlResult {
  title: string;
  content: string;
  url: string;
  summary: string;
  officialLinks?: string[];
}

export class WebCrawlerService {
  private static async searchWebContent(keyword: string, apiKey: string): Promise<CrawlResult[]> {
    try {
      // 현재 연도 동적 계산
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const currentDate = new Date().toISOString().split('T')[0];

      // 구글 검색 시뮬레이션을 위한 Gemini API 활용 - 현재 연도 중심
      const searchPrompt = `현재 날짜는 ${currentDate}이고, 현재 연도는 ${currentYear}년입니다.

"${keyword}"에 대한 ${currentYear}년 최신 정보를 찾기 위해 웹 검색을 시뮬레이션해주세요. 반드시 ${currentYear}년 현재 시점의 최신 정보로만 구성해주세요.

다음 형식으로 3-5개의 가상의 검색 결과를 생성해주세요:

제목1: [${currentYear}년 관련 구체적인 제목]
내용1: [${currentYear}년 기준 상세한 설명 200자 이상]
요약1: [핵심 포인트 50자]
공식링크1: [관련 정부기관이나 공공기관의 실제 웹사이트 주소]

제목2: [${currentYear}년 관련 구체적인 제목]
내용2: [${currentYear}년 기준 상세한 설명 200자 이상]  
요약2: [핵심 포인트 50자]
공식링크2: [관련 정부기관이나 공공기관의 실제 웹사이트 주소]

(이런 식으로 계속...)

**중요 지침**:
- 모든 정보는 반드시 ${currentYear}년 현재 시점 기준이어야 함
- "${keyword}" 키워드가 모든 제목과 내용에 포함되어야 함
- ${currentYear}년 ${currentMonth}월 현재의 최신 정보만 반영
- 과거 연도(${currentYear - 1}년, ${currentYear - 2}년 등)의 정보는 절대 포함하지 말 것
- 정확하고 유용한 현재 정보 제공
- 각 항목은 서로 다른 관점에서 접근
- 공식링크는 반드시 실제 존재하는 정부기관, 공공기관 웹사이트여야 함
- ${currentYear}년 실제 정책이나 제도 변화 반영
- 실제 성공 사례나 구체적인 수치 데이터 포함 (${currentYear}년 기준)

절대로 ${currentYear - 1}년 이전의 정보를 포함하지 마세요. 모든 정보는 ${currentYear}년 현재 기준이어야 합니다.`;

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: searchPrompt }] }],
          generationConfig: {
            maxOutputTokens: 4096,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('웹 검색 시뮬레이션 실패');
      }

      const data = await response.json();
      const searchResults = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!searchResults) {
        throw new Error('검색 결과를 받지 못했습니다');
      }

      // 검색 결과 파싱
      return this.parseSearchResults(searchResults, keyword);
    } catch (error) {
      console.error('웹 크롤링 오류:', error);
      return [];
    }
  }

  private static parseSearchResults(results: string, keyword: string): CrawlResult[] {
    const crawlResults: CrawlResult[] = [];
    const sections = results.split(/제목\d+:/);
    
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      const titleMatch = section.match(/^([^\n]+)/);
      const contentMatch = section.match(/내용\d+:\s*([^요약]+)/);
      const summaryMatch = section.match(/요약\d+:\s*([^공식링크]+)/);
      const officialLinkMatch = section.match(/공식링크\d+:\s*([^\n]+)/);

      if (titleMatch && contentMatch && summaryMatch) {
        const officialLinks = officialLinkMatch ? [officialLinkMatch[1].trim()] : [];
        
        crawlResults.push({
          title: titleMatch[1].trim(),
          content: contentMatch[1].trim(),
          url: `https://example.com/${keyword.replace(/\s+/g, '-')}`,
          summary: summaryMatch[1].trim(),
          officialLinks: officialLinks
        });
      }
    }

    return crawlResults;
  }

  static async crawlForKeyword(keyword: string, apiKey: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const currentDate = new Date().toLocaleDateString('ko-KR');
    
    console.log(`웹 크롤링 시작: ${keyword} (${currentYear}년 기준)`);
    
    const crawlResults = await this.searchWebContent(keyword, apiKey);
    
    if (crawlResults.length === 0) {
      return `${keyword}에 대한 ${currentYear}년 최신 정보를 찾지 못했습니다. ${currentYear}년 일반적인 지식을 바탕으로 작성합니다.`;
    }

    // 크롤링된 정보를 요약하여 반환
    let crawledInfo = `=== ${keyword} 관련 ${currentYear}년 최신 정보 (${currentDate} 기준) ===\n\n`;
    
    crawlResults.forEach((result, index) => {
      crawledInfo += `${index + 1}. ${result.title}\n`;
      crawledInfo += `${result.content}\n`;
      crawledInfo += `핵심: ${result.summary}\n`;
      if (result.officialLinks && result.officialLinks.length > 0) {
        crawledInfo += `공식 참고링크: ${result.officialLinks.join(', ')}\n`;
      }
      crawledInfo += `\n`;
    });

    crawledInfo += `=== ${currentYear}년 추천 공식 웹사이트 ===\n`;
    crawledInfo += `보건복지부: https://www.mw.go.kr\n`;
    crawledInfo += `복지정보포털: https://www.welfaresupport.go.kr\n`;
    crawledInfo += `에너지바우처 공식사이트: https://www.energyvoucher.go.kr\n`;
    crawledInfo += `기획재정부: https://www.moef.go.kr\n`;
    
    crawlResults.forEach((result, index) => {
      if (result.officialLinks && result.officialLinks.length > 0) {
        result.officialLinks.forEach(link => {
          crawledInfo += `${link}\n`;
        });
      }
    });

    return crawledInfo;
  }
}
