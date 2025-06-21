
import { getColors } from './promptUtils';

interface Variation {
  id: string;
  label: string;
  description: string;
}

interface VariationSystem {
  id: string;
  label: string;
  variations: Variation[];
}

const perspectiveVariations: VariationSystem = {
  id: 'perspective',
  label: '관점',
  variations: [
    { id: 'expert', label: '전문가', description: '전문적인 지식과 분석을 제공합니다.' },
    { id: 'user', label: '사용자', description: '실제 사용 경험과 팁을 공유합니다.' },
    { id: 'neutral', label: '중립적', description: '객관적인 정보와 균형 잡힌 시각을 제공합니다.' },
  ],
};

const styleVariations: VariationSystem = {
  id: 'style',
  label: '스타일',
  variations: [
    { id: 'persuasive', label: '설득적', description: '독자의 행동을 유도하는 강력한 메시지를 전달합니다.' },
    { id: 'informative', label: '정보 제공', description: '명확하고 유용한 정보를 체계적으로 제공합니다.' },
    { id: 'storytelling', label: '스토리텔링', description: '흥미로운 이야기와 예시를 통해 메시지를 전달합니다.' },
  ],
};

interface EnhancedPromptParams {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink?: string;
  referenceSentence?: string;
  apiKey?: string;
}

export const getRandomVariation = (variationSystem: VariationSystem): Variation => {
  const randomIndex = Math.floor(Math.random() * variationSystem.variations.length);
  return variationSystem.variations[randomIndex];
};

export const getEnhancedArticlePrompt = async ({
  topic,
  keyword,
  selectedColorTheme,
  referenceLink,
  referenceSentence,
  apiKey,
}: EnhancedPromptParams): Promise<string> => {
  console.log('🎯 Enhanced Article Prompt 생성 시작:', { topic, keyword, selectedColorTheme });
  
  const selectedPerspective = getRandomVariation(perspectiveVariations).id;
  const selectedStyle = getRandomVariation(styleVariations).id;

  const colors = getColors(selectedColorTheme);
  
  // 강화된 H2 섹션 글자수 지침 (370-470자)
  const sectionLengthGuideline = `
🔥 **H2 섹션별 글자수 강력한 지침 (최고 우선순위)**:
- 각 H2 소제목 아래 본문은 **반드시 공백 포함 370자에서 470자 사이**로 작성
- 140자 초과 시 **두 번째 마침표(.) 이후 자동 줄바꿈 + <br><br> 삽입** (최고 우선순위)
- 사례, 통계, 전문가 조언, 실용적 팁을 풍부하게 포함
- 독자가 '완결형 정보'라고 느낄 수 있는 깊이 있는 설명
- 검색 목적에 부합하는 실용성과 전문성 확보
- 각 문단은 <p> 태그로 감싸고, <p> 태그 사이에는 줄바꿈 추가
- 모든 텍스트는 왼쪽 정렬(text-align: left) 강제 적용
`;

  const prompt = `
당신은 블로그 글 작성 전문가입니다. 다음 조건을 **최고 우선순위로 강력하게 준수**하여 고품질 블로그 글을 작성해주세요.

**주제**: ${topic}
**핵심 키워드**: ${keyword}
**선택된 컬러 테마**: ${selectedColorTheme}
**프라이머리 색상**: ${colors.primary}
**세컨더리 색상**: ${colors.secondary}
**외부 참조 링크**: ${referenceLink || '없음'}
**참조 문장**: ${referenceSentence || '없음'}

${sectionLengthGuideline}

**🎨 창의적 변주 시스템 적용**:
선택된 관점: ${selectedPerspective}
선택된 스타일: ${selectedStyle}

**📝 글 구성 요구사항**:

1. **제목**: H1 태그로 감싸고 ${keyword}를 자연스럽게 포함
2. **인트로**: 150-200자 내외의 흥미로운 도입부
3. **H2 소제목 6개**: 각각 ${keyword}와 관련된 구체적이고 검색 친화적인 제목
4. **각 H2 섹션**: ${sectionLengthGuideline}에 따라 370-470자의 풍부한 내용
5. **결론**: 100-150자 내외의 정리 및 마무리
6. **주의사항**: ${topic}와 직접 관련된 구체적이고 실용적인 주의사항
7. **태그**: 관련 키워드 5-7개

**🎯 내용 품질 기준**:
- 각 H2 섹션마다 구체적인 사례, 통계, 전문가 조언 포함
- 독자 공감대 형성을 위한 감정적 요소 포함
- 실사용자 팁과 실용적 정보 제공
- 검색 의도에 부합하는 완결형 콘텐츠 구성
- 140자 초과 시 두 번째 마침표 이후 자동 줄바꿈 + <br><br> 필수 적용

**🎨 스타일 지침**:
- 모든 텍스트 왼쪽 정렬 (text-align: left) 강제 적용
- H2 제목에 ${colors.primary} 색상 적용
- 강조 텍스트에 ${colors.secondary} 배경 적용
- 각 문단은 <p> 태그로 감싸고 줄바꿈 추가
- 18px 폰트 크기, 1.7 줄간격 유지

**🔗 외부 링크 처리**:
${referenceLink ? `
참조 링크를 태그 섹션 바로 위에 다음과 같이 추가:
<p style="text-align: center; font-size: 18px; margin-bottom: 30px;" data-ke-size="size16">
  <b>이 글과 관련된 다른 정보가 궁금하다면?</b><br />
  <a style="color: ${colors.primary}; text-decoration: underline; font-weight: bold;" href="${referenceLink}" target="_blank" rel="noopener">
    <b>${referenceSentence || '👉 워드프레스 꿀팁 더 보러가기'}</b>
  </a>
</p>
` : ''}

**⚠️ 중요 준수사항**:
1. H2 섹션은 반드시 370-470자 (공백 포함)
2. 140자 초과 시 두 번째 마침표 이후 줄바꿈 + <br><br> 필수
3. 모든 텍스트 왼쪽 정렬 적용
4. 구체적이고 실용적인 내용으로 구성
5. ${topic}에 맞는 실제적인 주의사항 작성

지금 바로 위 조건을 **최고 우선순위로 강력하게 적용**하여 완성된 HTML 블로그 글을 작성해주세요.
`;

  console.log('✅ Enhanced Article Prompt 생성 완료');
  return prompt;
};
