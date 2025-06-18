
interface TrendData {
  keyword: string;
  category: string;
  timestamp: number;
  searchVolume?: number;
}

export class RealTimeTrendCrawler {
  private static async crawlNaverTrends(apiKey: string): Promise<string[]> {
    try {
      // 네이버 실시간 검색어 시뮬레이션 (실제 API는 제한적이므로 AI로 현실적인 트렌드 생성)
      const currentHour = new Date().getHours();
      const timeContext = currentHour < 12 ? '오전' : currentHour < 18 ? '오후' : '저녁';
      
      const prompt = `현재 시각은 ${timeContext} ${currentHour}시입니다. 
      
한국의 실시간 검색 트렌드를 분석하여 지금 이 순간 실제로 검색되고 있을 만한 키워드 10개를 생성해주세요.

**반드시 제외할 키워드:**
- 모든 정치인 이름 (윤석열, 이재명, 한동훈 등)
- 정치적 이슈 (탄핵, 국정감사, 정당 등)
- 연예인 개인사 스캔들

**포함해야 할 분야:**
- 경제/금융: 새로운 정책, 지원금, 금리 변화
- 생활/복지: 건강보험, 육아지원, 주거정책
- 기술/IT: 새로운 앱, 서비스 출시
- 건강/의료: 계절별 건강 정보, 의료 혜택
- 사회/문화: 축제, 이벤트, 생활 변화
- 날씨/계절: 현재 계절에 맞는 정보

**시간대별 특성 반영:**
${timeContext === '오전' ? '- 출근길 정보, 아침 건강 관리, 하루 준비' : 
  timeContext === '오후' ? '- 점심시간 정보, 오후 업무, 건강 관리' : 
  '- 퇴근 후 활동, 저녁 식사, 휴식 관련'}

각 키워드는 15자 이내로 하고, 실제 검색할 만한 구체적인 내용으로 만들어주세요.
한 줄에 하나씩, 키워드만 나열해주세요.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.3, // 높은 창의성으로 다양한 키워드 생성
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
        .slice(0, 10);

    } catch (error) {
      console.error('네이버 트렌드 크롤링 오류:', error);
      return [];
    }
  }

  private static async crawlGoogleTrends(apiKey: string): Promise<string[]> {
    try {
      const currentDate = new Date();
      const season = this.getCurrentSeason();
      
      const prompt = `현재 날짜: ${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일

구글 트렌드에서 현재 급상승하고 있을 만한 한국 관련 검색어 10개를 생성해주세요.

**계절 특성 반영 (${season}):**
${season === '봄' ? '- 새학기, 꽃구경, 봄나들이, 알레르기 관리' :
  season === '여름' ? '- 휴가, 더위 대책, 여름 건강관리, 에어컨' :
  season === '가을' ? '- 가을 여행, 건조함 대책, 환절기 건강' :
  '- 겨울 건강, 난방비 절약, 연말정산, 새해 계획'}

**트렌드 특성:**
- 최근 1주일 내 이슈
- 실용적이고 검색 가치가 있는 내용
- 정치/연예 스캔들 제외
- 생활밀착형 정보

각 키워드는 구체적이고 실제 검색할 만한 내용으로, 한 줄에 하나씩 나열해주세요.`;

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

    // 두 소스를 합치고 중복 제거
    const allTrends = [...naverTrends, ...googleTrends];
    const uniqueTrends = Array.from(new Set(allTrends));
    
    // 랜덤하게 섞어서 다양성 확보
    return uniqueTrends.sort(() => Math.random() - 0.5).slice(0, 15);
  }

  static async getRandomLatestKeyword(apiKey: string, usedKeywords: string[] = []): Promise<string | null> {
    try {
      const trends = await this.getLatestTrends(apiKey);
      
      // 사용하지 않은 키워드만 필터링
      const availableTrends = trends.filter(keyword => 
        !usedKeywords.some(used => 
          used.toLowerCase().replace(/\s/g, '') === keyword.toLowerCase().replace(/\s/g, '')
        )
      );

      if (availableTrends.length === 0) {
        // 모든 트렌드를 사용했다면 새로운 트렌드 생성
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
      const categories = ['건강관리', '생활절약', '디지털활용', '요리레시피', '육아정보', '재테크', '여행정보', '홈케어'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const prompt = `"${randomCategory}" 분야에서 현재 사람들이 실제로 궁금해할 만한 새로운 키워드를 1개만 생성해주세요. 
      
특징:
- 15자 이내
- 실용적이고 검색 가치가 있는 내용
- 계절과 시기에 맞는 내용
- 다른 설명 없이 키워드만 제공

예시 형태: "겨울 실내 습도 조절법", "연말정산 절세 팁", "신년 다이어트 계획"`;

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
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch (error) {
      console.error('새로운 트렌드 생성 오류:', error);
      return null;
    }
  }
}
