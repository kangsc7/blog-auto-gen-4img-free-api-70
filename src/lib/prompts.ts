
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
  const htmlTemplate = getHtmlTemplate(colors, topic, keyword, refLink);

  return `
        당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.
        주제: "${topic}"
        핵심 키워드: "${keyword}"

        다음 지침에 따라, 독자의 시선을 사로잡고 검색 엔진 상위 노출을 목표로 하는 완벽한 블로그 게시물을 작성해주세요.
        - 출력 형식: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요. HTML 외에 다른 텍스트, 설명, 마크다운 형식(\`\`\`html)을 포함하지 마세요.
        - 콘텐츠 독창성: 동일한 주제나 키워드로 이전에 글을 작성했을 수 있습니다. 하지만 이번에는 완전히 새로운 관점과 독창적인 접근 방식을 사용해야 합니다. 이전 글과 절대 중복되지 않는, 완전히 새로운 글을 생성해주세요. 예시, 비유, 스토리텔링을 다르게 구성하고, 글의 구조와 표현 방식에도 변화를 주어 독자에게 신선한 가치를 제공해야 합니다. 이 지침은 검색 엔진의 중복 콘텐츠 페널티를 피하기 위해 매우 중요합니다.
        - **독자 중심 글쓰기 (매우 중요)**: 글의 모든 내용은 독자가 '${topic}'에 대해 검색했을 때 가장 궁금해하고, 알고 싶어하는 정보를 중심으로 구성해야 합니다. 단순히 정보를 나열하는 것을 넘어, 독자의 문제를 해결해주고 실질적인 도움을 준다는 느낌을 주어야 합니다. 독자의 입장에서 '이 글을 읽길 정말 잘했다'고 느낄 수 있도록 깊이 있는 분석, 구체적인 예시, 실행 가능한 조언을 풍부하게 담아주세요.
        - 대상 독자: 한국어 사용자
        - **섹션별 글자 수 가이드**: 글의 전체적인 균형과 가독성을 위해 각 H2 섹션의 내용은 대략 150-250 단어 내외로 작성해주세요. 이 가이드를 통해 전체 글자 수 목표를 자연스럽게 달성할 수 있습니다.
        - **콘텐츠 분량 (매우 중요)**: SEO 점수 100점을 위해, 전체 글자 수는 반드시 **1,000 단어에서 1,200 단어 사이**여야 합니다. Flash 모델의 토큰 제한으로 내용이 잘리는 것을 방지하기 위함입니다. 각 섹션을 상세하고 깊이 있게 다루되, 위에 명시된 섹션별 글자 수 가이드를 따라 이 분량을 달성해주세요.
        - **키워드 활용**: 핵심 키워드 '${keyword}'를 글 전체에 자연스럽게 녹여내세요. 목표 키워드 밀도는 1.5% ~ 2.5%를 지향하지만, 가장 중요한 것은 **글의 가독성과 자연스러움**입니다. 독자가 읽기에 불편할 정도로 키워드를 억지로 반복해서는 안 됩니다. 의미 있는 맥락에서만 키워드를 사용해주세요.
        - 콘텐츠 스타일: 제공된 HTML 템플릿과 스타일을 정확히 사용해야 합니다. 모든 섹션('[ ]'으로 표시된 부분)을 실제 가치를 제공하는 풍부하고 자연스러운 콘텐츠로 채워주세요.
        - 문체: 전체 글의 어조를 일관되게 유지해주세요. 독자에게 말을 거는 듯한 친근하고 부드러운 구어체('~해요', '~죠' 체)를 사용해주세요. 단, '핵심만 요약!' 카드 섹션은 간결하고 명료한 정보 전달을 위해 '~입니다', '~습니다'체를 사용해도 좋습니다. 개인적인 경험이나 스토리를 섞어 독자의 공감을 얻고, 이모지(예: 😊, 💡, 😥)를 적절히 사용하여 글의 생동감을 더해주세요.
        - 태그 생성: 글의 마지막에 태그를 생성할 때, '태그:' 라는 접두사를 절대 포함하지 말고, 쉼표로 구분된 키워드 목록만 제공해주세요.
        - **키워드 강조 (매우 중요)**: 글의 가독성과 SEO를 위해, **각 H2 소제목 아래 본문에서** 핵심 키워드 '${keyword}'는 문맥에 맞게 자연스럽게 사용하되, **정확히 1번만** \`<strong>${keyword}</strong>\` 와 같이 \`<strong>\` 태그로 강조해주세요. 이 규칙은 모든 H2 섹션에 예외 없이 엄격하게 적용됩니다.
        - 가독성 향상: 독자가 내용을 쉽게 읽을 수 있도록 문단 구성을 최적화해야 합니다. **각 단락은 최대 3개의 문장으로 구성하는 것을 원칙으로 합니다.** 만약 한 단락에 3개 이상의 문장이 포함될 경우, 의미 단위에 맞게 자연스럽게 별도의 단락으로 나눠주세요. 이는 가독성 점수를 높이는 데 매우 중요합니다.
        - 내부/외부 링크: 글의 신뢰도를 높이기 위해, 본문 내용과 관련된 권위 있는 외부 사이트나 통계 자료로 연결되는 링크를 최소 2개 이상 자연스럽게 포함해주세요. 예를 들어, '한 연구에 따르면...' 과 같은 문장에 실제 연구 자료 링크를 추가할 수 있습니다. 링크는 반드시 a 태그를 사용해야 합니다.
        - 참조 링크 텍스트: HTML 템플릿의 끝에 위치한 참조 링크의 앵커 텍스트를 아래 "사용할 변수" 섹션의 "Reference Sentence" 값으로 설정해주세요. 만약 "Reference Sentence" 값이 비어있다면, 기본 텍스트인 "더 많은 정보 확인하기"를 사용하세요.
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
        - Reference Sentence: ${referenceSentence}
        - Topic: ${topic}
        - Main Keyword: ${keyword}

        아래는 반드시 따라야 할 HTML 템플릿입니다.
        
        --- HTML TEMPLATE START ---
${htmlTemplate}
--- HTML TEMPLATE END ---
      `;
};
