
interface TrendData {
  keyword: string;
  category: string;
  timestamp: number;
  searchVolume?: number;
}

export class RealTimeTrendCrawler {
  private static async crawlNaverTrends(apiKey: string): Promise<string[]> {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const currentHour = new Date().getHours();
      const timeContext = currentHour < 12 ? '오전' : currentHour < 18 ? '오후' : '저녁';
      
      const prompt = `현재 ${currentYear}년 ${currentMonth}월 ${timeContext} ${currentHour}시입니다. 
      
한국의 실시간 검색 트렌드를 분석하여 ${currentYear}년 현재 이 순간 실제로 검색되고 있을 만한 키워드 10개를 생성해주세요.

**절대 금지 사항:**
- ${currentYear - 2}년, ${currentYear - 1}년 등 과거 년도는 절대 포함하지 마세요
- 모든 정치인 이름 (윤석열, 이재명, 한동훈 등)
- 정치적 이슈 (탄핵, 국정감사, 정당 등)
- 연예인 개인사 스캔들

**반드시 포함해야 할 분야:**
- 경제/금융: ${currentYear}년 새로운 정책, 지원금, 금리 변화
- 생활/복지: 건강보험, 육아지원, 주거정책
- 기술/IT: 새로운 앱, 서비스 출시
- 건강/의료: 계절별 건강 정보, 의료 혜택
- 사회/문화: ${currentYear}년 축제, 이벤트, 생활 변화

각 키워드는 15자 이내로 하고, ${currentYear}년 현재의 실제 검색할 만한 구체적인 내용으로 만들어주세요.
한 줄에 하나씩, 키워드만 나열해주세요.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.3,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) throw new Error('트렌드 크롤링 실패');

      const data = await response.json();
      const trends = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!trends) return [];

      return trends.split('\n')
        .map(line => line.replace(/^[0-9-."']+\s*/, '').trim())
        .filter(keyword => keyword.length > 3 && keyword.length <= 20)
        // 과거 년도 필터링 강화
        .filter(keyword => !keyword.includes('2023') && !keyword.includes('2024'))
        .slice(0, 10);

    } catch (error) {
      console.error('네이버 트렌드 크롤링 오류:', error);
      return [];
    }
  }

  private static async crawlGoogleTrends(apiKey: string): Promise<string[]> {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const season = this.getCurrentSeason();
      
      const prompt = `현재 날짜: ${currentYear}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일

구글 트렌드에서 ${currentYear}년 현재 급상승하고 있을 만한 한국 관련 검색어 10개를 생성해주세요.

**절대 금지 - 과거 년도:**
- ${currentYear - 2}년, ${currentYear - 1}년 등 과거 년도 절대 금지
- 모든 키워드는 ${currentYear}년 현재 기준이어야 함

**계절 특성 반영 (${season}):**
${season === '봄' ? '- 새학기, 꽃구경, 봄나들이, 알레르기 관리' :
  season === '여름' ? '- 휴가, 더위 대책, 여름 건강관리, 에어컨' :
  season === '가을' ? '- 가을 여행, 건조함 대책, 환절기 건강' :
  '- 겨울 건강, 난방비 절약, 연말정산, 새해 계획'}

각 키워드는 ${currentYear}년 현재의 구체적이고 실제 검색할 만한 내용으로, 한 줄에 하나씩 나열해주세요.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.4,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) throw new Error('구글 트렌드 크롤링 실패');

      const data = await response.json();
      const trends = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!trends) return [];

      return trends.split('\n')
        .map(line => line.replace(/^[0-9-."']+\s*/, '').trim())
        .filter(keyword => keyword.length > 3 && keyword.length <= 20)
        // 과거 년도 필터링 강화
        .filter(keyword => !keyword.includes('2023') && !keyword.includes('2024'))
        .slice(0, 10);

    } catch (error) {
      console.error('구글 트렌드 크롤링 오류:', error);
      return [];
    }
  }

  private static getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return '봄';
    if (month >= 6 && month <= 8) return '여름';
    if (month >= 9 && month <= 11) return '가을';
    return '겨울';
  }

  static async getLatestTrends(apiKey: string): Promise<string[]> {
    const [naverTrends, googleTrends] = await Promise.all([
      this.crawlNaverTrends(apiKey),
      this.crawlGoogleTrends(apiKey)
    ]);

    const allTrends = [...naverTrends, ...googleTrends];
    const uniqueTrends = Array.from(new Set(allTrends));
    
    // 과거 년도 최종 필터링
    const currentYearTrends = uniqueTrends.filter(keyword => 
      !keyword.includes('2023') && !keyword.includes('2024')
    );
    
    return currentYearTrends.sort(() => Math.random() - 0.5).slice(0, 15);
  }

  static async getRandomLatestKeyword(apiKey: string, usedKeywords: string[] = []): Promise<string | null> {
    try {
      const trends = await this.getLatestTrends(apiKey);
      
      const availableTrends = trends.filter(keyword => 
        !usedKeywords.some(used => 
          used.toLowerCase().replace(/\s/g, '') === keyword.toLowerCase().replace(/\s/g, '')
        )
      );

      if (availableTrends.length === 0) {
        return await this.generateFreshTrend(apiKey);
      }

      return availableTrends[Math.floor(Math.random() * availableTrends.length)];
    } catch (error) {
      console.error('최신 키워드 선택 오류:', error);
      return await this.generateFreshTrend(apiKey);
    }
  }

  private static async generateFreshTrend(apiKey: string): Promise<string | null> {
    try {
      const currentYear = new Date().getFullYear();
      const categories = ['건강관리', '생활절약', '디지털활용', '요리레시피', '육아정보', '재테크', '여행정보', '홈케어'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const prompt = `"${randomCategory}" 분야에서 ${currentYear}년 현재 사람들이 실제로 궁금해할 만한 새로운 키워드를 1개만 생성해주세요. 
      
**절대 금지:**
- ${currentYear - 2}년, ${currentYear - 1}년 등 과거 년도 절대 포함 금지

특징:
- 15자 이내
- ${currentYear}년 현재 기준의 실용적이고 검색 가치가 있는 내용
- 계절과 시기에 맞는 내용
- 다른 설명 없이 키워드만 제공

예시 형태: "겨울 실내 습도 조절법", "${currentYear}년 연말정산 절세 팁", "신년 다이어트 계획"`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.5,
            maxOutputTokens: 100,
          },
        }),
      });

      if (!response.ok) throw new Error('새로운 트렌드 생성 실패');

      const data = await response.json();
      const trend = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      // 과거 년도 포함 시 필터링
      if (trend && !trend.includes('2023') && !trend.includes('2024')) {
        return trend;
      }
      
      return null;
    } catch (error) {
      console.error('새로운 트렌드 생성 오류:', error);
      return null;
    }
  }
}
