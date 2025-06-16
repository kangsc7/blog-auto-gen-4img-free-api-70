
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

  // 웹 크롤링으로 최신 정보 수집
  const crawledInfo = await WebCrawlerService.crawlForKeyword(keyword, apiKey);

  return `
        당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.
        주제: "${topic}"
        핵심 키워드: "${keyword}"

        === 최신 웹 크롤링 정보 ===
        ${crawledInfo}
        === 크롤링 정보 끝 ===

        위의 크롤링된 최신 정보를 반드시 활용하여, 독자의 시선을 사로잡고 검색 엔진 상위 노출을 목표로 하는 완벽한 블로그 게시물을 작성해주세요.

        다음 지침에 따라 작성해주세요:
        - 출력 형식: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요. HTML 외에 다른 텍스트, 설명, 마크다운 형식(\`\`\`html)을 포함하지 마세요.
        - **핵심 키워드 보존 (매우 중요)**: "${keyword}"의 모든 구성 요소(특히 년도, 숫자, 고유명사 등)를 절대 누락하지 마세요. 주제와 모든 소제목에 핵심 키워드가 완전한 형태로 포함되어야 합니다.
        - **크롤링 정보 활용**: 위에서 제공된 최신 웹 정보를 글의 근거로 활용하여 구체적이고 정확한 내용을 작성해주세요.
        - 콘텐츠 독창성: 동일한 주제나 키워드로 이전에 글을 작성했을 수 있습니다. 하지만 이번에는 크롤링된 최신 정보를 바탕으로 완전히 새로운 관점과 독창적인 접근 방식을 사용해야 합니다.
        - **독자 중심 글쓰기 (매우 중요)**: 크롤링된 정보를 바탕으로 독자가 '${topic}'에 대해 검색했을 때 가장 궁금해하고, 알고 싶어하는 정보를 중심으로 구성해야 합니다. 실질적이고 구체적인 정보를 제공하여 독자에게 실질적인 도움을 주어야 합니다.
        - 대상 독자: 한국어 사용자
        - **시의성**: 크롤링된 최신 정보를 반영하여 현재 년도(${currentYear}년)의 최신 상황을 자연스럽게 언급하세요.
        - **섹션별 글자수 제한 (매우 중요)**: HTML 템플릿의 각 H2 소제목 아래 본문 내용은 반드시 **150자에서 190자 사이**로 작성해야 합니다. 이 글자수 제한을 엄격하게 지켜주세요. 토큰 제한을 피하기 위해 각 섹션을 간결하면서도 핵심적인 정보로 구성해주세요.
        - **키워드 활용**: 핵심 키워드 '${keyword}'를 글 전체에 자연스럽게 녹여내세요. 크롤링된 정보에서 관련 키워드도 함께 활용하여 SEO 효과를 높이세요.
        - 콘텐츠 스타일: 제공된 HTML 템플릿과 스타일을 정확히 사용해야 합니다. 모든 섹션을 크롤링된 정보를 바탕으로 150-190자 분량의 간결하고 핵심적인 콘텐츠로 채워주세요.
        - 문체: 크롤링된 정보를 독자에게 친근하게 전달하는 구어체('~해요', '~죠' 체)를 사용해주세요. **'~입니다', '~습니다'와 같은 격식체는 절대 사용하지 마세요.**
        - 태그 생성: 글의 마지막에 태그를 생성할 때, 크롤링된 정보에서 추출한 관련 키워드들도 포함하여 '태그:' 라는 접두사 없이 쉼표로 구분된 키워드 목록만 제공해주세요.
        - **키워드 강조 (매우 중요)**: 글의 가독성과 SEO를 위해, **각 H2 소제목 아래 본문에서** 핵심 키워드 '${keyword}'는 문맥에 맞게 자연스럽게 사용하되, **정확히 1번만** \`<strong>${keyword}</strong>\` 와 같이 \`<strong>\` 태그로 강조해주세요.
        - 가독성 향상: 크롤링된 정보를 독자가 쉽게 읽을 수 있도록 **각 단락은 최대 2-3개의 문장으로 구성**해주세요. 150-190자 제한 내에서 핵심 정보를 간결하게 전달하세요.
        - 내부/외부 링크: 크롤링된 정보에서 언급된 공식 사이트나 관련 자료 링크를 본문에 자연스럽게 포함해주세요.
        - 참조 링크 텍스트: HTML 템플릿의 끝에 위치한 참조 링크의 앵커 텍스트를 아래 "사용할 변수" 섹션의 "Reference Sentence" 값으로 설정해주세요.
        - **최종 규칙**: 크롤링된 최신 정보를 최대한 활용하되, **각 H2 섹션별로 150-190자 제한**을 반드시 준수하여 토큰 제한 문제를 방지하면서도 독자에게 실질적인 가치를 제공하는 글을 작성해주세요.

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
        - Reference Sentence: ${referenceSentence}
        - Topic: ${topic}
        - Main Keyword: ${keyword}

        아래는 반드시 따라야 할 HTML 템플릿입니다.
        
        --- HTML TEMPLATE START ---
${htmlTemplate}
--- HTML TEMPLATE END ---
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
