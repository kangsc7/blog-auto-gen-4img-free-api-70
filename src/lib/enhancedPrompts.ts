
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
   - 서론 (공백 포함 정확히 120-150자 이내)
   - 5-7개의 H2 소제목과 본문
   - 결론 (120-150자)
   - 테이블, 시각화 카드, 주의 카드, 태그, 외부링크 포함

2. **H2 섹션 작성 규칙 (최고 우선순위)**:
   - 각 H2 섹션은 공백 포함 정확히 50-600자 사이로 작성
   - 설명이 150자를 초과하면 두 번째 또는 세 번째 마침표 이후(랜덤 선택) 반드시 줄바꿈 및 공백 줄 추가
   - 줄바꿈 후 다시 150자 초과 시 두 번째 또는 세 번째 마침표 이후(랜덤 선택) 줄바꿈 및 공백 줄 추가 (반복)
   - 각 문단은 <p> 태그로 감싸기
   - <p> 태그 사이에는 줄바꿈 추가

3. **필수 포함 요소** (각 H2 섹션마다):
   - 구체적인 사례 또는 통계 기반 인용
   - 독자 입장에서 느끼는 감정 또는 공감 지점
   - 전문가 또는 실사용자의 조언/팁
   - 실용적이고 완결형 정보 제공

4. **시각적 요소 필수 포함**:
   - 비교표 또는 데이터 테이블 (최소 1개)
   - 시각화 요약 카드 (핵심 포인트 정리)
   - 주의사항 카드 (경고 또는 팁)
   - 관련 태그 목록
   - 참고 외부링크 (신뢰할 수 있는 출처)

5. **스타일링**:
   - 모든 텍스트는 왼쪽 정렬 (text-align: left)
   - H1: 색상 ${primaryColor}, 굵게, 중앙 정렬
   - H2: 색상 ${primaryColor}, 굵게, 왼쪽 정렬  
   - 강조 텍스트: <strong style="color: ${primaryColor};">
   - 배경색 강조: <span style="background-color: ${secondaryColor}; padding: 2px 6px; border-radius: 3px;">

6. **HTML 구조 예시**:
\`\`\`html
<article style="font-family: 'Noto Sans KR', sans-serif; line-height: 1.7; color: #333; text-align: left;">
  <h1 style="color: ${primaryColor}; text-align: center; font-size: 2.2em; font-weight: bold; margin: 30px 0;">[매력적인 제목]</h1>
  
  <div style="background: ${secondaryColor}; padding: 20px; border-radius: 10px; margin: 25px 0;">
    <p style="text-align: left; margin: 0; font-size: 1.1em;">서론 내용 (120-150자 이내)</p>
  </div>

  <h2 style="color: ${primaryColor}; font-size: 1.6em; font-weight: bold; margin: 35px 0 20px 0; text-align: left;">[H2 소제목]</h2>
  
  <p style="text-align: left; margin: 15px 0; font-size: 1.05em;">첫 번째 문단 내용. 구체적인 사례와 통계를 포함하여 작성합니다.</p>
  
  <p style="text-align: left; margin: 15px 0; font-size: 1.05em;">두 번째 문단에서는 독자의 공감을 이끌어내는 내용을 포함합니다.</p>

  <!-- 비교 테이블 예시 -->
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd;">
    <thead style="background-color: ${primaryColor}; color: white;">
      <tr><th style="padding: 12px; text-align: left; border: 1px solid #ddd;">항목</th><th style="padding: 12px; text-align: left; border: 1px solid #ddd;">내용</th></tr>
    </thead>
    <tbody>
      <tr><td style="padding: 10px; border: 1px solid #ddd;">예시 1</td><td style="padding: 10px; border: 1px solid #ddd;">설명</td></tr>
    </tbody>
  </table>

  <!-- 시각화 요약 카드 -->
  <div style="background: linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}25); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${primaryColor};">
    <h4 style="color: ${primaryColor}; margin: 0 0 10px 0;">핵심 포인트</h4>
    <ul style="margin: 0; padding-left: 20px;">
      <li>주요 내용 1</li>
      <li>주요 내용 2</li>
      <li>주요 내용 3</li>
    </ul>
  </div>

  <!-- 주의사항 카드 -->
  <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
    <h4 style="color: #856404; margin: 0 0 10px 0;">⚠️ 주의사항</h4>
    <p style="color: #856404; margin: 0;">중요한 주의사항을 기재합니다.</p>
  </div>

  [추가 H2 섹션들 반복]
  
  <div style="background: linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}25); padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid ${primaryColor};">
    <h3 style="color: ${primaryColor}; margin: 0 0 15px 0; text-align: left;">결론</h3>
    <p style="text-align: left; margin: 0; font-size: 1.05em;">결론 내용 (120-150자)</p>
  </div>

  <!-- 태그 섹션 -->
  <div style="margin: 30px 0;">
    <h4 style="color: ${primaryColor}; margin: 0 0 15px 0;">관련 태그</h4>
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      <span style="background: ${secondaryColor}; color: ${primaryColor}; padding: 5px 12px; border-radius: 20px; font-size: 0.9em;">#${keyword}</span>
      <span style="background: ${secondaryColor}; color: ${primaryColor}; padding: 5px 12px; border-radius: 20px; font-size: 0.9em;">#관련태그1</span>
      <span style="background: ${secondaryColor}; color: ${primaryColor}; padding: 5px 12px; border-radius: 20px; font-size: 0.9em;">#관련태그2</span>
    </div>
  </div>

  <!-- 참고 링크 -->
  <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
    <h4 style="color: ${primaryColor}; margin: 0 0 15px 0;">참고 자료</h4>
    <ul style="margin: 0; padding-left: 20px;">
      <li><a href="#" style="color: ${primaryColor}; text-decoration: none;">관련 자료 1</a></li>
      <li><a href="#" style="color: ${primaryColor}; text-decoration: none;">관련 자료 2</a></li>
    </ul>
  </div>
</article>
\`\`\`

**⚠️ 중요 준수사항:**
- 서론은 반드시 120-150자 이내
- H2 섹션은 반드시 50-600자 사이
- 150자 초과 시 2~3번째 마침표 후 줄바꿈 (최우선 규칙)
- 테이블, 시각화 카드, 주의카드, 태그, 외부링크 모두 포함
- 모든 텍스트는 text-align: left 적용
- 실용적이고 완결형 정보 제공
- 검색 의도에 부합하는 깊이 있는 내용

이제 위 규칙을 정확히 따라 완성된 HTML 블로그 글을 작성해주세요.`;
};
