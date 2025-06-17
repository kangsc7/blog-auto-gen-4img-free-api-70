
import { getColors } from '@/lib/promptUtils';

interface EnhancedArticlePromptParams {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink: string;
  referenceSentence: string;
  apiKey: string;
}

export const getEnhancedTopicPrompt = (keyword: string, count: number): string => {
  const currentDate = new Date().toLocaleDateString('ko-KR');
  
  return `당신은 전문적인 블로그 주제 생성 전문가입니다. 다음 지침에 따라 SEO에 최적화된 고품질 블로그 주제들을 생성해주세요.

**핵심 키워드**: ${keyword}
**생성할 주제 수**: ${count}개
**현재 날짜**: ${currentDate}

다음 지침을 정확히 따라주세요:

1. **SEO 최적화**: 검색량이 높고 경쟁도가 적절한 롱테일 키워드 포함
2. **실용성**: 독자에게 실질적인 도움이 되는 정보성 주제
3. **최신성**: ${currentDate} 기준 최신 트렌드와 이슈 반영
4. **구체성**: 모호하지 않고 명확한 주제
5. **다양성**: 다양한 관점과 접근 방식 포함

**제외할 내용**:
- 과거 정치인이나 탄핵 관련 주제
- 3년 이상 된 오래된 이슈
- 너무 일반적이거나 광범위한 주제

각 주제는 다음 형식으로 작성해주세요:
- 35-50자 내외
- 핵심 키워드 "${keyword}" 자연스럽게 포함
- 독자의 궁금증을 자극하는 제목

응답은 각 주제를 새로운 줄에 작성해주세요.`;
};

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

  return `당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다. 다음 지침에 따라 독자의 마음을 움직이고 검색 엔진 상위 노출을 목표로 하는 완벽한 블로그 게시물을 작성해주세요.

**주제**: ${topic}
**핵심 키워드**: ${keyword}
**선택된 컬러 테마**: ${selectedColorTheme}
**컬러 설정**: ${JSON.stringify(colors)}
**참고 링크**: ${referenceLink}
**참고 문장**: ${referenceSentence}

**최신 정보 기반**:
${crawledData}

**독자 심리 분석 및 전개 흐름 (매우 중요)**:
독자가 이 글에 유입되는 이유를 정확히 파악하고 다음 3단계 감정 여정을 반영해주세요:

1. **정보 갈망 단계**: 독자는 "${keyword}"에 대한 구체적이고 실용적인 정보를 간절히 원합니다. 
   - 첫 번째, 두 번째 섹션에서 독자의 궁금증을 즉시 해소해주세요
   - "바로 이거야!"라는 느낌을 주는 핵심 정보를 앞쪽에 배치

2. **공감과 위로 단계**: 독자는 자신의 상황에 대한 이해와 위로를 원합니다.
   - 세 번째, 네 번째 섹션에서 독자의 어려움에 공감하고 격려해주세요
   - "나만 이런 고민을 하는 게 아니구나" 하는 안도감을 제공

3. **확신과 용기 단계**: 독자는 자신의 선택과 행동에 대한 확신을 원합니다.
   - 다섯 번째 섹션과 마무리에서 독자에게 용기와 희망을 주세요
   - "이제 자신있게 할 수 있겠다"는 마음이 들도록 마무리

**글의 전개 흐름과 감정적 연결 (매우 중요)**:
- 각 섹션은 독자의 감정 상태를 고려하여 순차적으로 전개
- 단순한 정보 나열이 아닌, 독자와의 감정적 소통에 집중
- 독자가 "이 글을 읽길 정말 잘했다"고 느낄 수 있는 깊이 있는 내용 구성

다음 HTML 구조와 스타일 지침을 정확히 따라주세요:

1. **전체 구조**: 
   - 최상위 div로 전체 내용을 감싸기
   - font-family: 'Noto Sans KR', sans-serif 적용
   - max-width: 800px, margin: 0 auto
   - 모바일 반응형 고려

2. **제목 (h1)**: 
   - color: ${colors.primary}
   - text-align: center
   - 밑줄 없이 깔끔하게 표시
   - 43자 이내로 SEO 최적화
   - 번호 넘버링 금지

3. **메타 설명 박스**:
   - background-color: ${colors.highlight}
   - border: 2px solid ${colors.primary}
   - padding: 25px, border-radius: 12px
   - 핵심 내용 요약 (50-70자)

4. **소제목 (h2)**: 
   - color: ${colors.primary}
   - border-left: 4px solid ${colors.primary}
   - padding-left: 15px
   - font-weight: bold
   - 관련 이모티콘 포함
   - **번호 넘버링 절대 금지** (1., 2., 3. 등 사용 금지)
   - 소제목 바로 위에 한 줄 공백 추가

5. **본문 작성 (매우 중요)**:
   - 모든 문단은 <p> 태그로 감싸기
   - 각 문단은 최대 3개 문장으로 구성
   - 연속 150자에 도달하면 두 번째 문장의 마침표(.)에서 </p>로 문단 종료하고 <p>로 새 문단 시작
   - 문단 사이에는 자동으로 여백이 생기도록 CSS 적용
   - 각 섹션별 글자수: 200-250자 이내

6. **테이블 삽입**:
   - 세 번째 섹션 뒤에 테이블 자동 삽입
   - 테마 색상 적용: border와 header 배경을 ${colors.primary}로
   - 테이블 내용은 해당 주제에 적합한 비교/정리 내용으로 구성
   - 모바일 반응형 고려

7. **주의사항 박스** (필요시):
   - background-color: ${colors.highlight}
   - border: 2px solid #d97706
   - border-left: 5px solid #d97706
   - padding: 18px, margin: 25px 0
   - border-radius: 10px
   - ⚠️ 아이콘 사용

8. **팁/알림 박스**:
   - background-color: ${colors.highlight}
   - border-left: 5px solid ${colors.primary}
   - 💡 또는 📌 아이콘 사용

9. **섹션 구성**:
   - 1-2번째: 핵심 정보 제공 (정보 갈망 해소)
   - 3-4번째: 공감과 이해 (감정적 연결)
   - 5번째: 격려와 용기 (확신 제공)

10. **FAQ 섹션**: 별도로 추가하지 않음

11. **마무리**:
    - 참고 링크 박스 (background: #fff8e1, border: 2px solid #ffb74d)
    - 참고 링크 텍스트: 22px, 굵은 글씨, 눈에 띄게 표시
    - 태그 7개 (핵심 키워드 중심, 최대 3단어, 콜론 사용 금지, 배경색 없이 쉼표로 구분)
    - 태그 바로 위에 한 줄 공백 추가

**작성 요구사항**:
- 한글 1500-2000자 분량 (기존 2500-3000자에서 단축)
- 친근한 대화체 사용 (~해요, ~죠 체)
- 최신 정보를 적극 활용
- 실용적이고 구체적인 정보 제공
- 각 섹션별로 중요 키워드 1개를 <strong> 태그로 굵게 표시
- SEO 최적화 (키워드 자연스럽게 분산)
- 모든 스타일은 인라인으로 적용
- PC/모바일 반응형 최적화
- 태그는 콜론 없이 핵심 단어만 사용, 쉼표로 구분

위 지침을 모두 반영하여 완성된 HTML 코드만 출력해주세요.`;
};
