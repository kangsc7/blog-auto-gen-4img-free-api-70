
import { getColors } from './promptUtils';
import { getHtmlTemplate } from './htmlTemplate';
import { generateDynamicHeadings } from './dynamicHeadings';
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
  
  // 동적 소제목 생성 (5개로 축소)
  console.log('동적 소제목 생성 시작:', keyword, topic);
  const dynamicHeadings = await generateDynamicHeadings(keyword, topic, apiKey);
  console.log('생성된 동적 소제목:', dynamicHeadings);
  
  // 5개 섹션만 사용하도록 조정
  const selectedHeadings = dynamicHeadings.slice(0, 5);
  
  const htmlTemplate = getHtmlTemplate(colors, topic, naturalKeyword, refLink, referenceSentence, selectedHeadings);
  const currentYear = new Date().getFullYear();

  // 웹 크롤링으로 최신 정보 및 공식 링크 수집
  const crawledInfo = await WebCrawlerService.crawlForKeyword(keyword, apiKey);

  return `
당신은 전문 블로그 카피라이터입니다.
주제: "${topic}"
입력 키워드: "${keyword}"
자연스러운 키워드: "${naturalKeyword}"

=== 최신 웹 정보 ===
${crawledInfo}

=== 동적 소제목 ===
${selectedHeadings.map((h, i) => `${i + 1}. ${h.title} ${h.emoji} - ${h.content}`).join('\n')}

🚨 핵심 규칙 🚨

**절대적 글자수 제한 (토큰 초과 방지):**
- 각 H2 섹션: 정확히 150-180자 (절대 초과 금지)
- 전체 글: 최대 1000자 이내
- 태그 섹션까지 반드시 포함되도록 조절

**6개 H2 섹션 구성:**
1-5섹션: 동적 생성된 소제목 사용
6섹션: "더 자세한 세부 정보가 필요하시요? 🌟" (고정)

**필수 포함 요소:**
- 3섹션: 주의사항 카드
- 5섹션: FAQ 카드 (질문 2개만)
- 마지막: 태그 섹션 필수

**키워드 사용:**
- 원본 키워드 "${keyword}" 직접 사용 금지
- 자연스러운 키워드 "${naturalKeyword}" 사용
- 각 섹션당 1회만 자연스럽게 포함

**링크 규칙:**
- 공식 사이트 링크 3-4개만
- 하이퍼링크 형태: <a href="URL" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">사이트명</a>

**맥락적 표현 사용:**
- [INTRO_KEYWORD_CONTEXT] → "${contextualTerms.INTRO_KEYWORD_CONTEXT}"
- [CONTENT_KEYWORD_1] → "${contextualTerms.CONTENT_KEYWORD_1}" 
- [SECTION_CONTENT_1] → "${contextualTerms.SECTION_CONTENT_1}"
- [SECTION_CONTENT_2] → "${contextualTerms.SECTION_CONTENT_2}"
- [SECTION_CONTENT_3] → "${contextualTerms.SECTION_CONTENT_3}"
- [SECTION_CONTENT_4] → "${contextualTerms.SECTION_CONTENT_4}"
- [SECTION_CONTENT_5] → "${contextualTerms.SECTION_CONTENT_5}"
- [SECTION_CONTENT_6] → "${contextualTerms.SECTION_CONTENT_5}"
- [SUMMARY_TITLE] → "${contextualTerms.SUMMARY_TITLE}"
- [GENERATED_TAGS] → "${contextualTerms.GENERATED_TAGS}"

**출력 규칙:**
- HTML만 출력, 다른 텍스트 금지
- 친근한 구어체 ('~해요', '~죠')
- 격식체 ('~입니다', '~습니다') 절대 금지

**변수:**
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
- Natural Keyword: ${naturalKeyword}

HTML 템플릿:
${htmlTemplate}

⚠️ 최종 체크:
- 150-180자/섹션 엄수
- 6개 H2 섹션 완성
- 태그 섹션 필수 포함
- 전체 1000자 이내
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
