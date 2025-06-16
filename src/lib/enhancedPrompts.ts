
import { getColors } from './promptUtils';
import { getHtmlTemplate } from './htmlTemplate';
import { WebCrawlerService } from './webCrawler';

interface EnhancedArticlePromptParams {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink?: string;
  referenceSentence?: string;
  apiKey: string;
}

// 주제에서 핵심 키워드를 자연스럽게 추출하는 함수 (년도 절대 보존)
const extractNaturalKeyword = (topic: string): string => {
  // 년도는 절대 제거하지 않고, 필요한 단어만 정리
  return topic
    .replace(/지급|신청|방법|조건|자격|혜택|정보|안내|가이드|완벽|최신|최대한|확실하게|업법/g, '') // 일반적인 단어만 제거
    .replace(/\s+/g, ' ') // 연속 공백 정리
    .trim();
};

// 더 자연스러운 관련 용어 생성 함수
const generateNaturalContext = (naturalKeyword: string, originalKeyword: string): { [key: string]: string } => {
  const baseTerms = ['지원금', '혜택', '제도', '프로그램', '서비스'];
  const contextTerms = ['관련 지원', '이런 혜택', '해당 제도', '이 프로그램', '지원 서비스'];
  
  // 자연스러운 맥락적 표현들 생성
  return {
    INTRO_KEYWORD_CONTEXT: `${naturalKeyword} 관련 혜택`,
    CONTENT_KEYWORD_1: `${naturalKeyword} ${baseTerms[Math.floor(Math.random() * baseTerms.length)]}`,
    SECTION_CONTENT_1: `이 ${baseTerms[Math.floor(Math.random() * baseTerms.length)]}`,
    SECTION_CONTENT_2: `${naturalKeyword} 관련`,
    SECTION_CONTENT_3: `디지털플랫폼 활용`,
    SECTION_CONTENT_4: `이 지원금`,
    SECTION_CONTENT_5: `${naturalKeyword} 지원`,
    SECTION_CONTENT_6: `이런 혜택`,
    SECTION_CONTENT_7: `지원금`,
    SECTION_CONTENT_8: `해당 혜택`,
    SUMMARY_TITLE: naturalKeyword,
    REFERENCE_TEXT: '워드프레스 꿀팁 더 보러가기',
    GENERATED_TAGS: `${naturalKeyword}, ${naturalKeyword} 신청방법, ${naturalKeyword} 자격, 디지털플랫폼 활용 지원금, 2025년 정부지원금, 복지혜택, 생계급여`
  };
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
  const refLink = referenceLink || 'https://worldpis.com';
  
  // 주제에서 자연스러운 핵심 키워드 추출 (년도 절대 보존)
  const naturalKeyword = extractNaturalKeyword(topic);
  
  // 자연스러운 맥락적 표현들 생성
  const contextualTerms = generateNaturalContext(naturalKeyword, keyword);
  
  const htmlTemplate = getHtmlTemplate(colors, topic, naturalKeyword, refLink);
  const currentYear = new Date().getFullYear();

  // 웹 크롤링으로 최신 정보 및 공식 링크 수집
  const crawledInfo = await WebCrawlerService.crawlForKeyword(keyword, apiKey);

  return `
        당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.
        주제: "${topic}"
        입력 키워드: "${keyword}"
        자연스러운 키워드: "${naturalKeyword}"

        === 최신 웹 크롤링 정보 ===
        ${crawledInfo}
        === 크롤링 정보 끝 ===

        위의 크롤링된 최신 정보를 반드시 활용하여, 독자에게 실질적인 도움을 주는 완벽한 블로그 게시물을 작성해주세요.

        ⚠️ 절대 지켜야 할 핵심 규칙:
        
        **🚨 7개 H2 섹션 모두 작성 필수 🚨**
        HTML 템플릿에 있는 7개의 H2 섹션을 모두 풍부한 내용으로 작성해야 합니다:
        1. 핵심 정보와 기본 내용 완벽 정리
        2. 신청 방법 단계별 가이드  
        3. 지원 대상 및 자격 요건
        4. 지원 금액 및 혜택 내용
        5. 효과적인 활용법과 주의사항
        6. 실제 혜택과 기대 효과
        7. 자주 묻는 질문 FAQ
        
        **절대로 섹션을 건너뛰거나 생략하지 마세요!**
        
        1. **키워드 자연스러운 적용 (가장 중요)**: 
        - 원본 키워드 "${keyword}"를 그대로 강조하여 사용하지 마세요
        - 대신 자연스러운 키워드 "${naturalKeyword}"나 관련 용어를 사용하세요
        - 각 섹션에서는 아래 맥락적 표현들을 활용하세요:

        **사용할 맥락적 표현들:**
        - [INTRO_KEYWORD_CONTEXT] → "${contextualTerms.INTRO_KEYWORD_CONTEXT}"
        - [CONTENT_KEYWORD_1] → "${contextualTerms.CONTENT_KEYWORD_1}" 
        - [SECTION_CONTENT_1] → "${contextualTerms.SECTION_CONTENT_1}"
        - [SECTION_CONTENT_2] → "${contextualTerms.SECTION_CONTENT_2}"
        - [SECTION_CONTENT_3] → "${contextualTerms.SECTION_CONTENT_3}"
        - [SECTION_CONTENT_4] → "${contextualTerms.SECTION_CONTENT_4}"
        - [SECTION_CONTENT_5] → "${contextualTerms.SECTION_CONTENT_5}"
        - [SECTION_CONTENT_6] → "${contextualTerms.SECTION_CONTENT_6}"
        - [SECTION_CONTENT_7] → "${contextualTerms.SECTION_CONTENT_7}"
        - [SECTION_CONTENT_8] → "${contextualTerms.SECTION_CONTENT_8}"
        - [SUMMARY_TITLE] → "${contextualTerms.SUMMARY_TITLE}"
        - [REFERENCE_TEXT] → "${referenceSentence || contextualTerms.REFERENCE_TEXT}"
        - [GENERATED_TAGS] → "${contextualTerms.GENERATED_TAGS}"

        2. **지침용 텍스트 절대 금지**: [독자의 흥미를 유발하는...], [여기에 관련 정부기관 웹사이트 링크 삽입] 같은 지침용 대괄호 텍스트는 절대 그대로 출력하지 마세요.

        3. **공식 링크 필수 포함 및 하이퍼링크 적용 (매우 중요)**: 
        크롤링된 정보를 바탕으로 정부기관, 공공기관의 공식 웹사이트 링크를 본문에 최소 2-3개 반드시 **완전한 a 태그 형식**으로 삽입해주세요.
        
        **반드시 사용해야 할 올바른 링크 형식:**
        \`<a href="https://www.mw.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">보건복지부</a>\`

        4. **정보성 콘텐츠 중심**: 모든 소제목과 내용은 독자가 실제로 필요로 하는 구체적이고 실용적인 정보를 담아야 합니다.

        5. **자연스러운 키워드 강조**: 필요한 경우에만 "<strong>${naturalKeyword}</strong>" 형태로 1-2회 자연스럽게 강조하되, 억지로 반복하지 마세요.

        다음 지침에 따라 작성해주세요:
        - 출력 형식: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요. HTML 외에 다른 텍스트, 설명, 마크다운 형식을 포함하지 마세요.
        - **크롤링 정보 우선 활용**: 위에서 제공된 최신 웹 정보를 글의 근거로 최우선 활용해주세요.
        - 대상 독자: 한국어 사용자
        - **시의성**: 크롤링된 최신 정보를 반영하여 현재 년도(${currentYear}년)의 최신 상황을 자연스럽게 언급하세요.
        - **섹션별 글자수**: HTML 템플릿의 각 H2 소제목 아래 본문 내용은 **150자에서 190자 사이**로 작성해주세요.
        - 문체: 친근한 구어체('~해요', '~죠' 체)를 사용하고, 격식체('~입니다', '~습니다')는 사용하지 마세요.
        - 가독성: 각 단락은 최대 2-3개의 문장으로 구성해주세요.

        사용할 변수:
        - Primary Color: ${colors.primary}
        - Secondary Color: ${colors.secondary}
        - Text Highlight Color: ${colors.textHighlight}
        - Highlight Color: ${colors.highlight}
        - Highlight Border Color: ${colors.highlightBorder}
        - Warn BG Color: ${colors.warnBg}
        - Warn Border Color: ${colors.warnBorder}
        - Link Color: ${colors.link}
        - Reference Link: ${refLink}
        - Topic: ${topic}
        - Original Keyword: ${keyword}
        - Natural Keyword: ${naturalKeyword}

        아래는 반드시 따라야 할 HTML 템플릿입니다.
        
        --- HTML TEMPLATE START ---
${htmlTemplate}
--- HTML TEMPLATE END ---

        ⚠️ 재확인 사항:
        - **7개의 모든 H2 섹션을 빠짐없이 작성해야 합니다**
        - 대괄호 안의 지침 텍스트가 그대로 출력되면 안 됩니다
        - 원본 키워드 "${keyword}"를 그대로 강조하여 반복 사용하지 마세요
        - 자연스러운 키워드 "${naturalKeyword}"나 맥락적 표현을 사용하세요
        - 공식 링크가 최소 2-3개 포함되어야 하며, 반드시 완전한 a 태그 형식이어야 합니다
        - 모든 내용이 실제 정보성 콘텐츠여야 합니다
        - 크롤링된 정보를 최대한 활용해야 합니다
        - 링크는 절대로 "사이트명(URL)" 형식으로 작성하지 마세요
        - 모든 링크는 클릭 가능한 하이퍼링크로 작성해야 합니다
      `;
};

