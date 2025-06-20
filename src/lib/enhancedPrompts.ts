
import { getColors } from './promptUtils';
import { getHtmlTemplate } from './htmlTemplate';

interface DynamicHeading {
  title: string;
  emoji: string;
  content: string;
}

interface EnhancedArticlePromptParams {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink?: string;
  referenceSentence?: string;
  apiKey: string;
  dynamicHeadings: DynamicHeading[];
}

export const getEnhancedArticlePrompt = async ({
  topic,
  keyword,
  selectedColorTheme,
  referenceLink,
  referenceSentence,
  apiKey,
  dynamicHeadings,
}: EnhancedArticlePromptParams): Promise<string> => {
  const colors = getColors(selectedColorTheme);
  const refLink = referenceLink || 'https://worldpis.com';
  const refText = referenceSentence || '워드프레스 꿀팁 더 보러가기';
  
  // 동적 소제목을 HTML 템플릿에 전달
  const dynamicSections = dynamicHeadings.map(h => ({
    title: h.title,
    emoji: h.emoji,
    content: `[${h.content}]`
  }));
  
  const htmlTemplate = getHtmlTemplate(
    topic,
    `[콘텐츠가 여기에 들어갑니다]`,
    '',
    '',
    '',
    dynamicSections
  );
  const currentYear = new Date().getFullYear();

  return `
당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.
주제: "${topic}"
핵심 키워드: "${keyword}"

다음 지침에 따라, 독자의 시선을 사로잡고 검색 엔진 상위 노출을 목표로 하는 완벽한 블로그 게시물을 작성해주세요.

**🚨 중요한 변경사항 - 소제목 생성 방식 🚨**
기존의 고정된 소제목 템플릿("신청 방법", "자격 조건", "필요 서류" 등)은 완전히 폐기되었습니다.
대신 다음과 같이 동적으로 생성된 검색 의도 기반 소제목을 사용해야 합니다:

**동적 생성된 소제목들:**
${dynamicHeadings.map((h, index) => `${index + 1}. ${h.emoji} ${h.title} - ${h.content}`).join('\n')}

이 소제목들은 실제 사용자들이 "${keyword}"와 관련하여 검색할 만한 연관 키워드와 검색 의도를 분석하여 생성되었습니다.
각 소제목에 대해 해당 검색 의도에 맞는 실질적이고 유용한 내용을 작성해주세요.

- 출력 형식: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요. HTML 외에 다른 텍스트, 설명, 마크다운 형식(\`\`\`html)을 포함하지 마세요.
- 콘텐츠 독창성: 동일한 주제나 키워드로 이전에 글을 작성했을 수 있습니다. 하지만 이번에는 완전히 새로운 관점과 독창적인 접근 방식을 사용해야 합니다. 이전 글과 절대 중복되지 않는, 완전히 새로운 글을 생성해주세요.

- **독자 중심 글쓰기 (매우 중요)**: 글의 모든 내용은 독자가 '${topic}'에 대해 검색했을 때 가장 궁금해하고, 알고 싶어하는 정보를 중심으로 구성해야 합니다.

- **자연스러운 링크 사용 (중요 변경사항)**: 
  • 주제와 관련이 없는 정부 사이트나 공식 사이트를 억지로 넣지 마세요
  • 링크는 해당 주제와 소제목 내용에 실제로 도움이 되는 경우에만 사용하세요
  • 링크 개수에 얽매이지 말고, 자연스러운 맥락에서만 사용하세요
  • 만약 적절한 외부 링크가 없다면 굳이 억지로 넣지 마세요

- 대상 독자: 한국어 사용자
- **시의성**: 글의 내용이 최신 정보를 반영해야 할 경우, 현재 년도(${currentYear}년)를 자연스럽게 언급하여 정보의 신뢰도를 높일 수 있습니다.
- **콘텐츠 분량 (매우 중요)**: 전체 글자 수는 반드시 **190자에서 250자 사이**여야 합니다.
- **키워드 활용**: 핵심 키워드 '${keyword}'를 글 전체에 자연스럽게 녹여내세요. 목표 키워드 밀도는 1.5% ~ 2.5%를 지향하지만, 가장 중요한 것은 **글의 가독성과 자연스러움**입니다.
- 콘텐츠 스타일: 제공된 HTML 템플릿과 스타일을 정확히 사용해야 합니다.
- 문체: 전체 글의 어조를 일관되게 유지해주세요. 독자에게 말을 거는 듯한 인간적이고 친근한 구어체('~해요', '~죠' 체)를 사용해주세요. **'~입니다', '~습니다'와 같은 격식체는 절대 사용하지 마세요.**

- **태그 생성 (중요 변경사항)**: 
  • 글의 마지막에 태그를 생성할 때, '태그:' 라는 접두사를 절대 포함하지 말고, 쉼표로 구분된 키워드 목록만 제공해주세요
  • **주제 "${topic}" 전체를 태그에 포함하지 마세요 (너무 길기 때문)**
  • 대신 핵심 키워드 '${keyword}'와 관련된 짧고 실용적인 태그들만 포함해주세요
  • 예시: "스마트폰, 데이터관리, 개인정보보호, 보안, 프라이버시" (O)
  • 피해야 할 예시: "스마트폰 데이터 관리법으로 개인정보 보호하기" (X)

- **키워드 강조 (매우 중요)**: 글의 가독성과 SEO를 위해, **각 H2 소제목 아래 본문에서** 핵심 키워드 '${keyword}'는 문맥에 맞게 자연스럽게 사용하되, **정확히 1번만** \`<strong>${keyword}</strong>\` 와 같이 \`<strong>\` 태그로 강조해주세요.
- 가독성 향상: 독자가 내용을 쉽게 읽을 수 있도록 문단 구성을 최적화해야 합니다. **각 단락은 최대 3개의 문장으로 구성하는 것을 원칙으로 합니다.**

- **참조 링크 텍스트 (매우 중요)**: HTML 템플릿의 끝에 위치한 참조 링크의 앵커 텍스트는 "${refText}"로 설정되어 있습니다. 이 텍스트를 그대로 사용해주세요.

- **컬러테마 (매우 중요)**: ${selectedColorTheme} 선택된 컬러테마를 반드시 모든 스타일에 정확히 적용해야 합니다.

- **시각화 요약 카드 (매우 중요)**: 티스토리 호환 시각화 요약 카드 필수 삽입해야 합니다.

- **주의사항 카드 (매우 중요)**: 주의사항 카드 필수 삽입해야 합니다.

- **주제 제목 (매우 중요)**: 주제 제목 H3 태그로 글 시작 부분에 반드시 포함해야 합니다.

- **공감 박스 (매우 중요)**: 간단한 공감 박스 주제 제목 바로 다음에 반드시 포함해야 합니다.

${referenceLink ? `- **외부 참조 링크 활용**: 제공된 참조 링크 "${referenceLink}"의 내용을 분석하여 글에 자연스럽게 반영해주세요.` : ''}
${referenceSentence ? `- **참조 문장 활용**: 제공된 참조 문장 "${referenceSentence}"을 글의 맥락에 맞게 자연스럽게 포함하거나 연관된 내용을 작성해주세요.` : ''}

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
