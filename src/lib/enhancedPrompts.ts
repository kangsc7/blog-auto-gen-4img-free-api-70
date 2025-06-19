
import { getColors } from './promptUtils';
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

  const colors = getColors(selectedColorTheme);
  const refLink = referenceLink || 'https://worldpis.com';
  const refText = referenceSentence || '워드프레스 꿀팁 더 보러가기';
  
  // 빈 배열로 전달하여 기본 템플릿 사용
  const htmlTemplate = getHtmlTemplate(
    topic,
    `[콘텐츠가 여기에 들어갑니다]`,
    '',
    '',
    ''
  );
  const currentYear = new Date().getFullYear();

  const basePrompt = `당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.
주제: "${topic}"
핵심 키워드: "${keyword}"
컬러 테마: "${selectedColorTheme}"
${referenceContent ? `참조 내용: ${referenceContent}` : ''}
${referenceSentence ? `참조 문장: ${referenceSentence}` : ''}

다음 지침에 따라, 독자의 시선을 사로잡고 검색 엔진 상위 노출을 목표로 하는 완벽한 블로그 게시물을 작성해주세요.

**작성 요구사항**:

1. **출력 형식**: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요. HTML 외에 다른 텍스트, 설명, 마크다운 형식(\`\`\`html)을 포함하지 마세요.

2. **콘텐츠 독창성**: 동일한 주제나 키워드로 이전에 글을 작성했을 수 있습니다. 하지만 이번에는 완전히 새로운 관점과 독창적인 접근 방식을 사용해야 합니다. 이전 글과 절대 중복되지 않는, 완전히 새로운 글을 생성해주세요. 예시, 비유, 스토리텔링을 다르게 구성하고, 글의 구조와 표현 방식에도 변화를 주어 독자에게 신선한 가치를 제공해야 합니다.

3. **독자 중심 글쓰기**: 글의 모든 내용은 독자가 '${topic}'에 대해 검색했을 때 가장 궁금해하고, 알고 싶어하는 정보를 중심으로 구성해야 합니다. 단순히 정보를 나열하는 것을 넘어, 독자의 문제를 해결해주고 실질적인 도움을 준다는 느낌을 주어야 합니다.

4. **제목 및 시작 구조**:
   - 제목은 H1 태그로 작성하되, 밑줄이나 테두리는 추가하지 마세요
   - 제목 바로 아래에는 주제를 요약한 서술형 공감형 메타 설명을 P 태그로 추가하세요 (2-3줄 정도)
   - 이 메타 설명은 독자의 공감을 이끌어내고 글의 핵심 가치를 미리 보여주는 역할을 해야 합니다

5. **소제목 최적화**: H2 소제목은 절대로 주제 "${topic}"를 그대로 반복하지 마세요. 대신 독자가 해당 주제와 관련하여 꼬리를 물고 궁금해할 만한 연관 검색어나 실질적인 질문들로 구성하세요. 각 소제목 끝에 내용과 어울리는 이모지 1개를 추가하세요.

6. **시각적 요소 강화**:
   - 핵심 내용을 강조하는 시각화 요약 카드를 중간중간 삽입하세요
   - 주의사항이나 팁을 위한 주의 카드도 적절히 배치하세요
   - 카드들은 선택된 컬러 테마(${selectedColorTheme})를 반영해야 합니다

7. **감정적 연결과 공감**: 독자가 이 주제를 검색한 이유는 정보 습득뿐만 아니라 마음의 위로, 용기, 동기부여를 얻고 싶어서입니다. 글 전반에 독자의 마음에 공감하는 표현과 격려의 메시지를 자연스럽게 녹여내세요.

8. **시의성**: 글의 내용이 최신 정보를 반영해야 할 경우, 현재 년도(${currentYear}년)를 자연스럽게 언급하여 정보의 신뢰도를 높일 수 있습니다.

9. **콘텐츠 분량**: 전체 글자 수는 반드시 **1400자에서 1900자 사이**여야 합니다. 이 분량 제한을 엄격하게 지켜주세요.

10. **키워드 활용**: 핵심 키워드 '${keyword}'를 글 전체에 자연스럽게 녹여내세요. 목표 키워드 밀도는 1.5% ~ 2.5%를 지향하지만, 가장 중요한 것은 글의 가독성과 자연스러움입니다. 각 H2 섹션별로 핵심 키워드를 문맥에 맞게 자연스럽게 사용하되, 정확히 1번만 <strong>${keyword}</strong>와 같이 강조해주세요.

11. **문체**: 전체 글의 어조를 일관되게 유지해주세요. 독자에게 말을 거는 듯한 인간적이고 친근한 구어체('~해요', '~죠' 체)를 사용해주세요. '~입니다', '~습니다'와 같은 격식체는 절대 사용하지 마세요.

12. **가독성 향상**: 각 단락은 최대 3개의 문장으로 구성하는 것을 원칙으로 합니다. 만약 한 단락에 3개 이상의 문장이 포함될 경우, 의미 단위에 맞게 자연스럽게 별도의 단락으로 나눠주세요.

13. **내부/외부 링크**: 글의 신뢰도를 높이기 위해, 본문 내용과 관련된 권위 있는 외부 사이트나 통계 자료로 연결되는 링크를 최소 2개 이상 자연스럽게 포함해주세요.
링크 작성 형식: <a href="https://www.example.com" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">링크텍스트</a>

14. **태그 생성**: 글의 마지막에 태그를 생성할 때, '태그:' 라는 접두사를 절대 포함하지 말고, 다음 형식으로 글 끝에 추가:
<p style="text-align: center; font-size: 14px; color: #666; margin-top: 40px;" data-ke-size="size16">
#태그1 #태그2 #태그3 #태그4 #태그5 #태그6 #태그7
</p>

15. **시각화 요약 카드 형식**:
<div style="background: linear-gradient(135deg, ${colors.highlight}, ${colors.secondary}); border-left: 5px solid ${colors.primary}; padding: 20px; margin: 25px 0; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
<h4 style="color: ${colors.primary}; margin-bottom: 15px;">💡 핵심 포인트</h4>
<ul style="margin: 0; padding-left: 20px;">
<li style="margin-bottom: 8px; color: #333;">요점 1</li>
<li style="margin-bottom: 8px; color: #333;">요점 2</li>
<li style="margin-bottom: 8px; color: #333;">요점 3</li>
</ul>
</div>

16. **주의 카드 형식**:
<div style="background: linear-gradient(135deg, ${colors.warnBg}, #fff8e1); border-left: 5px solid ${colors.warnBorder}; padding: 20px; margin: 25px 0; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
<h4 style="color: ${colors.warnBorder}; margin-bottom: 15px;">⚠️ 주의사항</h4>
<p style="margin: 0; color: #333; line-height: 1.6;">주의할 내용을 여기에 작성</p>
</div>

${referenceContent ? `
17. **참조 내용 활용**: 참조 내용을 자연스럽게 글에 녹여서 활용하세요.
` : ''}

${referenceLink ? `
18. **외부 링크 처리**: 외부 링크 "${referenceLink}" 사용하여 글 하단에 참조 링크 삽입하세요.
` : ''}

**사용할 변수**:
- Primary Color: ${colors.primary}
- Secondary Color: ${colors.secondary}
- Text Highlight Color: ${colors.textHighlight}
- Highlight Color: ${colors.highlight}
- Highlight Border Color: ${colors.highlightBorder}
- Warn BG Color: ${colors.warnBg}
- Warn Border Color: ${colors.warnBorder}
- Link Color: ${colors.link}
- Reference Link: ${refLink}
- Reference Text: ${refText}
- Topic: ${topic}
- Main Keyword: ${keyword}

**HTML 템플릿**:
${htmlTemplate}

**중요**: 응답은 반드시 HTML 태그로 시작하고 끝나야 하며, 일반 텍스트나 설명 없이 HTML 코드만 출력하세요.`;

  return basePrompt;
};
