
// 🛡️ 블로그 글 지침 방어 시스템 - 절대 삭제/변경 금지

interface GuidelineValidation {
  isValid: boolean;
  missingElements: string[];
  timestamp: number;
}

// 핵심 지침 요소들 - 절대 변경 금지
export const CORE_GUIDELINES = {
  WORD_COUNT: "190자에서 250자 사이",
  KEYWORD_EMPHASIS: "<strong> 태그로 정확히 1번만 강조",
  COLOR_THEME: "선택된 컬러테마를 반드시 모든 스타일에 정확히 적용",
  VISUALIZATION_CARD: "티스토리 호환 시각화 요약 카드 필수 삽입",
  WARNING_CARD: "주의사항 카드 필수 삽입",
  TAG_GENERATION: "태그 생성 시 접두사 절대 포함하지 말고 쉼표로 구분",
  EXTERNAL_LINK: "외부 참조 링크 스타일 적용",
  TOPIC_STYLE: "주제 제목 H3 태그로 글 시작 부분에 반드시 포함",
  EMPATHY_BOX: "간단한 공감 박스 주제 제목 바로 다음에 반드시 포함"
} as const;

// 지침 무결성 검증 함수
export const validateGuidelines = (promptContent: string): GuidelineValidation => {
  const timestamp = Date.now();
  const missingElements: string[] = [];
  
  console.log('🛡️ 블로그 글 지침 무결성 검증 시작:', timestamp);
  
  // 각 핵심 지침 요소 검증
  Object.entries(CORE_GUIDELINES).forEach(([key, guideline]) => {
    if (!promptContent.includes(guideline)) {
      missingElements.push(`${key}: ${guideline}`);
      console.error(`❌ 누락된 지침: ${key}`);
    }
  });
  
  const isValid = missingElements.length === 0;
  
  console.log(`🛡️ 지침 무결성 검증 ${isValid ? '성공' : '실패'}:`, {
    검증된요소: Object.keys(CORE_GUIDELINES).length,
    누락된요소: missingElements.length,
    timestamp
  });
  
  if (!isValid) {
    console.error('🚨 누락된 지침들:', missingElements);
  }
  
  return {
    isValid,
    missingElements,
    timestamp
  };
};

// 지침 복구 함수
export const restoreGuidelines = (): string => {
  console.log('🔄 블로그 글 지침 복구 시작');
  
  const restoredGuidelines = `
🛡️ 복구된 핵심 블로그 글 지침 - 절대 삭제/변경 금지:

1. 글자수 제한: ${CORE_GUIDELINES.WORD_COUNT}
2. 키워드 강조: ${CORE_GUIDELINES.KEYWORD_EMPHASIS}
3. 컬러테마: ${CORE_GUIDELINES.COLOR_THEME}
4. 시각화 카드: ${CORE_GUIDELINES.VISUALIZATION_CARD}
5. 주의사항 카드: ${CORE_GUIDELINES.WARNING_CARD}
6. 태그 생성: ${CORE_GUIDELINES.TAG_GENERATION}
7. 외부 링크: ${CORE_GUIDELINES.EXTERNAL_LINK}
8. 주제 스타일: ${CORE_GUIDELINES.TOPIC_STYLE}
9. 공감 박스: ${CORE_GUIDELINES.EMPATHY_BOX}

⚠️ 이 지침들은 시스템의 핵심이며 절대로 변경되어서는 안 됩니다.
  `;
  
  console.log('✅ 블로그 글 지침 복구 완료');
  return restoredGuidelines;
};

// 지침 모니터링 함수
export const monitorGuidelines = (callback?: (validation: GuidelineValidation) => void) => {
  console.log('👁️ 블로그 글 지침 모니터링 시작');
  
  setInterval(() => {
    // enhancedPrompts.ts 파일 내용 확인 (가상적)
    const mockPromptContent = "블로그 글 프롬프트 내용...";
    const validation = validateGuidelines(mockPromptContent);
    
    if (!validation.isValid && callback) {
      callback(validation);
    }
  }, 10000); // 10초마다 검증
};

// 방어 시스템 활성화
export const activateGuidelineDefense = () => {
  console.log('🛡️ 블로그 글 지침 방어 시스템 활성화');
  
  // 로컬 스토리지에 방어 시스템 상태 저장
  localStorage.setItem('guideline_defense_active', 'true');
  localStorage.setItem('guideline_defense_timestamp', Date.now().toString());
  
  monitorGuidelines((validation) => {
    console.error('🚨 지침 무결성 위반 감지!', validation);
    
    // 자동 복구 시도
    const restored = restoreGuidelines();
    console.log('🔄 자동 복구 시도:', restored);
  });
  
  console.log('✅ 방어 시스템 활성화 완료');
};

// 방어 시스템 상태 확인
export const isGuidelineDefenseActive = (): boolean => {
  return localStorage.getItem('guideline_defense_active') === 'true';
};
