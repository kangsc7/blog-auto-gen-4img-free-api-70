
// 지침 백업 및 복원 시스템
export const PROMPT_BACKUP_VERSION = "v1.0.0";
export const PROMPT_INTEGRITY_HASH = "enhanced_prompts_full_version";

// 핵심 지침 백업 - 절대 변경 금지
export const CORE_WRITING_GUIDELINES = {
  contentRequirements: {
    outputFormat: "반드시 HTML 코드 블록 하나로만 결과를 제공",
    contentOriginality: "완전히 새로운 관점과 독창적인 접근 방식 사용",
    readerCentric: "독자가 가장 궁금해하고 알고 싶어하는 정보 중심 구성",
    wordCount: "1400자에서 1900자 사이 엄격 준수"
  },
  structureRequirements: {
    title: "H1 태그로 작성, 밑줄이나 테두리 추가 금지",
    metaDescription: "제목 바로 아래 서술형 공감형 메타 설명 P 태그 2-3줄",
    subheadings: "H2 소제목은 주제 반복 금지, 연관 검색어나 실질적 질문들로 구성, 이모지 1개 추가"
  },
  visualElements: {
    summaryCard: `<div style="background: linear-gradient(135deg, {colors.highlight}, {colors.secondary}); border-left: 5px solid {colors.primary}; padding: 20px; margin: 25px 0; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">`,
    warningCard: `<div style="background: linear-gradient(135deg, {colors.warnBg}, #fff8e1); border-left: 5px solid {colors.warnBorder}; padding: 20px; margin: 25px 0; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">`
  },
  keywordOptimization: {
    density: "1.5% ~ 2.5% 키워드 밀도",
    emphasis: "각 H2 섹션별로 정확히 1번만 <strong>키워드</strong> 강조"
  },
  writingStyle: {
    tone: "친근한 구어체 (~해요, ~죠 체)",
    forbidden: "~입니다, ~습니다 격식체 절대 금지",
    paragraphs: "각 단락 최대 3개 문장"
  },
  linkRequirements: {
    external: "권위 있는 외부 사이트 링크 최소 2개 이상",
    format: '<a href="URL" target="_blank" rel="noopener" style="color: {colors.link}; text-decoration: underline;">링크텍스트</a>'
  },
  tagGeneration: {
    format: '<p style="text-align: center; font-size: 14px; color: #666; margin-top: 40px;" data-ke-size="size16">#태그1 #태그2 #태그3 #태그4 #태그5 #태그6 #태그7</p>',
    prohibition: "태그: 접두사 절대 포함 금지"
  }
};

// 지침 무결성 검증
export const validatePromptIntegrity = (promptContent: string): boolean => {
  const requiredElements = [
    "1400자에서 1900자 사이",
    "시각화 요약 카드",
    "주의 카드",
    "컬러 테마",
    "친근한 구어체",
    "H2 소제목",
    "핵심 포인트",
    "외부 링크 최소 2개",
    "태그 생성"
  ];
  
  return requiredElements.every(element => promptContent.includes(element));
};

// 지침 복원 함수
export const restorePromptIfCorrupted = (currentPrompt: string): string => {
  if (!validatePromptIntegrity(currentPrompt)) {
    console.warn('⚠️ 지침 무결성 검증 실패 - 백업에서 복원');
    return generateFullPromptFromBackup();
  }
  return currentPrompt;
};

// 백업에서 전체 지침 재생성
export const generateFullPromptFromBackup = (): string => {
  return `당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.

**핵심 작성 요구사항 (절대 변경 금지)**:

1. **출력 형식**: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요. HTML 외에 다른 텍스트, 설명, 마크다운 형식을 포함하지 마세요.

2. **콘텐츠 독창성**: 완전히 새로운 관점과 독창적인 접근 방식을 사용해야 합니다. 이전 글과 절대 중복되지 않는, 완전히 새로운 글을 생성해주세요.

3. **독자 중심 글쓰기**: 독자가 가장 궁금해하고, 알고 싶어하는 정보를 중심으로 구성해야 합니다.

4. **제목 및 시작 구조**:
   - 제목은 H1 태그로 작성하되, 밑줄이나 테두리는 추가하지 마세요
   - 제목 바로 아래에는 주제를 요약한 서술형 공감형 메타 설명을 P 태그로 추가하세요 (2-3줄 정도)

5. **소제목 최적화**: H2 소제목은 절대로 주제를 그대로 반복하지 마세요. 각 소제목 끝에 내용과 어울리는 이모지 1개를 추가하세요.

6. **시각적 요소 강화**: 핵심 내용을 강조하는 시각화 요약 카드와 주의사항 팁 카드를 적절히 배치하세요.

7. **콘텐츠 분량**: 전체 글자 수는 반드시 **1400자에서 1900자 사이**여야 합니다.

8. **키워드 활용**: 목표 키워드 밀도는 1.5% ~ 2.5%를 지향하며, 각 H2 섹션별로 정확히 1번만 <strong>키워드</strong>와 같이 강조해주세요.

9. **문체**: 친근한 구어체('~해요', '~죠' 체)를 사용해주세요. '~입니다', '~습니다'와 같은 격식체는 절대 사용하지 마세요.

10. **가독성 향상**: 각 단락은 최대 3개의 문장으로 구성하세요.

11. **내부/외부 링크**: 권위 있는 외부 사이트나 통계 자료로 연결되는 링크를 최소 2개 이상 포함해주세요.

12. **태그 생성**: '태그:' 라는 접두사를 절대 포함하지 말고, 다음 형식으로 글 끝에 추가하세요.`;
};
