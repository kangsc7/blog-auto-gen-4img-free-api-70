
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
    {
      name: '생활정보',
      subCategories: ['절약', '효율성', '정리정돈', '청소', '에너지'],
      keywords: [
        '전기요금 절약 팁', '가스비 줄이는 방법', '물 절약 아이디어', '쓰레기 분리수거',
        '옷장 정리 노하우', '냉장고 정리법', '청소 순서와 방법', '세탁 노하우',
        '에어컨 효율 높이기', '난방비 절약법', '인터넷 요금 절약', '스마트폰 요금제'
      ]
    },
    {
      name: '요리',
      subCategories: ['기본요리', '간편식', '건강식', '보관법', '식재료'],
      keywords: [
        '기본 반찬 만들기', '일주일 밑반찬', '간편 도시락 메뉴', '건강한 간식',
        '식재료 보관법', '냉동식품 활용', '계절 음식 레시피', '아이 간식 만들기',
        '다이어트 요리법', '단백질 요리', '채소 요리 방법', '국물 요리 레시피'
      ]
    },
    {
      name: '육아',
      subCategories: ['신생아', '유아', '아동', '교육', '건강'],
      keywords: [
        '신생아 돌보기', '이유식 만들기', '아이 놀이법', '훈육 방법',
        '아이 건강관리', '예방접종 일정', '독서 습관 기르기', '창의력 발달',
        '학습 습관 만들기', '사회성 발달 도움', '안전사고 예방', '성장발달 체크'
      ]
    },
    {
      name: '자기계발',
      subCategories: ['학습', '독서', '시간관리', '목표설정', '습관'],
      keywords: [
        '효과적인 학습법', '독서 습관 만들기', '시간관리 노하우', '목표 달성 전략',
        '좋은 습관 기르기', '집중력 향상법', '기억력 개선 방법', '창의력 기르기',
        '스트레스 관리법', '자신감 키우기', '소통 능력 향상', '리더십 개발'
      ]
    },
    {
      name: '인간관계',
      subCategories: ['소통', '갈등해결', '네트워킹', '가족관계', '직장관계'],
      keywords: [
        '대화 잘하는 법', '경청 기술', '갈등 해결 방법', '인맥 관리법',
        '가족 소통법', '부부 관계 개선', '직장 인간관계', '친구 사귀기',
        '예의와 매너', '감정 조절법', '공감 능력 기르기', '협상 기술'
      ]
    },
    {
      name: '취미생활',
      subCategories: ['독서', '운동', '여행', '창작', '수집'],
      keywords: [
        '독서 모임 만들기', '홈 가드닝', '사진 촬영 기법', '그림 그리기',
        '음악 감상법', '여행 계획 세우기', '캠핑 준비물', '등산 장비',
        '요가 기초 동작', '명상 방법', '악기 배우기', '수공예 만들기'
      ]
    }
  ];

  static async generateDynamicEvergreenKeyword(apiKey: string, usedKeywords: string[] = []): Promise<string | null> {
    try {
      // 랜덤 카테고리 선택
      const randomCategory = this.categories[Math.floor(Math.random() * this.categories.length)];
      const randomSubCategory = randomCategory.subCategories[Math.floor(Math.random() * randomCategory.subCategories.length)];
      
      const prompt = `"${randomCategory.name}" 분야의 "${randomSubCategory}" 영역에서 평생 도움이 되는 실용적인 키워드를 1개만 생성해주세요.

특징:
- 시간이 지나도 변하지 않는 가치 있는 정보
- 15자 이내의 간결한 표현
- 실제 검색하고 싶은 내용
- 구체적이고 실행 가능한 내용

이미 사용된 키워드들: ${usedKeywords.slice(-10).join(', ')}
위 키워드들과 중복되지 않는 새로운 키워드를 만들어주세요.

다른 설명 없이 키워드만 제공해주세요.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.2,
            maxOutputTokens: 100,
          },
        }),
      });

      if (!response.ok) throw new Error('동적 평생 키워드 생성 실패');

      const data = await response.json();
      const keyword = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (!keyword) return null;

      // 기존 키워드와 유사도 체크
      const similarityThreshold = 70;
      const isSimilar = usedKeywords.some(used => {
        const similarity = this.calculateSimilarity(keyword, used);
        return similarity > similarityThreshold;
      });

      if (isSimilar) {
        // 유사하면 기존 DB에서 선택
        return this.getRandomFromDatabase(usedKeywords);
      }

      return keyword;
    } catch (error) {
      console.error('동적 평생 키워드 생성 오류:', error);
      return this.getRandomFromDatabase(usedKeywords);
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

  private static getRandomFromDatabase(usedKeywords: string[]): string {
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
}
