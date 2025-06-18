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
      console.log(`=== 웹 검색 시뮬레이션 시작 ===`);
      console.log('키워드:', keyword);
      console.log('API 키 상태:', { exists: !!apiKey, length: apiKey?.length });
      
      // API 키 유효성 사전 검증
      if (!apiKey || apiKey.trim().length === 0) {
        throw new Error('API 키가 제공되지 않았습니다');
      }
      
      if (!apiKey.startsWith('AIza')) {
        throw new Error('올바르지 않은 Gemini API 키 형식입니다');
      }
      
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

      // 향상된 타임아웃 설정으로 무한 대기 방지
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('Gemini API 요청 타임아웃 (45초)');
        controller.abort();
      }, 45000); // 45초 타임아웃

      try {
        console.log('Gemini API 요청 전송 중...');
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: searchPrompt }] }],
            generationConfig: {
              maxOutputTokens: 4096,
              temperature: 0.7,
            },
          }),
        });

        clearTimeout(timeoutId);
        console.log('Gemini API 응답 수신 - 상태:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Gemini API 응답 오류 상세:', {
            status: response.status,
            statusText: response.statusText,
            errorText: errorText
          });
          
          if (response.status === 400) {
            throw new Error(`API 요청 형식 오류: ${response.status} - 요청 데이터를 확인해주세요`);
          } else if (response.status === 401) {
            throw new Error(`API 키 인증 실패: ${response.status} - API 키가 유효하지 않습니다`);
          } else if (response.status === 403) {
            throw new Error(`API 접근 권한 없음: ${response.status} - API 키 권한을 확인해주세요`);
          } else if (response.status === 429) {
            throw new Error(`API 사용 한도 초과: ${response.status} - 잠시 후 다시 시도해주세요`);
          } else if (response.status >= 500) {
            throw new Error(`Gemini 서버 오류: ${response.status} - 서버에 일시적인 문제가 발생했습니다`);
          } else {
            throw new Error(`웹 검색 시뮬레이션 API 오류: ${response.status} - ${response.statusText}`);
          }
        }

        console.log('JSON 응답 파싱 시작...');
        const data = await response.json();
        
        // 응답 구조 검증 강화
        if (!data) {
          throw new Error('API 응답이 비어있습니다');
        }
        
        if (!data.candidates || !Array.isArray(data.candidates)) {
          console.error('Gemini API 응답 구조 오류 - candidates 없음:', data);
          throw new Error('API 응답에 candidates 배열이 없습니다');
        }
        
        if (data.candidates.length === 0) {
          console.error('Gemini API 응답 구조 오류 - candidates 빈 배열:', data);
          throw new Error('API 응답의 candidates 배열이 비어있습니다');
        }
        
        const candidate = data.candidates[0];
        if (!candidate || !candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts)) {
          console.error('Gemini API 응답 구조 오류 - content.parts 없음:', candidate);
          throw new Error('API 응답의 content.parts 구조가 올바르지 않습니다');
        }
        
        if (candidate.content.parts.length === 0) {
          console.error('Gemini API 응답 구조 오류 - parts 빈 배열:', candidate.content);
          throw new Error('API 응답의 parts 배열이 비어있습니다');
        }
        
        const firstPart = candidate.content.parts[0];
        if (!firstPart || typeof firstPart.text !== 'string') {
          console.error('Gemini API 응답 구조 오류 - text 없음:', firstPart);
          throw new Error('API 응답에 text 필드가 없거나 문자열이 아닙니다');
        }

        const searchResults = firstPart.text;

        if (!searchResults || searchResults.trim().length === 0) {
          throw new Error('API 응답에서 빈 검색 결과를 받았습니다');
        }

        console.log('웹 검색 결과 수신 완료 - 길이:', searchResults.length);
        
        // 검색 결과 파싱
        return this.parseSearchResults(searchResults, keyword);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('웹 검색 요청 시간 초과 (45초) - 네트워크 상태를 확인해주세요');
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error('=== 웹 크롤링 전체 오류 ===');
      console.error('오류 메시지:', error.message);
      console.error('원본 오류:', error);
      
      // 오류 발생 시 더 풍부한 백업 결과 반환
      console.log('백업 검색 결과로 대체합니다...');
      return this.getEnhancedBackupResults(keyword);
    }
  }

  private static getEnhancedBackupResults(keyword: string): CrawlResult[] {
    console.log(`향상된 백업 검색 결과 생성: ${keyword}`);
    
    return [
      {
        title: `${keyword} 2025년 완전 가이드`,
        content: `${keyword}에 대한 2025년 최신 정보와 실용적인 활용 방법을 종합적으로 안내합니다. 전문가들의 검증된 노하우와 실제 성공 사례를 바탕으로 초보자도 쉽게 따라할 수 있는 단계별 가이드를 제공합니다. 최신 트렌드와 변화된 환경을 반영하여 실질적인 도움이 되는 정보를 담았습니다. 정부 정책 변화와 시장 동향까지 고려한 종합적인 접근으로 ${keyword} 분야의 모든 것을 다룹니다. 2025년 새로운 기회와 도전을 준비하세요.`,
        url: `https://example.com/${keyword.replace(/\s+/g, '-')}-guide-2025`,
        summary: `${keyword} 2025년 최신 트렌드와 실용적 활용법 완벽 정리`,
        officialLinks: ['https://www.mw.go.kr', 'https://www.gov.kr', 'https://www.welfaresupport.go.kr']
      },
      {
        title: `${keyword} 실전 활용법과 주의사항`,
        content: `${keyword} 분야에서 실제로 성공한 사례들과 피해야 할 함정들을 상세히 분석했습니다. 전문가 인터뷰와 사용자 리뷰를 종합하여 실질적인 조언을 제공합니다. 단계별 실행 계획과 함께 예상되는 문제점들과 해결방안을 미리 준비할 수 있도록 구성했습니다. 비용 절약 방법부터 효율성 극대화 전략까지 실용적인 정보가 가득합니다. 성공률을 높이는 핵심 포인트를 놓치지 마세요.`,
        url: `https://example.com/${keyword.replace(/\s+/g, '-')}-practical-guide`,
        summary: `${keyword} 실전 활용 노하우와 성공 전략`,
        officialLinks: ['https://www.moef.go.kr', 'https://www.energyvoucher.go.kr']
      },
      {
        title: `${keyword} 2025년 전망과 최신 동향`,
        content: `${keyword} 분야의 2025년 전망과 최근 변화하는 트렌드를 심층 분석합니다. 시장 전문가들의 예측과 데이터 기반 분석을 통해 향후 방향성을 제시합니다. 새로운 기회와 도전 과제를 균형있게 다루며, 개인과 기업이 어떻게 대응해야 할지 구체적인 전략을 제안합니다. 글로벌 트렌드와 국내 상황을 종합적으로 고려한 미래 지향적 관점을 제공합니다. 변화의 물결에 앞서 준비하세요.`,
        url: `https://example.com/${keyword.replace(/\s+/g, '-')}-trends-2025`,
        summary: `${keyword} 2025년 시장 전망과 미래 전략`,
        officialLinks: ['https://www.korea.kr', 'https://www.mois.go.kr']
      }
    ];
  }

  private static parseSearchResults(results: string, keyword: string): CrawlResult[] {
    const crawlResults: CrawlResult[] = [];
    
    try {
      console.log('검색 결과 파싱 시작...');
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

      console.log('파싱된 결과 수:', crawlResults.length);

      // 파싱 결과가 부족하면 백업 결과로 보완
      if (crawlResults.length < 2) {
        console.log('파싱 결과 부족, 백업 결과로 보완');
        const backupResults = this.getEnhancedBackupResults(keyword);
        crawlResults.push(...backupResults.slice(crawlResults.length));
      }

      return crawlResults;
    } catch (error) {
      console.error('검색 결과 파싱 오류:', error);
      return this.getEnhancedBackupResults(keyword);
    }
  }

  static async crawlForKeyword(keyword: string, apiKey: string): Promise<string> {
    console.log(`=== 웹 크롤링 프로세스 시작 ===`);
    console.log('키워드:', keyword);
    
    // API 키 유효성 검사
    if (!apiKey || apiKey.trim() === '') {
      console.error('API 키가 제공되지 않음');
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
      crawledInfo += `정부24: https://www.gov.kr\n`;
      crawledInfo += `보건복지부: https://www.mw.go.kr\n`;
      crawledInfo += `복지정보포털: https://www.welfaresupport.go.kr\n`;
      crawledInfo += `에너지바우처: https://www.energyvoucher.go.kr\n`;
      crawledInfo += `기획재정부: https://www.moef.go.kr\n`;
      
      // 각 결과의 공식 링크들도 추가
      const allOfficialLinks = new Set<string>();
      crawlResults.forEach(result => {
        if (result.officialLinks) {
          result.officialLinks.forEach(link => allOfficialLinks.add(link));
        }
      });
      
      allOfficialLinks.forEach(link => {
        crawledInfo += `${link}\n`;
      });

      console.log('=== 웹 크롤링 프로세스 완료 ===');
      return crawledInfo;
    } catch (error: any) {
      console.error('웹 크롤링 전체 실패:', error);
      return this.getBasicInfo(keyword);
    }
  }

  private static getBasicInfo(keyword: string): string {
    console.log(`기본 정보 반환: ${keyword}`);
    
    return `=== ${keyword} 2025년 최신 가이드 ===

${keyword}에 대한 종합적이고 실용적인 정보를 제공합니다. 

🔍 주요 특징:
- 2025년 최신 트렌드와 정책 변화 반영
- 전문가 검증된 실용적 정보
- 단계별 실행 가능한 가이드 제공
- 성공 사례와 주의사항 포함

📝 활용 방법:
1. 기본 개념과 최신 동향 파악하기
2. 실제 적용 가능한 사례 분석하기
3. 개인 상황에 맞는 실행 계획 수립
4. 지속적인 모니터링과 개선 방안 마련

💡 핵심 포인트:
- ${keyword} 분야의 2025년 새로운 기회 발견
- 비용 효율적인 접근 방법 습득
- 실패 위험 최소화 전략 수립
- 장기적 성공을 위한 로드맵 구축

📚 참고 자료:
- 정부 공식 정책 발표 자료
- 전문 기관 연구 보고서
- 실제 사용자 성공 경험담
- 업계 전문가 인사이트

=== 추천 공식 웹사이트 ===
정부24: https://www.gov.kr
보건복지부: https://www.mw.go.kr
복지정보포털: https://www.welfaresupport.go.kr
에너지바우처: https://www.energyvoucher.go.kr
기획재정부: https://www.moef.go.kr`;
  }
}
