
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

const extractNaturalKeyword = (topic: string): string => {
  return topic
    .replace(/지급|신청|방법|조건|자격|혜택|정보|안내|가이드|완벽|최신|최대한|확실하게|업법/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const generateNaturalContext = (naturalKeyword: string, originalKeyword: string): { [key: string]: string } => {
  const baseTerms = ['지원금', '혜택', '제도', '프로그램', '서비스'];
  const contextTerms = ['관련 지원', '이런 혜택', '해당 제도', '이 프로그램', '지원 서비스'];
  
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
  
  const naturalKeyword = extractNaturalKeyword(topic);
  const contextualTerms = generateNaturalContext(naturalKeyword, keyword);
  
  console.log('동적 소제목 생성 시작 (40자 제한):', keyword, topic);
  const dynamicHeadings = await generateDynamicHeadings(keyword, topic, apiKey);
  console.log('생성된 동적 소제목 (40자 제한):', dynamicHeadings.map(h => `${h.title} (${h.title.length}자)`));
  
  const selectedHeadings = dynamicHeadings.slice(0, 5);
  const htmlTemplate = getHtmlTemplate(colors, topic, naturalKeyword, refLink, referenceSentence, selectedHeadings);
  const currentYear = new Date().getFullYear();

  const crawledInfo = await WebCrawlerService.crawlForKeyword(keyword, apiKey);

  return `
당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.
주제: "${topic}"
입력 키워드: "${keyword}"
자연스러운 키워드: "${naturalKeyword}"

=== 최신 웹 크롤링 정보 ===
${crawledInfo}
=== 크롤링 정보 끝 ===

=== 동적 생성된 소제목 정보 (40자 제한 적용) ===
${selectedHeadings.map((h, i) => `${i + 1}. ${h.title} ${h.emoji} (${h.title.length}자) - ${h.content}`).join('\n')}
=== 동적 소제목 정보 끝 ===

⚠️ 절대 지켜야 할 핵심 규칙:

**🚨 주제와 내용 일치성 - 최우선 준수 사항 🚨**
글의 모든 내용은 반드시 주제 "${topic}"와 정확히 일치해야 합니다.

**🚨 전체 글자수 제한 - 절대 준수 사항 🚨**
전체 글자수는 공백 포함 4,350자를 절대 초과해서는 안 됩니다.
**각 H2 섹션의 본문은 정확히 200자에서 270자 사이로 작성**해야 합니다.

**🚨 6개 H2 섹션으로 구성 🚨**
1-5번째 섹션: 동적 생성된 소제목 사용
6번째 섹션: "더 자세한 세부 정보가 필요하시요? 🌟" (고정)

**🚨 FAQ와 주의사항 카드 필수 추가 🚨**
- 3번째 섹션에는 반드시 주의사항 카드를 추가 (3개 항목)
- 5번째 섹션에만 FAQ 카드를 추가 (3개 질문과 답변)

**🚨 공식 사이트 자동 링크 연결 - 필수 적용 🚨**
본문에 주제와 관련된 공식 사이트 링크를 3-5개 자연스럽게 포함해주세요.
반드시 다음 형식으로 작성하세요:
- 정부24: <a href="https://www.gov.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">정부24</a>
- 복지로: <a href="https://www.bokjiro.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">복지로</a>
- 보건복지부: <a href="https://www.mohw.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">보건복지부</a>
- 고용노동부: <a href="https://www.moel.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">고용노동부</a>
- 국세청: <a href="https://www.nts.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">국세청</a>

**🚨 문단 구성 및 가독성 규칙 🚨**
140글자 내외에서 2-3문장이 끝나면 반드시 </p> 태그로 닫고 새로운 <p> 태그로 시작하세요.
각 <p> 태그 사이에는 반드시 공백 줄바꿈을 추가하세요: <p style="height: 20px;">&nbsp;</p>

**🚨 고급 정보 제공 의무 🚨**
각 섹션에서는 다음을 반드시 포함해야 합니다:
- 구체적인 수치 데이터 (금액, 비율, 기간 등)
- 실제 적용 사례 또는 예시  
- 단계별 실행 방법
- 전문가만 아는 숨겨진 팁
- 주의해야 할 함정이나 놓치기 쉬운 포인트

다음 지침에 따라 작성해주세요:
- 출력 형식: 반드시 HTML 코드 블록 하나로만 결과를 제공
- 크롤링 정보 우선 활용: 위에서 제공된 최신 웹 정보를 글의 근거로 최우선 활용
- 대상 독자: 한국어 사용자
- 시의성: 크롤링된 최신 정보를 반영하여 현재 년도(${currentYear}년)의 최신 상황을 자연스럽게 언급
- 문체: 친근한 구어체('~해요', '~죠' 체) 사용
- 가독성: 140글자마다 2-3문장 끝에서 </p> 태그로 닫고 새로운 <p> 태그로 시작

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

아래는 반드시 따라야 할 HTML 템플릿입니다:

${htmlTemplate}`;
};
