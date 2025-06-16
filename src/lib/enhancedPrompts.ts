
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
  const htmlTemplate = getHtmlTemplate(colors, topic, keyword, refLink);
  const currentYear = new Date().getFullYear();

  // 웹 크롤링으로 최신 정보 및 공식 링크 수집
  const crawledInfo = await WebCrawlerService.crawlForKeyword(keyword, apiKey);

  return `
        당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.
        주제: "${topic}"
        핵심 키워드: "${keyword}"

        === 최신 웹 크롤링 정보 ===
        ${crawledInfo}
        === 크롤링 정보 끝 ===

        위의 크롤링된 최신 정보를 반드시 활용하여, 독자에게 실질적인 도움을 주는 완벽한 블로그 게시물을 작성해주세요.

        ⚠️ 절대 지켜야 할 핵심 규칙:
        1. **지침용 텍스트 절대 금지**: [독자의 흥미를 유발하는...], [여기에 관련 정부기관 웹사이트 링크 삽입] 같은 지침용 대괄호 텍스트는 절대 그대로 출력하지 마세요. 반드시 실제 내용으로 대체해야 합니다.
        
        2. **공식 링크 필수 포함**: 크롤링된 정보를 바탕으로 정부기관, 공공기관의 공식 웹사이트 링크를 본문에 최소 2-3개 자연스럽게 삽입해주세요. 예: 보건복지부(https://www.mw.go.kr), 복지정보포털(https://www.welfaresupport.go.kr), 에너지바우처 공식사이트(https://www.energyvoucher.go.kr) 등
        
        3. **정보성 콘텐츠 중심**: 모든 소제목과 내용은 독자가 실제로 필요로 하는 구체적이고 실용적인 정보를 담아야 합니다. "연관 검색어 전략" 같은 메타적인 내용은 절대 포함하지 마세요.

        4. **성공 사례 크롤링 활용**: 크롤링된 정보에서 실제 성공 사례나 데이터를 찾아 활용하고, 없다면 현실적이고 구체적인 가상 사례를 창의적으로 작성해주세요.

        다음 지침에 따라 작성해주세요:
        - 출력 형식: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요. HTML 외에 다른 텍스트, 설명, 마크다운 형식을 포함하지 마세요.
        - **핵심 키워드 보존**: "${keyword}"의 모든 구성 요소를 정확히 유지하면서 자연스럽게 활용해주세요.
        - **크롤링 정보 우선 활용**: 위에서 제공된 최신 웹 정보를 글의 근거로 최우선 활용해주세요.
        - 대상 독자: 한국어 사용자
        - **시의성**: 크롤링된 최신 정보를 반영하여 현재 년도(${currentYear}년)의 최신 상황을 자연스럽게 언급하세요.
        - **섹션별 글자수**: HTML 템플릿의 각 H2 소제목 아래 본문 내용은 **150자에서 190자 사이**로 작성해주세요.
        - **키워드 활용**: 핵심 키워드 '${keyword}'를 글 전체에 자연스럽게 녹여내세요.
        - **키워드 강조**: 각 H2 소제목 아래 본문에서 핵심 키워드는 정확히 1번만 \`<strong>${keyword}</strong>\`로 강조해주세요.
        - 문체: 친근한 구어체('~해요', '~죠' 체)를 사용하고, 격식체('~입니다', '~습니다')는 사용하지 마세요.
        - 가독성: 각 단락은 최대 2-3개의 문장으로 구성해주세요.
        - 참조 링크 텍스트: HTML 템플릿의 끝에 위치한 참조 링크의 앵커 텍스트를 "${referenceSentence || '워드프레스 꿀팁 더 보러가기'}"로 설정해주세요.

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
        - Reference Sentence: ${referenceSentence || '워드프레스 꿀팁 더 보러가기'}
        - Topic: ${topic}
        - Main Keyword: ${keyword}

        아래는 반드시 따라야 할 HTML 템플릿입니다.
        
        --- HTML TEMPLATE START ---
${htmlTemplate}
--- HTML TEMPLATE END ---

        ⚠️ 재확인 사항:
        - 대괄호 안의 지침 텍스트가 그대로 출력되면 안 됩니다
        - 공식 링크가 최소 2-3개 포함되어야 합니다
        - 모든 내용이 실제 정보성 콘텐츠여야 합니다
        - 크롤링된 정보를 최대한 활용해야 합니다
      `;
};

export const getEnhancedTopicPrompt = (keyword: string, count: number): string => {
  const currentYear = new Date().getFullYear();
  
  return `'${keyword}'를(을) 주제로, ${currentYear}년 최신 정보를 반영하여 구글과 네이버 검색에 최적화된 블로그 포스팅 제목 ${count}개를 생성해 주세요. 

**핵심 키워드 보존 규칙 (매우 중요)**:
- 핵심 키워드 '${keyword}'의 모든 구성 요소를 절대 누락하지 마세요
- 특히 년도(2025년), 숫자(70만원), 고유명사(에너지바우처) 등은 반드시 포함되어야 합니다
- 각 제목에는 반드시 핵심 키워드인 '${keyword}'가 완전한 형태로 포함되어야 합니다

**제목 생성 지침**:
- 각 제목은 사람들이 클릭하고 싶게 만드는 흥미로운 내용이어야 합니다
- 모든 제목은 반드시 한글로만 작성해야 하며, 한자(漢字)나 다른 언어는 절대 포함하지 마세요
- ${currentYear}년 최신 상황을 반영한 시의성 있는 제목으로 작성해주세요
- 결과는 각 제목을 줄바꿈으로 구분하여 번호 없이 텍스트만 제공해주세요
- 다른 설명 없이 주제 목록만 생성해주세요

**키워드 누락 방지를 위한 체크리스트**:
1. '${keyword}'의 모든 단어가 제목에 포함되었는가?
2. 년도, 숫자, 고유명사가 정확히 표기되었는가?
3. 키워드의 의미가 변질되지 않았는가?

이 지침을 엄격히 준수하여 제목을 생성해주세요.`;
};
