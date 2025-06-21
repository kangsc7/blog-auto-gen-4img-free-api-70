interface DynamicHeading {
  title: string;
  emoji: string;
  content: string;
}

export const generateDynamicHeadings = async (
  keyword: string,
  topic: string,
  apiKey: string
): Promise<DynamicHeading[]> => {
  const prompt = `
당신은 블로그 콘텐츠 전문가입니다. 

주제: "${topic}"
핵심 키워드: "${keyword}"

위 키워드와 주제에 대해 사람들이 실제로 궁금해하고 검색할 만한 7개의 소제목을 생성해주세요.

**🚨 중요한 생성 규칙 🚨**
1. **기존 고정 템플릿 완전 금지**: "신청 방법", "자격 조건", "필요 서류", "기본 정보" 등 획일적인 템플릿은 절대 사용하지 마세요
2. **실제 검색 의도 반영**: 사용자가 구글에서 실제로 검색할 만한 자연스러운 질문형 또는 관심사 기반 제목
3. **검색 트렌드 고려**: 최신 검색 트렌드와 사용자 관심사를 반영한 소제목
4. **다양한 관점 제공**: 초보자, 경험자, 문제 해결, 비교 분석 등 다양한 관점의 소제목
5. **소제목 길이**: 공백 포함 40자 이내로 작성
6. **적절한 이모지**: 각 소제목에 어울리는 이모지 1개 포함

**생성 예시** (청년 전세자금대출 주제의 경우):
❌ 잘못된 예시: "청년 전세자금대출 신청 방법", "청년 전세자금대출 자격 조건"
✅ 올바른 예시: "신용등급 낮아도 전세자금대출 가능할까?", "보증금 없이도 전세 계약이 가능한 방법"

**생성해야 할 소제목 유형**:
- 궁금증 해결형: "~해도 괜찮을까?", "~하면 어떻게 될까?"
- 문제 해결형: "~할 때 주의할 점", "~실패하지 않는 방법"
- 비교 분석형: "~와 ~의 차이점", "어떤 것이 더 유리할까?"
- 경험 공유형: "실제 후기는 어떨까?", "전문가가 추천하는 방법"
- 최신 트렌드형: "2025년 달라진 점", "요즘 인기 있는 방법"

**출력 형식:**
각 줄마다 다음 형식으로 출력해주세요:
제목|이모지|간단설명

**절대 금지 사항:**
- FAQ, 자주 묻는 질문 관련 소제목 생성 금지
- 기존 템플릿 형태의 소제목 생성 금지
- 40자 초과 소제목 생성 금지

지금 즉시 위 지침에 따라 7개의 창의적이고 검색 친화적인 소제목을 생성해주세요:
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('소제목 생성 API 요청 실패');
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('소제목 생성 응답이 비어있습니다');
    }

    const lines = generatedText.split('\n').filter(
      (line) => line.trim() && line.includes('|')
    );

    const filteredLines = lines.filter((line) => {
      const title = line.split('|')[0]?.toLowerCase() || '';
      const titleLength = line.split('|')[0]?.trim().length || 0;
      const bannedKeywords = [
        '신청 방법',
        '자격 조건',
        '필요 서류',
        '기본 정보',
        '지원 대상',
        '혜택 내용',
        'faq',
        '자주',
        '질문',
        'q&a',
        '묻는'
      ];
      const hasBannedKeyword = bannedKeywords.some((keyword) =>
        title.includes(keyword)
      );

      return !hasBannedKeyword && titleLength <= 40;
    });

    const headings: DynamicHeading[] = filteredLines.slice(0, 7).map((line) => {
      const parts = line.split('|');
      let title = parts[0]?.trim() || `${keyword} 관련 정보`;
      if (title.length > 40) {
        title = title.substring(0, 37) + '...';
      }

      return {
        title,
        emoji: parts[1]?.trim() || '💡',
        content: parts[2]?.trim() || '관련 정보를 제공합니다',
      };
    });

    const creativeDefaultHeadings = [
      {
        title: `${keyword} 시작하기 전 꼭 알아야 할 점`,
        emoji: '💡',
        content: '기초 지식을 제공합니다',
      },
      {
        title: `전문가가 추천하는 ${keyword} 활용법`,
        emoji: '👨‍💼',
        content: '전문가 팁을 공유합니다',
      },
      {
        title: `${keyword} 실패 사례와 해결책`,
        emoji: '⚠️',
        content: '실패를 예방하는 방법을 알려드립니다',
      },
      {
        title: `${keyword} 최신 트렌드 분석`,
        emoji: '📈',
        content: '최근 동향을 분석합니다',
      },
      {
        title: `${keyword} 비용 절약하는 꿀팁`,
        emoji: '💰',
        content: '경제적인 활용법을 제공합니다',
      },
      {
        title: `${keyword} 실제 후기와 평가`,
        emoji: '📝',
        content: '실사용자 후기를 공유합니다',
      },
      {
        title: `${keyword} 향후 전망과 발전 방향`,
        emoji: '🔮',
        content: '미래 전망을 분석합니다',
      },
    ];

    while (headings.length < 7) {
      const missingIndex = headings.length;
      if (missingIndex < creativeDefaultHeadings.length) {
        let defaultTitle = creativeDefaultHeadings[missingIndex].title;
        if (defaultTitle.length > 40) {
          defaultTitle = defaultTitle.substring(0, 37) + '...';
        }
        headings.push({
          ...creativeDefaultHeadings[missingIndex],
          title: defaultTitle,
        });
      } else {
        break;
      }
    }

    return headings;
  } catch (error) {
    console.error('동적 소제목 생성 오류:', error);

    const fallbackHeadings = [
      {
        title: `${keyword} 시작하기 전 준비사항`,
        emoji: '🚀',
        content: '시작 전 알아야 할 정보를 제공합니다',
      },
      {
        title: `${keyword} 선택할 때 고려사항`,
        emoji: '🤔',
        content: '올바른 선택을 위한 가이드입니다',
      },
      {
        title: `${keyword} 실제 사용 후기 분석`,
        emoji: '📊',
        content: '실사용자 경험을 분석합니다',
      },
      {
        title: `${keyword} 문제 발생 시 해결법`,
        emoji: '🔧',
        content: '문제 해결 방법을 제시합니다',
      },
      {
        title: `${keyword} 효과적인 활용 전략`,
        emoji: '💪',
        content: '효과를 극대화하는 방법입니다',
      },
      {
        title: `${keyword} 최신 업데이트 소식`,
        emoji: '📰',
        content: '최근 변화와 소식을 전달합니다',
      },
      {
        title: `${keyword} 향후 계획과 준비`,
        emoji: '📅',
        content: '미래를 위한 준비 방법입니다',
      },
    ].map((heading) => ({
      ...heading,
      title:
        heading.title.length > 40
          ? heading.title.substring(0, 37) + '...'
          : heading.title,
    }));

    return fallbackHeadings;
  }
};
