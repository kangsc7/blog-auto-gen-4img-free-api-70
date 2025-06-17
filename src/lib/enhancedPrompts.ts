
import { getColors } from '@/lib/promptUtils';

interface EnhancedArticlePromptParams {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink: string;
  referenceSentence: string;
  apiKey: string;
}

export const getEnhancedArticlePrompt = async ({
  topic,
  keyword,
  selectedColorTheme,
  referenceLink,
  referenceSentence,
  apiKey,
}: EnhancedArticlePromptParams): Promise<string> => {
  
  const colors = getColors(selectedColorTheme);
  
  // 웹 크롤링 대신 최신 정보 기반 프롬프트 생성
  const currentDate = new Date().toLocaleDateString('ko-KR');
  let crawledData = `${currentDate} 기준 최신 정보를 반영하여 ${keyword}에 대한 정확하고 실용적인 내용을 작성합니다.`;

  return `당신은 전문적인 블로그 작성자입니다. 다음 지침에 따라 SEO에 최적화된 고품질 블로그 글을 작성해주세요.

**주제**: ${topic}
**핵심 키워드**: ${keyword}
**선택된 컬러 테마**: ${selectedColorTheme}
**컬러 설정**: ${JSON.stringify(colors)}
**참고 링크**: ${referenceLink}
**참고 문장**: ${referenceSentence}

**최신 정보 기반**:
${crawledData}

다음 HTML 구조와 스타일 지침을 정확히 따라주세요:

1. **전체 구조**: 
   - 최상위 div로 전체 내용을 감싸기
   - font-family: 'Noto Sans KR', sans-serif 적용
   - max-width: 800px, margin: 0 auto
   - 모바일 반응형 고려

2. **제목 (h1)**: 
   - color: ${colors.primary}
   - text-align: center
   - border-bottom: 3px solid ${colors.primary}
   - 43자 이내로 SEO 최적화

3. **메타 설명 박스**:
   - background-color: ${colors.highlight}
   - border: 2px solid ${colors.primary}
   - padding: 20px, border-radius: 10px
   - 핵심 내용 요약 (50-70자)

4. **소제목 (h2)**: 
   - color: ${colors.primary}
   - border-left: 4px solid ${colors.primary}
   - padding-left: 15px
   - font-weight: bold
   - 관련 이모티콘 포함

5. **주의사항 박스** (필요시):
   - background-color: ${colors.highlight}
   - border: 2px solid #ffc107
   - border-left: 5px solid #ffc107
   - padding: 18px, margin: 25px 0
   - border-radius: 10px
   - ⚠️ 아이콘 사용

6. **팁/알림 박스**:
   - background-color: ${colors.highlight}
   - border-left: 5px solid ${colors.primary}
   - 💡 또는 📌 아이콘 사용

7. **시각화 카드**: 5번째 섹션 후에 배치
   - 테마 색상 적용한 요약 카드
   - 모바일 반응형 CSS 포함

8. **섹션 구성**:
   - 1-5번째: 주요 내용 섹션 (각 섹션마다 중요 키워드 1개를 <strong> 태그로 굵게 표시)
   - 6번째: 용기와 응원을 주는 감동적인 섹션
   - 7번째: FAQ 섹션

9. **FAQ 섹션**:
   - h2 제목 사용
   - Q: 굵게, A: padding-left: 18px
   - 최소 3개 이상의 Q&A

10. **마무리**:
    - 참고 링크 박스 (background: #fff8e1, border: 2px solid #ffb74d)
    - 태그 7개 (핵심 키워드 중심, 최대 3단어, 콜론(:) 사용 금지)

**작성 요구사항**:
- 한글 2500-3000자 분량
- 친근한 대화체 사용
- 최신 정보를 적극 활용
- 실용적이고 구체적인 정보 제공
- 각 섹션별로 중요 키워드 1개를 <strong> 태그로 굵게 표시
- SEO 최적화 (키워드 자연스럽게 분산)
- 모든 스타일은 인라인으로 적용
- 태그는 콜론(:) 없이 핵심 단어만 사용

위 지침을 모두 반영하여 완성된 HTML 코드만 출력해주세요.`;
};
