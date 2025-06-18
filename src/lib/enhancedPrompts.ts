import { crawlWebInfo } from './webCrawler';
import { generateMetaDescription } from './pixabay';

export const getEnhancedArticlePrompt = async (params: {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink?: string;
  referenceSentence?: string;
  apiKey: string;
}): Promise<string> => {
  const { topic, keyword, selectedColorTheme, referenceLink, referenceSentence, apiKey } = params;
  
  // 웹 크롤링으로 최신 정보 수집
  const webInfo = await crawlWebInfo(keyword, apiKey);
  const webInfoText = webInfo.length > 0 
    ? `\n\n**최신 웹 정보:**\n${webInfo.join('\n')}`
    : '';

  const externalLinkSection = referenceLink && referenceSentence 
    ? `\n\n글의 마지막 부분에 다음 외부 링크를 자연스럽게 삽입해주세요:
링크: ${referenceLink}
링크 텍스트: "${referenceSentence}"
이 링크는 글의 내용과 관련된 추가 정보를 제공하는 것으로 자연스럽게 연결해주세요.` 
    : '';

  return `당신은 한국어 SEO 블로그 전문 작가입니다. 다음 요구사항에 따라 고품질의 블로그 글을 작성해주세요.

**주제:** ${topic}
**핵심 키워드:** ${keyword}
**컬러 테마:** ${selectedColorTheme}${webInfoText}${externalLinkSection}

**작성 요구사항:**

1. **SEO 최적화:**
   - 핵심 키워드 "${keyword}"를 자연스럽게 본문에 3-5회 포함
   - 관련 키워드와 동의어도 적절히 활용
   - 검색 의도에 맞는 유용한 정보 제공

2. **HTML 구조:**
   - 완전한 HTML 문서로 작성 (DOCTYPE, html, head, body 태그 포함)
   - 반응형 디자인을 위한 viewport 메타태그 포함
   - ${selectedColorTheme} 테마에 맞는 색상 스킴 적용

3. **콘텐츠 구성:**
   - 매력적인 제목 (H1)
   - 논리적인 소제목 구조 (H2, H3 활용)
   - 읽기 쉬운 단락 구성
   - 필요시 목록이나 표 활용
   - 최소 1500자 이상의 풍부한 내용

4. **메타 태그:**
   - SEO에 최적화된 title 태그 (50-60자)
   - 검색 결과에 표시될 meta description (150-160자)
   - 적절한 키워드 태그 (주제명은 제외하고 핵심 키워드와 관련 키워드만 포함)

5. **스타일링:**
   - Tailwind CSS 클래스 사용
   - ${selectedColorTheme} 컬러 테마 적용
   - 깔끔하고 현대적인 디자인
   - 모바일 친화적 반응형 레이아웃

6. **추가 요소:**
   - 적절한 내부 링크 구조
   - 사용자 경험을 고려한 레이아웃
   - 접근성을 고려한 HTML 작성

**중요 지침:**
- 태그에는 주제명을 포함하지 말고, 핵심 키워드와 관련된 SEO 키워드만 포함해주세요
- 웹에서 수집한 최신 정보를 적극 활용하여 더욱 풍부하고 정확한 내용을 작성해주세요
- 자연스럽고 읽기 쉬운 한국어로 작성해주세요
- 완전한 HTML 코드만 응답해주세요 (```html 태그나 추가 설명 없이)

지금 바로 블로그 글을 작성해주세요.`;
};
