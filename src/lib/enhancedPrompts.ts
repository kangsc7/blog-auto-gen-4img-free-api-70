
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

// 주제에서 핵심 키워드를 자연스럽게 추출하는 함수
const extractNaturalKeyword = (topic: string): string => {
  // 특정 패턴들을 더 자연스러운 키워드로 변환
  const patterns = [
    { pattern: /(\d+년)\s*(\d+만원)\s*(.+바우처)/i, replacement: '$3' },
    { pattern: /(\d+년)\s*(.+바우처)\s*(\d+만원)/i, replacement: '$2' },
    { pattern: /(.+바우처)\s*(\d+만원)\s*(\d+년)/i, replacement: '$1' },
    { pattern: /(\d+만원)\s*(.+바우처)\s*(\d+년)/i, replacement: '$2' },
    { pattern: /(\d+년)\s*(.+)\s*(\d+만원)/i, replacement: '$2' },
    { pattern: /(\d+만원)\s*(.+)\s*(\d+년)/i, replacement: '$2' },
    { pattern: /(.+)\s*(\d+년)\s*(\d+만원)/i, replacement: '$1' },
    { pattern: /(.+)\s*(\d+만원)\s*(\d+년)/i, replacement: '$1' },
    { pattern: /(\d+년)\s*(.+)/i, replacement: '$2' },
    { pattern: /(.+)\s*(\d+년)/i, replacement: '$1' },
    { pattern: /(\d+만원)\s*(.+)/i, replacement: '$2' },
    { pattern: /(.+)\s*(\d+만원)/i, replacement: '$1' },
  ];

  for (const { pattern, replacement } of patterns) {
    const match = topic.match(pattern);
    if (match) {
      const extracted = topic.replace(pattern, replacement).trim();
      if (extracted && extracted !== topic) {
        return extracted;
      }
    }
  }

  // 패턴 매칭이 안되는 경우 일반적인 정리
  return topic
    .replace(/\d+년/g, '') // 년도 제거
    .replace(/\d+만원?/g, '') // 금액 제거
    .replace(/지급|신청|방법|조건|자격|혜택|정보|안내|가이드/g, '') // 일반적인 단어 제거
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
    SECTION_CONTENT_3: `바우처 카드`,
    SECTION_CONTENT_4: `이 지원금`,
    SECTION_CONTENT_5: `${naturalKeyword} 지원`,
    SECTION_CONTENT_6: `이런 혜택`,
    SECTION_CONTENT_7: `지원금`,
    SECTION_CONTENT_8: `해당 혜택`,
    SUMMARY_TITLE: naturalKeyword,
    REFERENCE_TEXT: '워드프레스 꿀팁 더 보러가기',
    GENERATED_TAGS: `${naturalKeyword}, 2025년 ${naturalKeyword}, 70만원 지급, 에너지 지원금, 저소득층 ${naturalKeyword}, ${naturalKeyword} 신청방법, ${naturalKeyword} 자격, 전기요금 할인, 가스요금 지원, 난방비 지원, 복지혜택, 생계급여, 차상위계층 혜택`
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
  
  // 주제에서 자연스러운 핵심 키워드 추출
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
  
  return `'${keyword}'를(을) 주제로, ${currentYear}년 최신 정보를 반영하여 구글과 네이버 검색에 최적화된 블로그 포스팅 제목 ${count}개를 생성해 주세요. 

**핵심 키워드 보존 규칙 (매우 중요)**:
- 핵심 키워드 '${keyword}'의 모든 구성 요소를 절대 누락하지 마세요
- 각 제목에는 반드시 핵심 키워드인 '${keyword}'가 완전한 형태로 포함되어야 합니다
- 입력된 키워드와 관련 없는 다른 주제나 키워드는 절대 포함하지 마세요

**제목 생성 지침**:
- 각 제목은 사람들이 클릭하고 싶게 만드는 흥미로운 내용이어야 합니다
- 모든 제목은 반드시 한글로만 작성해야 하며, 한자(漢字)나 다른 언어는 절대 포함하지 마세요
- ${currentYear}년 최신 상황을 반영한 시의성 있는 제목으로 작성해주세요
- 결과는 각 제목을 줄바꿈으로 구분하여 번호 없이 텍스트만 제공해주세요
- 다른 설명 없이 주제 목록만 생성해주세요

**키워드 정확성 체크리스트**:
1. '${keyword}'의 모든 단어가 제목에 포함되었는가?
2. 키워드의 의미가 변질되지 않았는가?
3. 입력된 키워드와 무관한 내용이 포함되지 않았는가?

오직 입력된 키워드 '${keyword}'와 직접적으로 관련된 주제만 생성해주세요.`;
};
