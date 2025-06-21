
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

**📝 필수 작성 규칙 (최고 우선순위):**

1. **전체 구조**:
   - 매력적인 제목 (H1)
   - 서론 (공백 포함 정확히 120-150자 이내 - 최고 우선순위)
   - 7개의 H2 소제목과 본문 (마지막은 "여러분도 할 수 있습니다" 류의 격려)
   - 테이블, 시각화 카드, 주의 카드, 태그만 포함

2. **H2 섹션 작성 규칙 (최고 우선순위)**:
   - 각 H2 섹션은 공백 포함 정확히 400-500자 사이로 작성
   - 설명이 150자를 초과하면 두 번째 또는 세 번째 마침표 이후(랜덤 선택) 반드시 줄바꿈 및 공백 줄 추가
   - 줄바꿈 후 다시 150자 초과 시 두 번째 또는 세 번째 마침표 이후(랜덤 선택) 줄바꿈 및 공백 줄 추가 (반복)
   - 각 문단은 <p> 태그로 감싸기
   - <p> 태그 사이에는 줄바꿈 추가

3. **H2 소제목 필수 규칙**:
   - 모든 H2 소제목 끝에 관련 이모지 추가 (최고 우선순위)
   - H2 소제목 바로 아래에 컬러테마 밑줄 추가
   - 7번째 H2는 반드시 주제에 맞는 "여러분도 할 수 있습니다" 류의 격려 내용

4. **필수 포함 요소** (각 H2 섹션마다):
   - 구체적인 사례 또는 통계 기반 인용
   - 독자 입장에서 느끼는 감정 또는 공감 지점
   - 전문가 또는 실사용자의 조언/팁
   - 실용적이고 완결형 정보 제공
   - 글 전체에 2-3개의 공식/공인 사이트를 자연스럽게 하이퍼링크로 추가 (URL 표기 금지)

5. **컬러 적용 규칙**:
   - 각 섹션당 중요한 키워드 1개에만 컬러 적용
   - 과도한 컬러 사용 금지

6. **시각적 요소 필수 포함**:
   - 비교표 또는 데이터 테이블 (2-6번째 소제목 사이에 위치)
   - 시각화 요약 카드 (7번째 소제목 바로 위에 위치)
   - 주의사항 카드 (2-6번째 소제목 사이에 위치)
   - 관련 태그 목록 (쉼표로 구분하여 7개만) - "관련 태그" 텍스트 없이 태그만 표시

7. **스타일링**:
   - 모든 텍스트는 왼쪽 정렬 (text-align: left)
   - H1: 색상 ${primaryColor}, 굵게, 중앙 정렬
   - H2: 색상 ${primaryColor}, 굵게, 왼쪽 정렬, 이모지 포함, 밑줄 추가
   - 강조 텍스트: <strong style="color: ${primaryColor};">
   - 배경색 강조: <span style="background-color: ${secondaryColor}; padding: 2px 6px; border-radius: 3px;">

