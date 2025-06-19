import { getColors } from './promptUtils';
import { getHtmlTemplate } from './htmlTemplate';

interface ArticlePromptParams {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink?: string;
  referenceSentence?: string;
}

export const getArticlePrompt = ({
  topic,
  keyword,
  selectedColorTheme,
  referenceLink,
  referenceSentence,
}: ArticlePromptParams): string => {
  const colors = getColors(selectedColorTheme);
  const refLink = referenceLink || 'https://worldpis.com';
  const refText = referenceSentence || '워드프레스 꿀팁 더 보러가기';
  const htmlTemplate = getHtmlTemplate(colors, topic, keyword, refLink, refText);
  const currentYear = new Date().getFullYear();

  return `
        당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.
        주제: "${topic}"
        핵심 키워드: "${keyword}"

        다음 지침에 따라, 독자의 시선을 사로잡고 검색 엔진 상위 노출을 목표로 하는 완벽한 블로그 게시물을 작성해주세요.
        - 출력 형식: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요. HTML 외에 다른 텍스트, 설명, 마크다운 형식(\`\`\`html)을 포함하지 마세요.
        - 콘텐츠 독창성: 동일한 주제나 키워드로 이전에 글을 작성했을 수 있습니다. 하지만 이번에는 완전히 새로운 관점과 독창적인 접근 방식을 사용해야 합니다. 이전 글과 절대 중복되지 않는, 완전히 새로운 글을 생성해주세요. 예시, 비유, 스토리텔링을 다르게 구성하고, 글의 구조와 표현 방식에도 변화를 주어 독자에게 신선한 가치를 제공해야 합니다. 이 지침은 검색 엔진의 중복 콘텐츠 페널티를 피하기 위해 매우 중요합니다.
        
        - **독자 중심 글쓰기 (매우 중요)**: 글의 모든 내용은 독자가 '${topic}'에 대해 검색했을 때 가장 궁금해하고, 알고 싶어하는 정보를 중심으로 구성해야 합니다. 단순히 정보를 나열하는 것을 넘어, 독자의 문제를 해결해주고 실질적인 도움을 준다는 느낌을 주어야 합니다. 독자의 입장에서 '이 글을 읽길 정말 잘했다'고 느낄 수 있도록 깊이 있는 분석, 구체적인 예시, 실행 가능한 조언을 풍부하게 담아주세요.
        
        - **소제목 최적화 (매우 중요)**: H2 소제목은 절대로 주제 "${topic}"를 그대로 반복하지 마세요. 대신 독자가 해당 주제와 관련하여 꼬리를 물고 궁금해할 만한 연관 검색어나 실질적인 질문들로 구성하세요. 예를 들어:
          • "${topic}를 시작하기 전 반드시 알아야 할 3가지"
          • "많은 사람들이 ${keyword}에서 실수하는 부분들"
          • "${keyword} 효과를 극대화하는 숨겨진 노하우"
          • "전문가가 알려주는 ${keyword}의 진짜 활용법"
          • "${topic}, 이런 분들에게 특히 추천합니다"
        이렇게 독자의 궁금증을 자극하고 몰입도를 높이는 매력적인 소제목으로 구성해주세요.
        
        - **감정적 연결과 공감 (매우 중요)**: 독자가 이 주제를 검색한 이유는 정보 습득뿐만 아니라 마음의 위로, 용기, 동기부여를 얻고 싶어서입니다. 글 전반에 독자의 마음에 공감하는 표현과 격려의 메시지를 자연스럽게 녹여내어 체류시간을 늘리고 만족도를 높이세요.
        
        - 대상 독자: 한국어 사용자
        - **시의성**: 글의 내용이 최신 정보를 반영해야 할 경우, 현재 년도(${currentYear}년)를 자연스럽게 언급하여 정보의 신뢰도를 높일 수 있습니다. 제목에도 필요하다면 년도를 포함해도 좋습니다.
        - **콘텐츠 분량 (매우 중요)**: 전체 글자 수는 반드시 **140자에서 190자 사이**여야 합니다. 이 분량 제한을 엄격하게 지켜주세요.
        - **키워드 활용**: 핵심 키워드 '${keyword}'를 글 전체에 자연스럽게 녹여내세요. 목표 키워드 밀도는 1.5% ~ 2.5%를 지향하지만, 가장 중요한 것은 **글의 가독성과 자연스러움**입니다. 독자가 읽기에 불편할 정도로 키워드를 억지로 반복해서는 안 됩니다. 의미 있는 맥락에서만 키워드를 사용해주세요.
        - 콘텐츠 스타일: 제공된 HTML 템플릿과 스타일을 정확히 사용해야 합니다. 모든 섹션('[ ]'으로 표시된 부분)을 실제 가치를 제공하는 풍부하고 자연스러운 콘텐츠로 채워주세요.
        - 문체: 전체 글의 어조를 일관되게 유지해주세요. 독자에게 말을 거는 듯한 인간적이고 친근한 구어체('~해요', '~죠' 체)를 사용해주세요. **'~입니다', '~습니다'와 같은 격식체는 글의 어떤 부분에서도 절대 사용하지 마세요.** 개인적인 경험이나 스토리를 섞어 독자의 공감을 얻고, 이모지(예: 😊, 💡, 😥)를 적절히 사용하여 글의 생동감을 더해주세요.
        - **태그 생성 (매우 중요)**: 글의 마지막에 태그를 생성할 때, '태그:' 라는 접두사를 절대 포함하지 말고, 쉼표로 구분된 키워드 목록만 제공해주세요. 핵심 키워드 '${keyword}', 주제 '${topic}'와 관련된 실용적인 태그들을 포함해주세요.
        - **키워드 강조 (매우 중요)**: 글의 가독성과 SEO를 위해, **각 H2 소제목 아래 본문에서** 핵심 키워드 '${keyword}'는 문맥에 맞게 자연스럽게 사용하되, **정확히 1번만** \`<strong>${keyword}</strong>\` 와 같이 \`<strong>\` 태그로 강조해주세요. 이 규칙은 모든 H2 섹션에 예외 없이 엄격하게 적용됩니다.
        - 가독성 향상: 독자가 내용을 쉽게 읽을 수 있도록 문단 구성을 최적화해야 합니다. **각 단락은 최대 3개의 문장으로 구성하는 것을 원칙으로 합니다.** 만약 한 단락에 3개 이상의 문장이 포함될 경우, 의미 단위에 맞게 자연스럽게 별도의 단락으로 나눠주세요. 이는 가독성 점수를 높이는 데 매우 중요합니다.
        - **내부/외부 링크 (매우 중요)**: 글의 신뢰도를 높이기 위해, 본문 내용과 관련된 권위 있는 외부 사이트나 통계 자료로 연결되는 링크를 최소 2개 이상 자연스럽게 포함해주세요. 
        
        **링크 작성 시 반드시 지켜야 할 형식:**
        - 올바른 형식: \`<a href="https://www.mw.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">보건복지부</a>\`
        - 절대 사용 금지: "보건복지부(https://www.mw.go.kr/)" 형식이나 단순 URL만 쓰는 것은 절대 금지
        
        - **참조 링크 텍스트 (매우 중요)**: HTML 템플릿의 끝에 위치한 참조 링크의 앵커 텍스트는 "${refText}"로 설정되어 있습니다. 이 텍스트를 그대로 사용해주세요.
        
        ${referenceLink ? `- **외부 참조 링크 활용**: 제공된 참조 링크 "${referenceLink}"의 내용을 분석하여 글에 자연스럽게 반영해주세요.` : ''}
        ${referenceSentence ? `- **참조 문장 활용**: 제공된 참조 문장 "${referenceSentence}"을 글의 맥락에 맞게 자연스럽게 포함하거나 연관된 내용을 작성해주세요.` : ''}
        
        - **가장 중요한 최종 규칙**: 위에서 **(매우 중요)** 또는 **(가장 중요한 규칙)**이라고 표시된 **콘텐츠 분량**과 **키워드 밀도** 지침은 이 작업에서 가장 중요합니다. 어떤 경우에도 이 두 가지 규칙을 어겨서는 안 됩니다.

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
        - Reference Text: ${refText}
        - Topic: ${topic}
        - Main Keyword: ${keyword}

        아래는 반드시 따라야 할 HTML 템플릿입니다.
        
        --- HTML TEMPLATE START ---
${htmlTemplate}
--- HTML TEMPLATE END ---
      `;
};

export const createImagePrompt = async (
  text: string,
  geminiApiKey: string,
  targetLanguage: string = 'English',
  style: string = 'modern digital art',
  mood: string = 'professional',
  additionalContext: string = ''
): Promise<string> => {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
  
  const prompt = `다음 한국어 텍스트를 ${targetLanguage} 이미지 생성 프롬프트로 변환해주세요.
  스타일: ${style}
  분위기: ${mood}
  추가 컨텍스트: ${additionalContext}
  
  텍스트: "${text}"
  
  요구사항:
  - 구체적이고 시각적인 묘사
  - 이미지 생성 AI가 이해하기 쉬운 형태
  - 색상, 구도, 조명 등 세부사항 포함
  - 불필요한 텍스트나 문자 제외
  
  ${targetLanguage} 프롬프트만 출력해주세요:`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error('API 호출 실패');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('이미지 프롬프트 생성 오류:', error);
    return '';
  }
};
