import { colorThemes } from '@/data/constants';
import { getHtmlTemplate } from './htmlTemplate';

interface EnhancedArticlePromptOptions {
  topic: string;
  keyword: string;
  selectedColorTheme?: string;
  referenceLink?: string;
  referenceSentence?: string;
  apiKey: string;
  sectionWordCount?: string;
}

export const getEnhancedArticlePrompt = async (options: EnhancedArticlePromptOptions): Promise<string> => {
  const {
    topic,
    keyword,
    selectedColorTheme = 'blue',
    referenceLink = '',
    referenceSentence = '',
    apiKey,
    sectionWordCount = '190-240'
  } = options;

  const colorTheme = colorThemes.find(theme => theme.value === selectedColorTheme) || colorThemes[0];
  const template = getHtmlTemplate(colorTheme);

  const basePrompt = `
당신은 전문 블로그 콘텐츠 작성자입니다. 다음 조건에 따라 SEO 최적화된 블로그 글을 작성해주세요:

**주제**: ${topic}
**핵심 키워드**: ${keyword}
**섹션당 글자수**: ${sectionWordCount}자
**색상 테마**: ${colorTheme.name}

${referenceLink ? `**참고 링크**: ${referenceLink}` : ''}
${referenceSentence ? `**참고 문장**: ${referenceSentence}` : ''}

**작성 요구사항**:
1. 제목은 클릭률이 높은 매력적인 형태로 작성 (45자 이내)
2. 본문은 5개의 소제목(H2)으로 구성하되, 각 섹션은 ${sectionWordCount}자로 작성
3. 핵심 키워드를 자연스럽게 본문 전체에 5-7회 포함
4. 실용적이고 구체적인 정보 제공
5. 독자의 관심을 끌 수 있는 스토리텔링 요소 포함
6. SEO를 고려한 메타태그와 구조화된 데이터 포함

**HTML 템플릿을 사용하여 완성된 웹페이지 형태로 출력해주세요:**

${template}

**중요**: 
- 각 섹션은 정확히 ${sectionWordCount}자로 작성해주세요
- 제목과 소제목에 핵심 키워드를 포함시키되 자연스럽게 배치
- 실제 데이터와 사례를 활용한 신뢰성 있는 내용 작성
- 독자가 실행할 수 있는 구체적인 팁과 방법 제시
`;

  return basePrompt;
};
