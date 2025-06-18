interface TrendData {
  keyword: string;
  category: string;
  timestamp: number;
  searchVolume?: number;
}

export class RealTimeTrendCrawler {
  private static async crawlNaverTrends(apiKey: string): Promise<string[]> {
    try {
      const currentDate = new Date();
      const currentHour = currentDate.getHours();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      const currentWeekday = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][currentDate.getDay()];
      const timeContext = currentHour < 12 ? '오전' : currentHour < 18 ? '오후' : '저녁';
      
      console.log(`🕐 현재 시간: ${currentMonth}월 ${currentDay}일 ${currentWeekday} ${timeContext} ${currentHour}시`);
      
      const prompt = `지금은 ${currentMonth}월 ${currentDay}일 ${currentWeekday} ${timeContext} ${currentHour}시입니다.

한국의 실시간 검색 트렌드를 분석하여 현재 이 순간 실제로 검색되고 있을 만한 키워드 10개를 생성해주세요.

**현재 시간대별 특성 반영:**
${currentHour < 9 ? '- 출근 준비, 아침 뉴스, 교통 정보' :
  currentHour < 12 ? '- 업무 관련, 점심 메뉴, 생활 정보' :
  currentHour < 18 ? '- 오후 업무, 저녁 준비, 쇼핑 정보' :
  currentHour < 22 ? '- 저녁 식사, TV 프로그램, 여가 활동' :
  '- 밤 시간대, 내일 준비, 건강 관리'}

**요일별 특성 (${currentWeekday}):**
${currentWeekday.includes('월') ? '- 한 주 시작, 업무 계획, 건강 관리' :
  currentWeekday.includes('화') || currentWeekday.includes('수') || currentWeekday.includes('목') ? '- 평일 업무, 생활 정보, 효율성' :
  currentWeekday.includes('금') ? '- 주말 준비, 여가 계획, 맛집 정보' :
  '- 주말 활동, 휴식, 가족 시간'}

**절대 금지 사항:**
- 모든 연도 표기 금지 (2023, 2024, 2025 등)
- "년" 단어 완전 금지
- 모든 정치인 이름과 정치적 이슈
- 연예인 개인사 스캔들

**반드시 포함해야 할 분야:**
- 경제/금융: 최신 정책, 지원금, 금리 변화
- 생활/복지: 건강보험, 육아지원, 주거정책  
- 기술/IT: 새로운 앱, 서비스 출시
- 건강/의료: 계절별 건강 정보, 의료 혜택
- 사회/문화: 축제, 이벤트, 생활 변화

각 키워드는 15자 이내로 하고, 지금 이 시간에 실제 검색할 만한 구체적인 내용으로 만들어주세요.
한 줄에 하나씩, 키워드만 나열해주세요.`;

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

      if (!response.ok) {
        console.error('네이버 트렌드 API 오류:', response.status, response.statusText);
        throw new Error(`트렌드 크롤링 실패: ${response.status}`);
      }

      const data = await response.json();
      const trends = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!trends) {
        console.warn('네이버 트렌드 응답이 비어있음');
        return [];
      }

      console.log('네이버 트렌드 원본 응답:', trends);