export const getEnhancedTopicPrompt = (keyword: string, count: number): string => {
  const currentYear = new Date().getFullYear();
  
  // 키워드에서 년도 정보 추출
  const yearMatch = keyword.match(/(\d{4})년?/);
  const hasYearInKeyword = yearMatch !== null;
  const extractedYear = yearMatch ? yearMatch[1] : null;
  
  if (hasYearInKeyword && extractedYear) {
    // 년도가 포함된 키워드인 경우
    return `'${keyword}'를(을) 주제로 블로그 포스팅 제목 ${count}개를 생성해 주세요.

**🚨 년도가 포함된 키워드 - 특별 지침 🚨**:

키워드에 "${extractedYear}년"이 포함되어 있으므로, 모든 제목은 반드시 "${extractedYear}년"으로 시작해야 합니다.

**절대적 형식 규칙**:
1. **첫 번째 단어**: "${extractedYear}년" (반드시 4자리숫자 + 년)
2. **두 번째 단어부터**: 핵심 키워드와 설명

**올바른 예시**:
✅ "${extractedYear}년 디지털플랫폼 지원금 신청방법"
✅ "${extractedYear}년 국민디지털지원금 자격조건"
✅ "${extractedYear}년 정부지원금 혜택내용"

**절대 금지**:
❌ "년 디지털플랫폼..." (숫자 없는 년)
❌ "디지털플랫폼 ${extractedYear}년..." (년도가 뒤에 위치)
❌ "${extractedYear} 디지털플랫폼..." (년 없이 숫자만)

**필수 생성 패턴** (이 중에서만 선택):
- "${extractedYear}년 [핵심키워드] 신청방법"
- "${extractedYear}년 [핵심키워드] 자격조건"
- "${extractedYear}년 [핵심키워드] 지원대상"
- "${extractedYear}년 [핵심키워드] 혜택내용"
- "${extractedYear}년 [핵심키워드] 최신정보"
- "${extractedYear}년 [핵심키워드] 완벽가이드"

**최종 검증**:
각 제목 생성 후 반드시 확인:
1. "${extractedYear}년"으로 시작하는가?
2. 핵심 키워드가 포함되었는가?
3. 의미있는 설명이 추가되었는가?

지금 즉시 위 규칙을 엄격히 따라 ${count}개의 제목을 생성해주세요.`;
  } else {
    // 년도가 포함되지 않은 일반 키워드인 경우
    return `'${keyword}'를(을) 주제로 블로그 포스팅 제목 ${count}개를 생성해 주세요.

**일반 키워드 생성 지침**:

키워드에 년도가 포함되어 있지 않으므로, 자연스러운 블로그 제목을 생성해주세요.

**생성 원칙**:
1. **키워드 포함**: '${keyword}' 관련 내용이 반드시 포함되어야 합니다
2. **실용성**: 독자에게 도움이 되는 실용적인 정보 제목
3. **SEO 최적화**: 검색에 최적화된 구체적인 제목
4. **다양성**: 다양한 관점에서 접근한 제목들

**추천 제목 패턴**:
- "[키워드] 완벽 가이드"
- "[키워드] 초보자를 위한 시작 방법"
- "[키워드] 노하우 및 팁"
- "[키워드] 추천 방법"
- "[키워드] 장단점 비교"
- "[키워드] 효과적인 활용법"
- "[키워드] 주의사항과 해결책"

**제목 예시** (${keyword} 기준):
- "${keyword} 초보자도 쉽게 시작하는 방법"
- "${keyword} 효과적인 활용을 위한 완벽 가이드"
- "${keyword} 성공을 위한 필수 노하우"

**최종 출력 규칙**:
- 번호나 불릿 포인트 없이 제목만 출력
- 각 제목은 줄바꿈으로 구분
- 다른 설명이나 주석 절대 금지

지금 즉시 위 지침에 따라 ${count}개의 자연스러운 제목을 생성해주세요.`;
  }
};
