
import { WebCrawlerService } from './webCrawler';

interface EnhancedPromptParams {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink?: string;
  referenceSentence?: string;
  apiKey: string;
}

export const getEnhancedArticlePrompt = async (params: EnhancedPromptParams): Promise<string> => {
  const { topic, keyword, selectedColorTheme, referenceLink, referenceSentence, apiKey } = params;
  
  const colors = getColors(selectedColorTheme);
  const currentDate = new Date().toISOString().split('T')[0];
  
  // 웹 크롤링 정보 가져오기
  let webCrawlContent = '';
  try {
    webCrawlContent = await WebCrawlerService.crawlForKeyword(keyword, apiKey);
  } catch (error) {
    console.error('웹 크롤링 정보 가져오기 실패:', error);
  }

  return `당신은 전문 블로그 작성자입니다. 다음 요구사항에 따라 고품질 블로그 글을 작성해주세요.

**주제**: ${topic}
**핵심 키워드**: ${keyword}
**컬러 테마**: ${selectedColorTheme}
**작성일**: ${currentDate}

## 🎨 디자인 및 스타일 요구사항

### 색상 설정
- 주요 색상: ${colors.primary}
- 보조 색상: ${colors.secondary}
- 강조 색상: ${colors.accent}
- 배경 색상: ${colors.background}

### 글 구조 및 스타일
1. **제목 (H1)**: 매력적이고 클릭을 유도하는 제목
2. **주제 표시 (H3)**: 제목 바로 아래에 주제를 별도 H3로 표시
3. **공감 박스**: 다음 이미지 형식으로 단순화된 구조로 작성
   - 배경색: 연한 회색 (#f8f9fa)
   - 테두리: 1px solid #dee2e6
   - 패딩: 20px
   - 둥근 모서리: 8px
   - 내용: 독자와의 공감대 형성하는 2-3줄 문장
4. **본문 소제목 (H2)**: 5-6개의 소제목으로 구성
5. **각 섹션**: 200-270자 내외로 구체적이고 실용적인 내용
6. **시각화 요약카드**: 6번째 소제목의 내용 끝에 위치
7. **참조 링크**: 글 끝에 테두리 없이 하이퍼링크와 문장만 표시

### 내용 요구사항
- 실용적이고 유용한 정보 제공
- 각 소제목마다 구체적인 방법, 팁, 사례 포함
- 독자의 관심을 끄는 흥미로운 내용
- SEO 최적화를 위한 키워드 자연스러운 배치

### HTML 구조 예시

\`\`\`html
<h1 style="color: ${colors.primary}; font-size: 28px; font-weight: bold; margin-bottom: 20px; line-height: 1.3;">
[매력적인 블로그 제목]
</h1>

<h3 style="color: ${colors.accent}; font-size: 18px; font-weight: 600; margin: 15px 0; padding: 10px; background-color: ${colors.background}; border-left: 4px solid ${colors.primary}; border-radius: 4px;">
📌 주제: ${topic}
</h3>

<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 25px 0; font-style: italic; color: #495057;">
[독자와의 공감대를 형성하는 2-3줄 문장]
</div>

<h2 style="color: ${colors.primary}; font-size: 22px; font-weight: bold; margin: 25px 0 15px 0; border-bottom: 2px solid ${colors.secondary}; padding-bottom: 8px;">
🔍 1. [첫 번째 소제목]
</h2>
[200-270자 내외의 구체적인 내용]

<!-- 2-5번째 소제목들도 동일한 패턴 -->

<h2 style="color: ${colors.primary}; font-size: 22px; font-weight: bold; margin: 25px 0 15px 0; border-bottom: 2px solid ${colors.secondary}; padding-bottom: 8px;">
💡 6. [여섯 번째 소제목]
</h2>
[200-270자 내외의 구체적인 내용]

<!-- 6번째 소제목 내용 끝에 시각화 요약카드 배치 -->
<div style="background: linear-gradient(135deg, ${colors.secondary}, ${colors.background}); border: 2px solid ${colors.primary}; border-radius: 15px; padding: 25px; margin: 30px 0; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
<h3 style="color: ${colors.primary}; font-size: 20px; font-weight: bold; margin-bottom: 15px; text-align: center;">
📊 핵심 포인트 요약
</h3>
<div style="background-color: white; border-radius: 10px; padding: 20px;">
<ul style="list-style: none; padding: 0; margin: 0;">
<li style="color: ${colors.primary}; font-weight: 600; margin-bottom: 12px; padding: 8px; background-color: ${colors.background}; border-radius: 5px; border-left: 4px solid ${colors.accent};">
✅ [핵심 포인트 1]
</li>
<li style="color: ${colors.primary}; font-weight: 600; margin-bottom: 12px; padding: 8px; background-color: ${colors.background}; border-radius: 5px; border-left: 4px solid ${colors.accent};">
✅ [핵심 포인트 2]
</li>
<li style="color: ${colors.primary}; font-weight: 600; margin-bottom: 12px; padding: 8px; background-color: ${colors.background}; border-radius: 5px; border-left: 4px solid ${colors.accent};">
✅ [핵심 포인트 3]
</li>
</ul>
</div>
</div>

\`\`\`

${webCrawlContent ? `### 📊 참조 자료 활용
다음 웹 크롤링 정보를 글에 자연스럽게 녹여주세요:
${webCrawlContent}` : ''}

${referenceLink && referenceSentence ? `### 🔗 외부 참조 정보 활용
다음 참조 정보를 글 끝에 자연스럽게 포함해주세요:
- 참조 링크: ${referenceLink}
- 참조 문장: "${referenceSentence}"

글 마지막에 다음과 같이 추가:
<div style="margin-top: 30px; color: #6c757d; font-size: 14px;">
${referenceSentence} <a href="${referenceLink}" target="_blank" style="color: ${colors.primary}; text-decoration: none;">자세히 보기</a>
</div>` : ''}

**중요 지침:**
- 각 소제목별로 200-270자 내외의 충실한 내용 작성
- 시각화 요약카드는 반드시 6번째 소제목 내용 끝에 배치
- 참조 링크는 글 끝에 테두리 없이 표시
- 이모지를 적절히 활용하여 가독성 향상
- 실용적이고 구체적인 정보 위주로 작성
- HTML 태그를 정확히 사용하여 구조화된 글 작성

이제 위 요구사항에 따라 완성도 높은 블로그 글을 작성해주세요.`;
};

