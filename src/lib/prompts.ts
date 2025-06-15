
import { getColors } from './promptUtils';
import { getHtmlTemplate } from './htmlTemplate';

interface ArticlePromptParams {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink?: string;
}

export const getArticlePrompt = ({
  topic,
  keyword,
  selectedColorTheme,
  referenceLink,
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
        - SEO 최적화: Google 및 Naver 검색 엔진에 최적화된 콘텐츠여야 합니다. 제목, 소제목, 본문에 핵심 키워드 '${keyword}'를 자연스럽게 1.5% ~ 2.5% 밀도로 배치해주세요. 이는 SEO 점수 100점을 위한 필수 조건입니다.
        - 콘텐츠 스타일: 제공된 HTML 템플릿과 스타일을 정확히 사용해야 합니다. 모든 섹션('[ ]'으로 표시된 부분)을 실제 가치를 제공하는 풍부하고 자연스러운 콘텐츠로 채워주세요.
        - 문체: 친근하고 유익하며, 독자의 공감을 얻을 수 있도록 개인적인 경험이나 스토리를 섞어주세요. 이모지(예: 😊, 💡, 😥)를 적절히 사용하여 글의 생동감을 더해주세요.
        - 가독성 향상: 각 단락은 2~4개의 문장으로 짧고 간결하게 작성해주세요. 아이디어 단위로 문단을 나누어 독자가 내용을 쉽게 따라올 수 있도록 해야 합니다.
        - 콘텐츠 분량: 반드시 2,500 단어에서 3,000 단어 사이의 풍부하고 깊이 있는 내용으로 작성해주세요. 각 섹션에 할당된 지침보다 더 상세하고 구체적인 정보를 제공하여 독자의 체류 시간을 극대화해야 합니다.
        - 내부/외부 링크: 글의 신뢰도를 높이기 위해, 본문 내용과 관련된 권위 있는 외부 사이트나 통계 자료로 연결되는 링크를 최소 2개 이상 자연스럽게 포함해주세요. 예를 들어, '한 연구에 따르면...' 과 같은 문장에 실제 연구 자료 링크를 추가할 수 있습니다. 링크는 반드시 a 태그를 사용해야 합니다.
        - 가장 중요한 규칙: 콘텐츠의 전체적인 품질과 SEO 점수를 위해, 위에서 언급된 키워드 밀도(1.5% ~ 2.5%)와 글자수(2,500 ~ 3,000 단어) 지침은 반드시, 무슨일이 있어도 엄격하게 지켜주세요.

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
        - Main Keyword: ${keyword}

        아래는 반드시 따라야 할 HTML 템플릿입니다. 구조와 클래스, 인라인 스타일을 절대 변경하지 마세요.
        
        --- HTML TEMPLATE START ---
${htmlTemplate}
--- HTML TEMPLATE END ---
      `;
};

