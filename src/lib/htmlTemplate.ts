
// 격려 섹션 생성
const getEncouragementSection = (): string => {
  return `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin: 40px 0; text-align: center;">
    <h3 style="color: white; margin-bottom: 15px;">💪 함께 성장해요!</h3>
    <p style="font-size: 16px; line-height: 1.6; margin: 0;">작은 변화도 큰 성과의 시작입니다. 오늘도 한 걸음씩 전진해보세요!</p>
  </div>`;
};

// 요약 카드 섹션 생성
const getSummaryCardSection = (content: string): string => {
  const sentences = content.split('.').filter(s => s.trim().length > 10);
  const keyPoints = sentences.slice(0, 3).map(s => s.trim()).join('. ');
  
  return `<div style="background: #f8f9fa; border-left: 5px solid #007bff; padding: 25px; margin: 30px 0; border-radius: 10px;">
    <h4 style="color: #007bff; margin-bottom: 15px;">📝 핵심 요약</h4>
    <p style="font-size: 16px; line-height: 1.6; margin: 0;">${keyPoints}</p>
  </div>`;
};

// 마무리 섹션 생성
const getClosingSection = (): string => {
  return `<div style="background: #e8f5e8; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center;">
    <h4 style="color: #28a745; margin-bottom: 15px;">🌟 마무리</h4>
    <p style="font-size: 16px; line-height: 1.6; margin: 0;">이 정보가 도움이 되셨나요? 더 많은 유용한 콘텐츠로 찾아뵙겠습니다!</p>
  </div>`;
};

// 태그 섹션 생성
const getTagsSection = (tags: string[]): string => {
  if (!tags || tags.length === 0) return '';
  
  const tagElements = tags.map(tag => 
    `<span style="background: #e3f2fd; color: #1976d2; padding: 8px 16px; border-radius: 20px; margin: 5px; display: inline-block; font-size: 14px;">#${tag.trim()}</span>`
  ).join('');
  
  return `<div style="margin: 40px 0; padding: 25px; background: #fafafa; border-radius: 10px;">
    <h4 style="color: #333; margin-bottom: 15px;">🏷️ 관련 태그</h4>
    <div>${tagElements}</div>
  </div>`;
};

// 애드센스 코드 삽입 함수
const insertAdsenseCode = (content: string, adsenseCode: string): string => {
  if (!adsenseCode.trim()) return content;
  
  // H2 태그를 찾아서 그 위에 애드센스 코드 삽입
  const h2Regex = /<h2[^>]*>/gi;
  const matches = content.match(h2Regex);
  
  if (matches && matches.length > 0) {
    // 중간 부분의 H2 태그 위에 삽입 (첫 번째와 마지막 제외)
    const middleIndex = Math.floor(matches.length / 2);
    let insertCount = 0;
    
    return content.replace(h2Regex, (match, offset) => {
      if (insertCount === middleIndex) {
        insertCount++;
        return `<div style="text-align: center; margin: 30px 0;">
          ${adsenseCode}
        </div>
        ${match}`;
      }
      insertCount++;
      return match;
    });
  }
  
  return content;
};

// HTML 템플릿 생성 함수 (기존 createBlogTemplate과 동일한 기능)
export const getHtmlTemplate = (
  colors: any,
  topic: string,
  keyword: string,
  refLink: string,
  referenceSentence?: string,
  dynamicHeadings?: Array<{title: string, emoji: string, content: string}>
): string => {
  const headings = dynamicHeadings || [
    { title: "기본 정보", emoji: "📋", content: "기본적인 정보를 확인해보세요" },
    { title: "신청 방법", emoji: "📝", content: "신청 절차를 알아보세요" },
    { title: "주의사항", emoji: "⚠️", content: "놓치면 안 되는 중요한 포인트" },
    { title: "활용 팁", emoji: "💡", content: "더 효과적으로 활용하는 방법" },
    { title: "자주 묻는 질문", emoji: "❓", content: "많이 궁금해하는 내용들" }
  ];

  return `
    <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: 'Malgun Gothic', sans-serif; line-height: 1.8;">
      <h1 style="color: ${colors.primary}; text-align: center; border-bottom: 3px solid ${colors.primary}; padding-bottom: 10px;">[TOPIC_TITLE]</h1>
      
      <div style="background: ${colors.highlight}; border: 2px solid ${colors.highlightBorder}; padding: 20px; border-radius: 10px; margin: 30px 0;">
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">[INTRO_CONTENT]</p>
      </div>

      ${headings.map((heading, index) => `
        <h2 style="color: ${colors.secondary}; border-left: 4px solid ${colors.secondary}; padding-left: 15px; margin-top: 40px;">
          ${heading.emoji} ${heading.title}
        </h2>
        <div>[SECTION_CONTENT_${index + 1}]</div>
      `).join('')}

      <div style="background: ${colors.warnBg}; border: 2px solid ${colors.warnBorder}; padding: 20px; border-radius: 10px; margin: 40px 0; text-align: center;">
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">
          <a href="${refLink}" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">
            ${referenceSentence || '더 많은 정보 확인하기'}
          </a>
        </p>
      </div>

      <div style="margin: 40px 0;">
        <p style="font-size: 14px; color: #666;">태그: [GENERATED_TAGS]</p>
      </div>
    </div>
  `;
};

export const createBlogTemplate = (
  title: string,
  content: string,
  metaDescription?: string,
  tags: string[] = [],
  adsenseCode?: string,
  isAdsenseEnabled?: boolean
): string => {
  let processedContent = content;
  
  // 애드센스 활성화 시 코드 삽입
  if (isAdsenseEnabled && adsenseCode) {
    processedContent = insertAdsenseCode(processedContent, adsenseCode);
  }
  
  // 추가 섹션들 삽입
  const encouragementSection = getEncouragementSection();
  const summarySection = getSummaryCardSection(content);
  const closingSection = getClosingSection();
  const tagsSection = getTagsSection(tags);
  
  // 본문에 추가 섹션들 삽입
  const finalContent = `${processedContent}
    ${summarySection}
    ${encouragementSection}
    ${closingSection}
    ${tagsSection}`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${metaDescription ? `<meta name="description" content="${metaDescription}">` : ''}
    <style>
        body { 
            font-family: 'Malgun Gothic', sans-serif; 
            line-height: 1.8; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: #fff;
        }
        h1, h2, h3, h4 { 
            color: #2c3e50; 
            margin-top: 2em; 
            margin-bottom: 0.5em;
        }
        h1 { font-size: 2.2em; text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { font-size: 1.6em; border-left: 4px solid #3498db; padding-left: 15px; }
        h3 { font-size: 1.3em; color: #e74c3c; }
        p { margin-bottom: 1.5em; }
        img { max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; }
        ul, ol { margin-bottom: 1.5em; padding-left: 30px; }
        li { margin-bottom: 0.5em; }
        .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        @media (max-width: 768px) {
            body { padding: 15px; }
            h1 { font-size: 1.8em; }
            h2 { font-size: 1.4em; }
        }
    </style>
</head>
<body>
    <article>
        <h1>${title}</h1>
        ${finalContent}
    </article>
</body>
</html>`;
};
