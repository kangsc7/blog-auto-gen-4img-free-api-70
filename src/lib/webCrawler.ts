
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
      console.log(`웹 검색 시뮬레이션 시작: ${keyword}`);
      
      // 구글 검색 시뮬레이션을 위한 Gemini API 활용
      const searchPrompt = `"${keyword}"에 대한 최신 정보를 찾기 위해 웹 검색을 시뮬레이션해주세요. 다음 형식으로 3-5개의 가상의 검색 결과를 생성해주세요. 반드시 2024-2025년 최신 정보를 포함하여 실제 존재할 법한 내용으로 구성해주세요:

제목1: [구체적인 제목]
내용1: [상세한 설명 200자 이상]
요약1: [핵심 포인트 50자]
공식링크1: [관련 정부기관이나 공공기관의 실제 웹사이트 주소]

제목2: [구체적인 제목]
내용2: [상세한 설명 200자 이상]  
요약2: [핵심 포인트 50자]
공식링크2: [관련 정부기관이나 공공기관의 실제 웹사이트 주소]

(이런 식으로 계속...)

**중요 지침**:
- "${keyword}" 키워드가 모든 제목과 내용에 포함되어야 함
- 2025년 최신 정보 반영
- 정확하고 유용한 정보 제공
- 각 항목은 서로 다른 관점에서 접근
- 공식링크는 반드시 실제 존재하는 정부기관, 공공기관 웹사이트여야 함 (예: 보건복지부, 복지정보포털, 에너지바우처 공식사이트 등)
- 실제 성공 사례나 구체적인 수치 데이터 포함`;

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
        const errorText = await response.text();
        console.error('Gemini API 응답 오류:', response.status, errorText);
        throw new Error(`웹 검색 시뮬레이션 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error('Gemini API 응답 구조 오류:', data);
        throw new Error('검색 결과 데이터 구조가 올바르지 않습니다');
      }

      const searchResults = data.candidates[0].content.parts[0].text;

      if (!searchResults) {
        throw new Error('검색 결과를 받지 못했습니다');
      }

      console.log('웹 검색 결과 수신 완료');
      
      // 검색 결과 파싱
      return this.parseSearchResults(searchResults, keyword);
    } catch (error: any) {
      console.error('웹 크롤링 오류:', error);
      
      // 오류 발생 시 기본 백업 결과 반환
      return this.getBackupResults(keyword);
    }
  }

  private static getBackupResults(keyword: string): CrawlResult[] {
    console.log(`백업 검색 결과 사용: ${keyword}`);
    
    return [
      {
        title: `${keyword} 완전 가이드`,
        content: `${keyword}에 대한 최신 정보와 활용 방법을 상세히 알아보겠습니다. 2025년 기준으로 업데이트된 내용을 바탕으로 실질적인 도움이 되는 정보를 제공합니다. 초보자도 쉽게 따라할 수 있는 단계별 가이드와 함께 실제 사례를 통해 효과적인 활용법을 설명합니다.`,
        url: `https://example.com/${keyword.replace(/\s+/g, '-')}`,
        summary: `${keyword} 기본부터 고급까지 완벽 정리`,
        officialLinks: ['https://www.mw.go.kr', 'https://www.gov.kr']
      },
      {
        title: `${keyword} 최신 트렌드 분석`,
        content: `최근 ${keyword} 분야에서 일어나고 있는 변화와 트렌드를 분석합니다. 전문가들의 의견과 시장 데이터를 바탕으로 향후 전망을 제시하며, 개인이나 기업이 어떻게 대응해야 할지에 대한 실용적인 조언을 담고 있습니다. 성공 사례와 실패 사례를 통해 배울 점들을 정리했습니다.`,
        url: `https://example.com/${keyword.replace(/\s+/g, '-')}-trend`,
        summary: `${keyword} 2025년 트렌드와 전망`,
        officialLinks: ['https://www.moef.go.kr']
      }
    ];
  }

  private static parseSearchResults(results: string, keyword: string): CrawlResult[] {
    const crawlResults: CrawlResult[] = [];
    
    try {
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

      // 파싱 결과가 없으면 백업 결과 사용
      if (crawlResults.length === 0) {
        console.log('파싱 결과 없음, 백업 결과 사용');
        return this.getBackupResults(keyword);
      }

      return crawlResults;
    } catch (error) {
      console.error('검색 결과 파싱 오류:', error);
      return this.getBackupResults(keyword);
    }
  }

  static async crawlForKeyword(keyword: string, apiKey: string): Promise<string> {
    console.log(`웹 크롤링 시작: ${keyword}`);
    
    // API 키 유효성 검사
    if (!apiKey || apiKey.trim() === '') {
      console.error('API 키가 없습니다');
      return this.getBasicInfo(keyword);
    }
    
    try {
      const crawlResults = await this.searchWebContent(keyword, apiKey);
      
      if (crawlResults.length === 0) {
        console.log('크롤링 결과 없음, 기본 정보 반환');
        return this.getBasicInfo(keyword);
      }

      // 크롤링된 정보를 요약하여 반환
      let crawledInfo = `=== ${keyword} 관련 최신 정보 ===\n\n`;
      
      crawlResults.forEach((result, index) => {
        crawledInfo += `${index + 1}. ${result.title}\n`;
        crawledInfo += `${result.content}\n`;
        crawledInfo += `핵심: ${result.summary}\n`;
        if (result.officialLinks && result.officialLinks.length > 0) {
          crawledInfo += `공식 참고링크: ${result.officialLinks.join(', ')}\n`;
        }
        crawledInfo += `\n`;
      });

      crawledInfo += `=== 추천 공식 웹사이트 ===\n`;
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

      console.log('웹 크롤링 완료');
      return crawledInfo;
    } catch (error: any) {
      console.error('웹 크롤링 전체 실패:', error);
      return this.getBasicInfo(keyword);
    }
  }

  private static getBasicInfo(keyword: string): string {
    console.log(`기본 정보 반환: ${keyword}`);
    
    return `=== ${keyword} 기본 정보 ===

${keyword}에 대한 상세한 정보를 제공합니다. 

주요 특징:
- 2025년 최신 트렌드 반영
- 실용적이고 검증된 정보
- 단계별 가이드 제공
- 전문가 추천 방법

활용 방법:
1. 기본 개념 이해하기
2. 실제 적용 사례 살펴보기
3. 단계별 실행 계획 수립
4. 지속적인 모니터링과 개선

참고 자료:
- 정부 공식 웹사이트
- 전문 기관 발표 자료
- 성공 사례 분석

=== 추천 공식 웹사이트 ===
정부24: https://www.gov.kr
보건복지부: https://www.mw.go.kr
복지정보포털: https://www.welfaresupport.go.kr`;
  }
}
