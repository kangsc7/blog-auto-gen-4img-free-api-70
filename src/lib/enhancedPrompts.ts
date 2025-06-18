
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
    GENERATED_TAGS: `${naturalKeyword}, ${naturalKeyword} 신청방법, ${naturalKeyword} 자격, 디지털플랫폼 활용 지원금, 정부지원금, 복지혜택, 생계급여`
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

**🚨 이미지 규격 및 alt 태그 - 필수 적용 🚨**
- 모든 이미지는 width="640" height="480" 속성이 포함되어야 합니다.
- 이미지에는 반드시 alt 태그를 넣고, 해당 섹션의 요약문을 alt 태그로 설정하세요.
- 이미지 CSS: style="max-width: 640px; height: 480px; object-fit: cover; display: block; margin-left: auto; margin-right: auto; border-radius: 8px;"

**🚨 금지어와 표현 제한 🚨**
- 웹사이트라는 단어 사용 금지 (예: "금융감독원 웹사이트" → "금융감독원")
- 연도 표기(2023년, 2024년 등) 사용 금지
- 하반기, 상반기와 같은 시기 표현 사용 금지
- "자세한 내용은 [기관명] 홈페이지를 참조하세요" 같은 문구 사용 금지

**🚨 시각적 요소 필수 포함 🚨**
- 반드시 여러 색상의 시각요약 카드와 비교표를 포함해야 합니다.
- 비교표는 ${colors.primary} 컬러를 헤더에 사용하여 통일성을 유지하세요.

**🚨 모바일 최적화 🚨**
- 모바일 사용자를 위해 좌우 여백을 최소화하세요.
- 모바일에서도 이미지와 표가 잘 보이도록 반응형으로 작성하세요.

제공된 HTML 템플릿을 사용하여 위의 규칙을 모두 준수하면서, 전문적이고 유익한 블로그 글을 작성해주세요. 미리 정의된 클래스와 스타일을 활용하여 일관된 디자인을 유지하세요.

최종 HTML 코드만 제공해주세요.
`;
};