      const keywords = trends.split('\n')
        .map(line => line.replace(/^[0-9-."'*]+\s*/, '').trim())
        .filter(keyword => keyword.length > 2 && keyword.length <= 20)
        .filter(keyword => 
          !keyword.includes('2023') && 
          !keyword.includes('2024') && 
          !keyword.includes('2025') && 
          !keyword.includes('2026') && 
          !keyword.includes('년') &&
          !keyword.includes('올해') &&
          !keyword.includes('내년') &&
          !keyword.includes('작년')
        )
        .slice(0, 10);

      console.log('네이버 트렌드 필터링 결과:', keywords);
      return keywords;

    } catch (error) {
      console.error('네이버 트렌드 크롤링 오류:', error);
      return [];
    }
  }

  private static async crawlGoogleTrends(apiKey: string): Promise<string[]> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      const currentHour = currentDate.getHours();
      const season = this.getCurrentSeason();
      
      console.log(`🌍 구글 트렌드 크롤링 시작 - ${season} 시즌`);
      
      const prompt = `현재 날짜: ${currentMonth}월 ${currentDay}일, 시간: ${currentHour}시

구글 트렌드에서 현재 급상승하고 있을 만한 한국 관련 검색어 10개를 생성해주세요.

**계절 특성 반영 (${season}):**
${season === '봄' ? '- 새학기, 꽃구경, 봄나들이, 알레르기 관리, 봄 패션' :
  season === '여름' ? '- 휴가 계획, 더위 대책, 여름 건강관리, 에어컨, 해수욕장' :
  season === '가을' ? '- 가을 여행, 건조함 대책, 환절기 건강, 단풍, 가을 패션' :
  '- 겨울 건강, 난방비 절약, 감기 예방, 스키장, 겨울 패션'}

**시간대별 특성 (${currentHour}시):**
${currentHour < 9 ? '- 출근길 정보, 아침 뉴스, 날씨' :
  currentHour < 18 ? '- 점심 메뉴, 업무 효율, 생활 정보' :
  '- 저녁 메뉴, TV 프로그램, 휴식'}

**절대 금지:**
- 모든 연도 숫자 금지 (2023, 2024, 2025 등)
- "년" 단어 완전 금지
- 정치적 이슈와 인물

**우선 반영 분야:**
- 실생활 도움 정보 (생활비 절약, 건강 관리)
- 계절성 정보 (${season} 관련)
- 현재 시간대 관심사
- 정부 지원 정책 (지원금, 혜택)
- 기술 트렌드 (앱, 서비스)

각 키워드는 15자 이내로, 지금 실제 검색할 만한 내용으로 한 줄에 하나씩 나열해주세요.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.5,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        console.error('구글 트렌드 API 오류:', response.status, response.statusText);
        throw new Error(`구글 트렌드 크롤링 실패: ${response.status}`);
      }

      const data = await response.json();
      const trends = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!trends) {
        console.warn('구글 트렌드 응답이 비어있음');
        return [];
      }

      console.log('구글 트렌드 원본 응답:', trends);

      const keywords = trends.split('\n')
        .map(line => line.replace(/^[0-9-."'*]+\s*/, '').trim())
        .filter(keyword => keyword.length > 2 && keyword.length <= 20)
        .filter(keyword => 
          !keyword.includes('2023') && 
          !keyword.includes('2024') && 
          !keyword.includes('2025') && 
          !keyword.includes('2026') && 
          !keyword.includes('년') &&
          !keyword.includes('올해') &&
          !keyword.includes('내년') &&
          !keyword.includes('작년')
        )
        .slice(0, 10);

      console.log('구글 트렌드 필터링 결과:', keywords);
      return keywords;

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
    console.log('🔍 실시간 트렌드 크롤링 시작...');
    
    try {
      const [naverTrends, googleTrends] = await Promise.allSettled([
        this.crawlNaverTrends(apiKey),
        this.crawlGoogleTrends(apiKey)
      ]);

      let allTrends: string[] = [];

      if (naverTrends.status === 'fulfilled') {
        allTrends.push(...naverTrends.value);
        console.log('네이버 트렌드 성공:', naverTrends.value.length, '개');
      } else {
        console.error('네이버 트렌드 실패:', naverTrends.reason);
      }

      if (googleTrends.status === 'fulfilled') {
        allTrends.push(...googleTrends.value);
        console.log('구글 트렌드 성공:', googleTrends.value.length, '개');
      } else {
        console.error('구글 트렌드 실패:', googleTrends.reason);
      }

      // 중복 제거 및 최종 필터링
      const uniqueTrends = Array.from(new Set(allTrends));
      
      const cleanTrends = uniqueTrends.filter(keyword => 
        keyword &&
        keyword.length >= 3 &&
        keyword.length <= 20 &&
        !keyword.includes('2023') && 
        !keyword.includes('2024') && 
        !keyword.includes('2025') && 
        !keyword.includes('2026') && 
        !keyword.includes('년') &&
        !keyword.includes('올해') &&
        !keyword.includes('내년') &&
        !keyword.includes('작년')
      );
      
      console.log('최종 크롤링 결과:', cleanTrends.length, '개 키워드');
      console.log('최종 키워드 목록:', cleanTrends);
      
      // 랜덤 섞기 후 최대 15개 반환
      const finalTrends = cleanTrends.sort(() => Math.random() - 0.5).slice(0, 15);
      
      if (finalTrends.length === 0) {
        console.warn('크롤링된 트렌드가 없어 백업 키워드 사용');
        return ['생활 절약 팁', '건강 관리법', '요리 레시피', '홈트레이닝', '재테크 정보'];
      }
      
      return finalTrends;
    } catch (error) {
      console.error('실시간 트렌드 크롤링 전체 실패:', error);
      return ['생활 절약 팁', '건강 관리법', '요리 레시피', '홈트레이닝', '재테크 정보'];
    }
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
      const categories = ['건강관리', '생활절약', '디지털활용', '요리레시피', '육아정보', '재테크', '여행정보', '홈케어'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const prompt = `"${randomCategory}" 분야에서 현재 사람들이 실제로 궁금해할 만한 새로운 키워드를 1개만 생성해주세요. 
      
**절대 금지:**
- 모든 연도 숫자 절대 포함 금지 (2023, 2024, 2025 등)
- "년" 단어 완전 금지

특징:
- 15자 이내
- 현재 기준의 실용적이고 검색 가치가 있는 내용
- 계절과 시기에 맞는 내용
- 다른 설명 없이 키워드만 제공
- 연도나 "년"이 포함되지 않은 키워드

예시 형태: "겨울 실내 습도 조절법", "연말정산 절세 팁", "신규 다이어트 계획"`;

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
      
      // 연도 포함 시 필터링
      if (trend && 
          !trend.includes('2023') && 
          !trend.includes('2024') && 
          !trend.includes('2025') && 
          !trend.includes('2026') && 
          !trend.includes('년') &&
          !trend.includes('올해') &&
          !trend.includes('내년') &&
          !trend.includes('작년')) {
        return trend;
      }
      
      return null;
    } catch (error) {
      console.error('새로운 트렌드 생성 오류:', error);
      return null;
    }
  }
}