export const getColors = (theme: string) => {
  switch (theme) {
    case 'classic-blue':
      return {
        primary: '#0a4b78',
        secondary: '#e6f2ff',
        accent: '#1a73e8',
        background: '#f5f9ff'
      };
    case 'forest-green':
      return {
        primary: '#2e7d32',
        secondary: '#e8f5e9',
        accent: '#43a047',
        background: '#f1f8e9'
      };
    case 'warm-orange':
      return {
        primary: '#e65100',
        secondary: '#fff3e0',
        accent: '#ff9800',
        background: '#fffde7'
      };
    case 'royal-purple':
      return {
        primary: '#4a148c',
        secondary: '#f3e5f5',
        accent: '#8e24aa',
        background: '#f8f0fc'
      };
    case 'ruby-red':
      return {
        primary: '#b71c1c',
        secondary: '#ffebee',
        accent: '#e53935',
        background: '#fff5f5'
      };
    case 'teal-blue':
      return {
        primary: '#00695c',
        secondary: '#e0f2f1',
        accent: '#00897b',
        background: '#e0f7fa'
      };
    case 'coffee-brown':
      return {
        primary: '#5d4037',
        secondary: '#efebe9',
        accent: '#8d6e63',
        background: '#f5f5f5'
      };
    case 'slate-gray':
      return {
        primary: '#455a64',
        secondary: '#eceff1',
        accent: '#607d8b',
        background: '#f5f7f8'
      };
    case 'sunset-orange':
      return {
        primary: '#bf360c',
        secondary: '#fbe9e7',
        accent: '#ff5722',
        background: '#fff8e1'
      };
    case 'midnight-blue':
      return {
        primary: '#1a237e',
        secondary: '#e8eaf6',
        accent: '#3949ab',
        background: '#f5f5ff'
      };
    case 'emerald-green':
      return {
        primary: '#1b5e20',
        secondary: '#e8f5e9',
        accent: '#2e7d32',
        background: '#f1f8e9'
      };
    case 'coral-pink':
      return {
        primary: '#c2185b',
        secondary: '#fce4ec',
        accent: '#ec407a',
        background: '#fff0f6'
      };
    case 'amber-gold':
      return {
        primary: '#ff8f00',
        secondary: '#fff8e1',
        accent: '#ffc107',
        background: '#fffde7'
      };
    case 'deep-purple':
      return {
        primary: '#311b92',
        secondary: '#ede7f6',
        accent: '#5e35b1',
        background: '#f5f2ff'
      };
    case 'turquoise-blue':
      return {
        primary: '#006064',
        secondary: '#e0f7fa',
        accent: '#00acc1',
        background: '#e0ffff'
      };
    default:
      return {
        primary: '#0a4b78',
        secondary: '#e6f2ff',
        accent: '#1a73e8',
        background: '#f5f9ff'
      };
  }
};
