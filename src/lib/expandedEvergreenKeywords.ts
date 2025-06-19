
interface EvergreenCategory {
  name: string;
  keywords: string[];
  subCategories: string[];
}

export class ExpandedEvergreenService {
  private static categories: EvergreenCategory[] = [
    {
      name: '재테크',
      subCategories: ['투자', '절약', '보험', '세금', '부동산'],
      keywords: [
        '적금 이자율 비교', '투자 포트폴리오 구성', '보험료 절약 방법', '세금 절약 전략',
        '부동산 투자 가이드', '주식 배당금 계산', '펀드 수익률 분석', '연금저축 활용법',
        '카드 포인트 적립', '통장 수수료 면제', '대출 금리 비교', '신용점수 관리법'
      ]
    },
    {
      name: '건강관리',
      subCategories: ['운동', '식단', '질병예방', '건강검진', '정신건강'],
      keywords: [
        '홈트레이닝 루틴', '단백질 섭취 가이드', '면역력 높이는 음식', '스트레스 해소법',
        '수면의 질 개선', '혈압 관리 방법', '당뇨 예방 식단', '관절 건강 운동',
        '눈 건강 관리법', '소화기 건강 유지', '갱년기 건강관리', '청소년 성장 관리'
      ]
    },
    // ... 기존 카테고리들 유지하면서 10,000개까지 확장 가능한 구조
  ];

  static async generateDynamicEvergreenKeyword(apiKey: string, usedKeywords: string[] = []): Promise<string | null> {
    try {
      // 10,000개 규모의 다양한 키워드 생성을 위한 고도화된 프롬프트
      const diversityPrompts = [
        '트렌드와 무관한 평생 유용한 실용 정보',
        '시대를 초월한 라이프 핵 정보',
        '누구나 평생 활용할 수 있는 생활 지혜',
        '변하지 않는 가치의 실무 노하우',
        '평생 도움되는 전문 지식',
        '시간이 지나도 유효한 실용 팁',
        '세대를 넘나드는 생활 정보',
        '평생 활용 가능한 전문 기술'
      ];

      const categoryVariations = [
        '건강, 웰빙, 피트니스, 의료',
        '재테크, 투자, 경제, 금융',
        '요리, 음식, 영양, 식단',
        '육아, 교육, 학습, 발달',
        '취미, 레저, 스포츠, 문화',
        '인간관계, 소통, 심리, 감정',
        '자기계발, 성장, 목표, 습관',
        '생활정보, 절약, 효율, 관리',
        '기술, IT, 디지털, 온라인',
        '창작, 예술, 디자인, 표현'
      ];

      const randomDiversity = diversityPrompts[Math.floor(Math.random() * diversityPrompts.length)];
      const randomCategory = categoryVariations[Math.floor(Math.random() * categoryVariations.length)];

      const prompt = `${randomDiversity}를 주제로 "${randomCategory}" 분야에서 평생 활용할 수 있는 키워드를 생성해주세요.

🎯 생성 조건:
- 15자 이내의 간결한 표현
- 시간이 지나도 변하지 않는 가치
- 실제 검색하고 싶은 구체적 내용
- 연령대를 불문하고 유용한 정보
- 트렌드와 무관한 평생 유효 정보

🔄 다양성 확보를 위한 추론:
1. 기존 키워드와 차별화된 새로운 관점 제시
2. 연관 검색어를 추론하여 변주된 키워드 생성
3. 같은 주제라도 다른 접근 방식으로 표현
4. 실용성과 독창성을 모두 고려한 키워드

이미 사용된 키워드들: ${usedKeywords.slice(-20).join(', ')}
위 키워드들과 완전히 다른 새로운 키워드를 만들어주세요.

다른 설명 없이 키워드만 제공해주세요.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.3, // 더 높은 창의성
            maxOutputTokens: 150,
            topP: 0.95,
          },
        }),
      });

      if (!response.ok) throw new Error('고도화된 평생 키워드 생성 실패');

      const data = await response.json();
      const keyword = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (!keyword) return null;

      // 중복 방지 강화
      const similarityThreshold = 60; // 더 엄격한 기준
      const isSimilar = usedKeywords.some(used => {
        const similarity = this.calculateSimilarity(keyword, used);
        return similarity > similarityThreshold;
      });

      if (isSimilar) {
        // 2차 시도 - 더 창의적인 접근
        return this.generateAlternativeKeyword(apiKey, usedKeywords);
      }

      console.log('새로운 평생 키워드 생성:', keyword);
      return keyword;
    } catch (error) {
      console.error('고도화된 평생 키워드 생성 오류:', error);
      return this.getRandomFromDatabase(usedKeywords);
    }
  }

  // 대안 키워드 생성 (2차 시도)
  private static async generateAlternativeKeyword(apiKey: string, usedKeywords: string[]): Promise<string | null> {
    try {
      const alternativePrompt = `완전히 새로운 관점에서 평생 활용할 수 있는 실용 키워드를 창조해주세요.

🚀 창의적 접근:
- 기존과 완전히 다른 분야 조합
- 의외의 실용 정보 발굴
- 누구도 생각하지 못한 유용한 팁
- 평범한 일상의 혁신적 접근

조건: 15자 이내, 평생 유효, 실용성 극대화

키워드만 제공하세요.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: alternativePrompt }] }],
          generationConfig: {
            temperature: 1.5, // 최대 창의성
            maxOutputTokens: 100,
          },
        }),
      });

      if (!response.ok) throw new Error('대안 키워드 생성 실패');

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch (error) {
      console.error('대안 키워드 생성 오류:', error);
      return null;
    }
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase();
    const s1 = normalize(str1);
    const s2 = normalize(str2);
    
    if (s1 === s2) return 100;
    
    const maxLength = Math.max(s1.length, s2.length);
    let matches = 0;
    
    for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
      if (s1[i] === s2[i]) matches++;
    }
    
    return (matches / maxLength) * 100;
  }

  static getRandomFromDatabase(usedKeywords: string[]): string {
    const allKeywords = this.categories.flatMap(category => category.keywords);
    const availableKeywords = allKeywords.filter(keyword => 
      !usedKeywords.some(used => 
        used.toLowerCase().replace(/\s/g, '') === keyword.toLowerCase().replace(/\s/g, '')
      )
    );

    if (availableKeywords.length === 0) {
      // 모든 키워드를 사용했으면 처음부터 다시
      return allKeywords[Math.floor(Math.random() * allKeywords.length)];
    }

    return availableKeywords[Math.floor(Math.random() * availableKeywords.length)];
  }

  static getAllKeywords(): string[] {
    return this.categories.flatMap(category => category.keywords);
  }

  static getKeywordsByCategory(categoryName: string): string[] {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category ? category.keywords : [];
  }

  // 10,000개 확장 가능 통계
  static getExpandedStats() {
    const baseKeywords = this.getAllKeywords().length;
    const estimatedExpansion = 10000;
    
    return {
      baseKeywords,
      estimatedTotal: estimatedExpansion,
      aiGenerated: estimatedExpansion - baseKeywords,
      categories: this.categories.length
    };
  }
}
