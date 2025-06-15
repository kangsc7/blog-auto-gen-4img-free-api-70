
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
        - 대상 독자: 한국어 사용자
        - SEO 최적화: Google 및 Naver 검색 엔진에 최적화된 콘텐츠여야 합니다. 제목, 소제목, 본문에 핵심 키워드 '${keyword}'를 자연스럽게, 그리고 **정확하게 1.5%에서 2.5% 사이의 밀도**로 배치해주세요. 이 밀도를 맞추는 것은 SEO 100점을 위해 절대적으로 중요합니다.
        - 콘텐츠 스타일: 제공된 HTML 템플릿과 스타일을 정확히 사용해야 합니다. 모든 섹션('[ ]'으로 표시된 부분)을 실제 가치를 제공하는 풍부하고 자연스러운 콘텐츠로 채워주세요.
        - 문체: 전체 글의 어조를 일관되게 유지해주세요. 독자에게 말을 거는 듯한 친근하고 부드러운 구어체('~해요', '~죠' 체)를 사용해주세요. 단, '핵심만 요약!' 카드 섹션은 간결하고 명료한 정보 전달을 위해 '~입니다', '~습니다'체를 사용해도 좋습니다. 개인적인 경험이나 스토리를 섞어 독자의 공감을 얻고, 이모지(예: 😊, 💡, 😥)를 적절히 사용하여 글의 생동감을 더해주세요.
        - 가독성 향상: 독자가 내용을 쉽게 읽을 수 있도록 문단 구성을 최적화해야 합니다. **각 단락은 최대 3개의 문장으로 구성하는 것을 원칙으로 합니다.** 만약 한 단락에 3개 이상의 문장이 포함될 경우, 의미 단위에 맞게 자연스럽게 별도의 단락으로 나눠주세요. 이는 가독성 점수를 높이는 데 매우 중요합니다.
        - 콘텐츠 분량: 반드시 2,500 단어에서 3,000 단어 사이의 풍부하고 깊이 있는 내용으로 작성해주세요. 각 섹션에 할당된 지침보다 더 상세하고 구체적인 정보를 제공하여 독자의 체류 시간을 극대화해야 합니다.
        - 내부/외부 링크: 글의 신뢰도를 높이기 위해, 본문 내용과 관련된 권위 있는 외부 사이트나 통계 자료로 연결되는 링크를 최소 2개 이상 자연스럽게 포함해주세요. 예를 들어, '한 연구에 따르면...' 과 같은 문장에 실제 연구 자료 링크를 추가할 수 있습니다. 링크는 반드시 a 태그를 사용해야 합니다.
        - 참조 링크 텍스트: HTML 템플릿의 끝에 위치한 참조 링크의 앵커 텍스트를 아래 "사용할 변수" 섹션의 "Reference Sentence" 값으로 설정해주세요. 만약 "Reference Sentence" 값이 비어있다면, 기본 텍스트인 "더 많은 정보 확인하기"를 사용하세요.
        - 가장 중요한 규칙: 콘텐츠의 전체적인 품질과 SEO 점수를 위해, 위에서 언급된 키워드 밀도(**정확히 1.5% ~ 2.5% 범위**)와 글자수(2,500 ~ 3,000 단어) 지침은 **절대적으로, 예외 없이** 엄격하게 지켜주세요. 키워드 밀도 계산법은 '(키워드 총 등장 횟수 / 전체 단어 수) * 100' 입니다.

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

        아래는 반드시 따라야 할 HTML 템플릿입니다. 구조와 클래스, 인라인 스타일을 절대 변경하지 마세요.
        
        --- HTML TEMPLATE START ---
${htmlTemplate}
--- HTML TEMPLATE END ---
      `;
};