8. **HTML 구조 예시**:
\`\`\`html
<article style="font-family: 'Noto Sans KR', sans-serif; line-height: 1.7; color: #333; text-align: left;">
  <h1 style="color: ${primaryColor}; text-align: center; font-size: 2.2em; font-weight: bold; margin: 30px 0;">[매력적인 제목]</h1>
  
  <div style="background: ${secondaryColor}; padding: 20px; border-radius: 10px; margin: 25px 0;">
    <p style="text-align: left; margin: 0; font-size: 1.1em;">서론 내용 (120-150자 이내)</p>
  </div>

  <h2 style="color: ${primaryColor}; font-size: 1.6em; font-weight: bold; margin: 35px 0 20px 0; text-align: left; border-bottom: 3px solid ${primaryColor}; padding-bottom: 8px;">[H2 소제목] 🎯</h2>
  
  <p style="text-align: left; margin: 15px 0; font-size: 1.05em;">첫 번째 문단 내용 (400-500자).</p>
  
  <!-- 비교 테이블 예시 (2-6번째 소제목 사이) -->
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd;">
    <thead style="background-color: ${primaryColor}; color: white;">
      <tr><th style="padding: 12px; text-align: left; border: 1px solid #ddd;">항목</th><th style="padding: 12px; text-align: left; border: 1px solid #ddd;">내용</th></tr>
    </thead>
    <tbody>
      <tr><td style="padding: 10px; border: 1px solid #ddd;">예시 1</td><td style="padding: 10px; border: 1px solid #ddd;">설명</td></tr>
    </tbody>
  </table>

  <!-- 주의사항 카드 (2-6번째 소제목 사이) -->
  <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
    <h4 style="color: #856404; margin: 0 0 10px 0;">⚠️ 주의사항</h4>
    <p style="color: #856404; margin: 0;">중요한 주의사항을 기재합니다.</p>
  </div>

  [추가 H2 섹션들 반복 - 총 7개]
  
  <!-- 시각화 요약 카드 (7번째 소제목 바로 위) -->
  <style>
  .single-summary-card-container {
      font-family: 'Noto Sans KR', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 25px 15px;
      background-color: ${secondaryColor}20;
      margin: 25px 0;
  }
  .single-summary-card {
      width: 100%;
      max-width: 700px;
      background-color: #ffffff;
      border-radius: 15px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      padding: 30px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid ${primaryColor}40;
      box-sizing: border-box;
  }
  .single-summary-card .card-header {
      display: flex;
      align-items: center;
      border-bottom: 2px solid ${primaryColor};
      padding-bottom: 15px;
      margin-bottom: 15px;
  }
  .single-summary-card .card-header-icon {
      font-size: 38px;
      color: ${primaryColor};
      margin-right: 16px;
  }
  .single-summary-card .card-header h3 {
      font-size: 28px;
      color: ${primaryColor};
      margin: 0;
      line-height: 1.3;
      font-weight: 700;
  }
  .single-summary-card .card-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      font-size: 18px;
      line-height: 1.7;
      color: #333;
  }
  .single-summary-card .card-content .section {
      margin-bottom: 12px;
      line-height: 1.7;
  }
  .single-summary-card .card-content .section:last-child {
      margin-bottom: 0;
  }
  .single-summary-card .card-content strong {
      color: ${primaryColor};
      font-weight: 600;
  }
  .single-summary-card .card-content .highlight {
      background-color: ${secondaryColor}60;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: bold;
  }
  .single-summary-card .card-footer {
      font-size: 15px;
      color: #777;
      text-align: center;
      padding-top: 15px;
      border-top: 1px dashed ${primaryColor}40;
      margin-top: auto;
  }
  </style>
  
  <div class="single-summary-card-container">
    <div class="single-summary-card">
      <div class="card-header">
        <span class="card-header-icon">💡</span>
        <h3>${keyword} 핵심 요약</h3>
      </div>
      <div class="card-content">
        <div class="section"><b>핵심 포인트 1:</b> <span class="highlight">주요 내용</span></div>
        <div class="section"><b>핵심 포인트 2:</b> <span class="highlight">주요 내용</span></div>
        <div class="section"><b>핵심 포인트 3:</b> <span class="highlight">주요 내용</span></div>
      </div>
      <div class="card-footer">이 정보로 더 나은 결과를 얻으세요!</div>
    </div>
  </div>

  <!-- 태그 섹션 (관련 태그 텍스트 없이) -->
  <div style="margin: 30px 0;">
    <p style="font-size: 16px; color: #666;">${keyword}, 관련태그1, 관련태그2, 관련태그3, 관련태그4, 관련태그5, 관련태그6</p>
  </div>
</article>
\`\`\`

**⚠️ 중요 준수사항 (최고 우선순위):**
- 서론은 반드시 120-150자 이내
- H2 섹션은 반드시 400-500자 사이
- 150자 초과 시 2~3번째 마침표 후 줄바꿈 (최우선 규칙)
- 모든 H2 소제목에 이모지 포함 및 컬러테마 밑줄
- 7번째 H2는 주제에 맞는 격려 내용
- 테이블, 시각화 카드, 주의카드, 태그 모두 포함
- 태그는 쉼표로 구분하여 7개 작성
- 결론 섹션 작성 금지
- 참고 자료 섹션 작성 금지
- 각 섹션당 중요 키워드 1개에만 컬러 적용
- 2-3개 공식/공인 사이트를 자연스럽게 하이퍼링크로 추가

이제 위 규칙을 정확히 따라 완성된 HTML 블로그 글을 작성해주세요.`;
};
