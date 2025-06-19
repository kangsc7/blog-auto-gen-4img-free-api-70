
import { getHtmlTemplate } from './htmlTemplate';

interface PromptOptions {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink?: string;
  referenceSentence?: string;
  apiKey: string;
}

export const getEnhancedArticlePrompt = async (options: PromptOptions): Promise<string> => {
  const { topic, keyword, selectedColorTheme, referenceLink, referenceSentence, apiKey } = options;
  
  console.log('🎨 강화된 프롬프트 생성:', {
    topic,
    keyword,
    colorTheme: selectedColorTheme,
    hasReferenceLink: !!referenceLink,
    hasReferenceSentence: !!referenceSentence
  });

  // 참조 링크가 있는 경우 웹 크롤링으로 내용 가져오기
  let referenceContent = '';
  if (referenceLink && referenceLink.trim()) {
    try {
      console.log('🔗 참조 링크에서 내용 추출 시도:', referenceLink);
      
      const crawlResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `다음 웹사이트 URL의 주요 내용을 요약해주세요. URL: ${referenceLink}

웹사이트의 핵심 정보, 주요 포인트, 유용한 정보들을 간략하게 정리해주세요. 
만약 URL에 접근할 수 없다면, URL 주소를 기반으로 추정되는 내용을 작성해주세요.

요약은 200자 이내로 작성해주세요.`
            }]
          }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
        })
      });

      if (crawlResponse.ok) {
        const crawlData = await crawlResponse.json();
        const extractedContent = crawlData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (extractedContent) {
          referenceContent = extractedContent.trim();
          console.log('✅ 참조 링크 내용 추출 완료:', referenceContent.substring(0, 100) + '...');
        }
      }
    } catch (error) {
      console.error('❌ 참조 링크 내용 추출 실패:', error);
    }
  }

  const basePrompt = `당신은 전문적인 블로그 콘텐츠 작성자입니다. 다음 요구사항에 따라 고품질의 블로그 글을 작성해주세요.

**주제**: ${topic}
**핵심 키워드**: ${keyword}
**컬러 테마**: ${selectedColorTheme}
${referenceContent ? `**참조 내용**: ${referenceContent}` : ''}
${referenceSentence ? `**참조 문장**: ${referenceSentence}` : ''}

**작성 요구사항**:

1. **구조와 형식**:
   - 제목을 H4 태그로 작성하고 검은색으로 지정
   - 3-4개의 소제목을 H2 태그로 구성하되, 각 소제목 끝에 내용과 어울리는 이모지 1개 추가
   - 각 소제목별로 핵심 키워드 "${keyword}"를 자연스럽게 1회 굵게(bold) 표시
   - 소제목당 190-250자(공백 포함) 내외의 내용 작성
   - HTML 형태로 출력

2. **콘텐츠 품질**:
   - SEO에 최적화된 내용
   - 독자에게 실질적 도움이 되는 정보 제공
   - 자연스러운 키워드 배치
   - 읽기 쉬운 문체와 구조

3. **시각적 요소**:
   - 컬러 테마 "${selectedColorTheme}"에 맞는 스타일링
   - 적절한 여백과 줄바꿈
   - 가독성 높은 레이아웃

4. **태그 생성**:
   - 글 내용과 관련된 정확한 태그 7개 생성
   - 주제 "${topic}" 자체는 태그에서 제외
   - 태그는 다음 형식으로 글 끝에 추가:
   <p style="text-align: center; font-size: 14px; color: #666; margin-top: 40px;" data-ke-size="size16">
   #태그1 #태그2 #태그3 #태그4 #태그5 #태그6 #태그7
   </p>

${referenceContent ? `
5. **참조 내용 활용**:
   - 참조 내용을 자연스럽게 글에 녹여서 활용
   - 참조 링크의 정보와 연결되는 내용으로 작성
` : ''}

${referenceLink ? `
6. **외부 링크 처리**:
   - 외부 링크 "${referenceLink}" 사용하여 글 하단에 참조 링크 삽입
   - 참조 문장: "${referenceSentence || '👉 워드프레스 꿀팁 더 보러가기'}"
` : ''}

**출력 형식**: 완전한 HTML 코드로 작성하되, \`\`\`html 같은 마크다운 코드 블록은 사용하지 마세요.

**중요**: 응답은 반드시 HTML 태그로 시작하고 끝나야 하며, 일반 텍스트나 설명 없이 HTML 코드만 출력하세요.`;

  return basePrompt;
};
