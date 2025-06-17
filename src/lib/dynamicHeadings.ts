
interface DynamicHeading {
  title: string;
  emoji: string;
  content: string;
}

export const generateDynamicHeadings = async (keyword: string, topic: string, apiKey: string): Promise<DynamicHeading[]> => {
  const prompt = `
당신은 블로그 콘텐츠 전문가입니다. 

주제: "${topic}"
핵심 키워드: "${keyword}"

위 키워드와 주제에 대해 사람들이 실제로 궁금해하고 검색할 만한 7개의 소제목을 생성해주세요.

**생성 규칙:**
1. 각 소제목은 해당 키워드에 대한 실제 사용자 궁금증을 반영해야 합니다
2. 검색 의도를 고려한 실용적인 제목이어야 합니다
3. 적절한 이모지 1개를 포함해야 합니다
4. 1-5번째는 핵심 정보 섹션
5. 6번째는 용기와 응원을 주는 섹션
6. 7번째는 FAQ 섹션

**출력 형식:**
각 줄마다 다음 형식으로 출력해주세요:
제목|이모지|간단설명

예시:
${keyword} 기본 정보와 신청 자격|💡|${keyword}의 기본 개념과 누가 신청할 수 있는지 알아보세요
${keyword} 신청 방법 완벽 가이드|📝|단계별 신청 절차와 필요 서류를 상세히 안내합니다

지금 즉시 7개의 소제목을 생성해주세요:
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('소제목 생성 API 요청 실패');
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('소제목 생성 응답이 비어있습니다');
    }

    const lines = generatedText.split('\n').filter(line => line.trim() && line.includes('|'));
    
    const headings: DynamicHeading[] = lines.slice(0, 7).map(line => {
      const parts = line.split('|');
      return {
        title: parts[0]?.trim() || `${keyword} 관련 정보`,
        emoji: parts[1]?.trim() || '💡',
        content: parts[2]?.trim() || '관련 정보를 제공합니다'
      };
    });

    // 7개가 안 되면 기본 소제목으로 채우기
    while (headings.length < 7) {
      const defaultHeadings = [
        { title: `${keyword} 기본 정보 완벽 정리`, emoji: '💡', content: '기본 개념과 핵심 정보를 정리합니다' },
        { title: `${keyword} 신청 방법 가이드`, emoji: '📝', content: '신청 절차와 방법을 안내합니다' },
        { title: `${keyword} 자격 요건 확인`, emoji: '👥', content: '지원 대상과 자격을 확인합니다' },
        { title: `${keyword} 혜택 및 지원 내용`, emoji: '💰', content: '받을 수 있는 혜택을 알아봅니다' },
        { title: `${keyword} 활용 팁과 주의사항`, emoji: '⚠️', content: '효과적인 활용법을 제공합니다' },
        { title: `함께 성장하고 도전해요`, emoji: '🌟', content: '용기와 응원의 메시지를 전합니다' },
        { title: `자주 묻는 질문`, emoji: '❓', content: '궁금한 점들을 해결합니다' }
      ];
      
      const missingIndex = headings.length;
      if (missingIndex < defaultHeadings.length) {
        headings.push(defaultHeadings[missingIndex]);
      } else {
        break;
      }
    }

    return headings;
  } catch (error) {
    console.error('동적 소제목 생성 오류:', error);
    
    // 오류 시 기본 소제목 반환
    return [
      { title: `${keyword} 핵심 정보와 기본 내용`, emoji: '💡', content: '기본 정보를 정리합니다' },
      { title: `${keyword} 신청 방법 단계별 가이드`, emoji: '📝', content: '신청 절차를 안내합니다' },
      { title: `${keyword} 지원 대상 및 자격 요건`, emoji: '👥', content: '자격 요건을 확인합니다' },
      { title: `${keyword} 지원 금액 및 혜택 내용`, emoji: '💰', content: '혜택 내용을 설명합니다' },
      { title: `${keyword} 효과적인 활용법과 주의사항`, emoji: '⚠️', content: '활용 방법을 제공합니다' },
      { title: `함께 성장하고 도전해요`, emoji: '🌟', content: '용기와 응원의 메시지를 전합니다' },
      { title: `자주 묻는 질문 FAQ`, emoji: '❓', content: '자주 묻는 질문에 답합니다' }
    ];
  }
};
