import { getColors } from './promptUtils';
import { generateMetaDescription } from './pixabay';

interface EnhancedArticlePromptParams {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink: string;
  referenceSentence: string;
  apiKey: string;
}

const generateExternalReferencePrompt = (referenceLink: string, referenceSentence: string): string => {
  if (referenceLink && referenceSentence) {
    return `**[참고 자료]**:
- 링크: ${referenceLink}
- 문장: "${referenceSentence}" (이 문장을 참고하여 글의 신뢰도를 높이세요.)`;
  } else if (referenceLink) {
    return `**[참고 링크]**: ${referenceLink} (이 링크를 참고하여 글의 신뢰도를 높이세요.)`;
  } else if (referenceSentence) {
    return `**[참고 문장]**: "${referenceSentence}" (이 문장을 참고하여 글의 신뢰도를 높이세요.)`;
  }
  return '';
};

export const getEnhancedArticlePrompt = async ({
  topic,
  keyword,
  selectedColorTheme,
  referenceLink,
  referenceSentence,
  apiKey,
}: EnhancedArticlePromptParams): Promise<string> => {
  console.log('🎨 향상된 프롬프트 생성 시작:', { topic, keyword, selectedColorTheme });

  const { primary: primaryColor, secondary: secondaryColor } = getColors(selectedColorTheme);
  const externalReferencePrompt = generateExternalReferencePrompt(referenceLink, referenceSentence);

  return `당신은 전문적인 블로그 콘텐츠 작성자입니다. 아래 요구사항을 정확히 따라 고품질 블로그 글을 작성해주세요.

**🎯 주제**: ${topic}
**🔑 핵심 키워드**: ${keyword}
**🎨 컬러 테마**: ${selectedColorTheme} (Primary: ${primaryColor}, Secondary: ${secondaryColor})
${externalReferencePrompt}

**📝 필수 작성 규칙:**

1. **전체 구조**:
   - 매력적인 제목 (H1)
   - 서론 (150-200자)
   - 5-7개의 H2 소제목과 본문
   - 결론 (150-200자)

2. **H2 섹션 작성 규칙 (최고 우선순위)**:
   - 각 H2 섹션은 공백 포함 정확히 600-700자 사이로 작성
   - 설명이 150자를 초과하면 세 번째 마침표 이후 반드시 줄바꿈 및 공백 줄 추가
   - 줄바꿈 후 다시 150자 초과 시 세 번째 마침표 이후 줄바꿈 및 공백 줄 추가 (반복)
   - 각 문단은 <p> 태그로 감싸기
   - <p> 태그 사이에는 줄바꿈 추가

3. **필수 포함 요소** (각 H2 섹션마다):
   - 구체적인 사례 또는 통계 기반 인용
   - 독자 입장에서 느끼는 감정 또는 공감 지점
   - 전문가 또는 실사용자의 조언/팁
   - 실용적이고 완결형 정보 제공

4. **스타일링**:
   - 모든 텍스트는 왼쪽 정렬 (text-align: left)
   - H1: 색상 ${primaryColor}, 굵게, 중앙 정렬
   - H2: 색상 ${primaryColor}, 굵게, 왼쪽 정렬  
   - 강조 텍스트: <strong style="color: ${primaryColor};">
   - 배경색 강조: <span style="background-color: ${secondaryColor}; padding: 2px 6px; border-radius: 3px;">

5. **HTML 구조 예시**:
\`\`\`html
<article style="font-family: 'Noto Sans KR', sans-serif; line-height: 1.7; color: #333; text-align: left;">
  <h1 style="color: ${primaryColor}; text-align: center; font-size: 2.2em; font-weight: bold; margin: 30px 0;">[매력적인 제목]</h1>
  
  <div style="background: ${secondaryColor}; padding: 20px; border-radius: 10px; margin: 25px 0;">
    <p style="text-align: left; margin: 0; font-size: 1.1em;">서론 내용 (150-200자)</p>
  </div>

  <h2 style="color: ${primaryColor}; font-size: 1.6em; font-weight: bold; margin: 35px 0 20px 0; text-align: left;">[H2 소제목]</h2>
  
  <p style="text-align: left; margin: 15px 0; font-size: 1.05em;">첫 번째 문단 내용. 구체적인 사례와 통계를 포함하여 작성합니다. 예를 들어, 최근 조사에 따르면 85%의 사용자가 이 방법을 선호한다고 합니다.</p>
  
  <p style="text-align: left; margin: 15px 0; font-size: 1.05em;">두 번째 문단에서는 독자의 공감을 이끌어내는 내용을 포함합니다. 많은 분들이 이런 고민을 하실 텐데요, 실제로 전문가들은 이런 방법을 추천합니다.</p>

  [추가 H2 섹션들 반복]
  
  <div style="background: linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}25); padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid ${primaryColor};">
    <h3 style="color: ${primaryColor}; margin: 0 0 15px 0; text-align: left;">결론</h3>
    <p style="text-align: left; margin: 0; font-size: 1.05em;">결론 내용 (150-200자)</p>
  </div>
</article>
\`\`\`

**⚠️ 중요 준수사항:**
- H2 섹션은 반드시 600-700자 사이
- 150자 초과 시 세 번째 마침표 후 줄바꿈 (최우선 규칙)
- 모든 텍스트는 text-align: left 적용
- 실용적이고 완결형 정보 제공
- 검색 의도에 부합하는 깊이 있는 내용

이제 위 규칙을 정확히 따라 완성된 HTML 블로그 글을 작성해주세요.`;
};
