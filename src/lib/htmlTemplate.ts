
// 격려 섹션 생성
const getEncouragementSection = (): string => {
  return `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin: 40px 0; text-align: center;">
    <h3 style="color: white; margin-bottom: 15px;">💪 함께 성장해요!</h3>
    <p style="font-size: 16px; line-height: 1.8; margin: 0;">작은 변화도 큰 성과의 시작입니다. 오늘도 한 걸음씩 전진해보세요!</p>
  </div>`;
};

// 요약 카드 섹션 생성
const getSummaryCardSection = (content: string): string => {
  const sentences = content.split('.').filter(s => s.trim().length > 10);
  const keyPoints = sentences.slice(0, 3).map(s => s.trim()).join('. ');
  
  return `<div style="background: #f8f9fa; border-left: 5px solid #007bff; padding: 25px; margin: 30px 0; border-radius: 10px;">
    <h4 style="color: #007bff; margin-bottom: 15px;">📝 핵심 요약</h4>
    <p style="font-size: 16px; line-height: 1.8; margin: 0;">${keyPoints}</p>
  </div>`;
};

// 마무리 섹션 생성
const getClosingSection = (): string => {
  return `<div style="background: #e8f5e8; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center;">
    <h4 style="color: #28a745; margin-bottom: 15px;">🌟 마무리</h4>
    <p style="font-size: 16px; line-height: 1.8; margin: 0;">이 정보가 도움이 되셨나요? 더 많은 유용한 콘텐츠로 찾아뵙겠습니다!</p>
  </div>`;
};

// 태그 섹션 생성 - 핵심 키워드 중심의 간결한 태그 생성 (7개 제한, 콜론 제거, 배경색 제거)
const getTagsSection = (topic: string, headings: Array<{title: string, emoji: string, content: string}>): string => {
  // 주제에서 핵심 키워드 추출 (콜론과 긴 문장 제거)
  const cleanTopic = topic.replace(/[:\-_]/g, ' ').trim();
  const topicWords = cleanTopic.split(' ').filter(word => word.length > 1).slice(0, 2);
  
  // 소제목에서 핵심 키워드 추출 (이모티콘과 콜론 제거, 짧은 단어들만)
  const headingKeywords = headings.slice(0, 5).map(h => {
    const cleanTitle = h.title.replace(/[^\w\s가-힣]/g, '').trim();
    const words = cleanTitle.split(' ').filter(word => word.length > 1);
    
    // 90% 확률로 1-2단어, 10% 확률로 3단어
    const shouldUseThreeWords = Math.random() < 0.1;
    const maxWords = shouldUseThreeWords ? 3 : 2;
    
    return words.length <= maxWords ? words.slice(0, maxWords).join(' ') : words.slice(0, 2).join(' ');
  }).filter(keyword => keyword.length > 0);
  
  // 전체 태그 목록을 7개로 제한하고 중복 제거
  const allTags = [...new Set([...topicWords, ...headingKeywords])].slice(0, 7);
  
  const tagText = allTags.join(', ');
  
  return `<div style="margin: 40px 0; padding: 0;">
    <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">${tagText}</p>
  </div>`;
};

// 테이블 생성 함수
const createRandomTable = (colors: any, topic: string): string => {
  return `<div style="margin: 30px 0; overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; border: 2px solid ${colors.primary}; border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background: ${colors.primary}; color: white;">
          <th style="padding: 12px; text-align: left; font-weight: bold; font-size: 16px;">구분</th>
          <th style="padding: 12px; text-align: left; font-weight: bold; font-size: 16px;">내용</th>
          <th style="padding: 12px; text-align: left; font-weight: bold; font-size: 16px;">참고사항</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: ${colors.highlight};">
          <td style="padding: 12px; border-bottom: 1px solid ${colors.primary}; font-weight: 600;">기본 정보</td>
          <td style="padding: 12px; border-bottom: 1px solid ${colors.primary};">[TABLE_CONTENT_1]</td>
          <td style="padding: 12px; border-bottom: 1px solid ${colors.primary};">[TABLE_NOTE_1]</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid ${colors.primary}; font-weight: 600;">활용 방법</td>
          <td style="padding: 12px; border-bottom: 1px solid ${colors.primary};">[TABLE_CONTENT_2]</td>
          <td style="padding: 12px; border-bottom: 1px solid ${colors.primary};">[TABLE_NOTE_2]</td>
        </tr>
        <tr style="background: ${colors.highlight};">
          <td style="padding: 12px; font-weight: 600;">주의사항</td>
          <td style="padding: 12px;">[TABLE_CONTENT_3]</td>
          <td style="padding: 12px;">[TABLE_NOTE_3]</td>
        </tr>
      </tbody>
    </table>
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
        return `<div style="text-align: center !important; margin: 30px 0 !important;">
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

  const tableContent = createRandomTable(colors, topic);

  return `
    <div style="max-width: 800px !important; margin: 0 auto !important; padding: 20px !important; font-family: 'Malgun Gothic', sans-serif !important; line-height: 1.8 !important;">
      <h1 style="color: ${colors.primary} !important; text-align: center !important; padding-bottom: 10px !important; font-size: 28px !important; font-weight: bold !important; margin-bottom: 30px !important;">[TOPIC_TITLE]</h1>
      
      <div style="background: ${colors.highlight} !important; border: 2px solid ${colors.primary} !important; padding: 25px !important; border-radius: 12px !important; margin: 30px 0 !important;">
        <p style="margin: 0 !important; font-size: 18px !important; line-height: 1.8 !important; font-weight: 500 !important;">[INTRO_CONTENT]</p>
      </div>

      ${headings.map((heading, index) => `
        <div style="margin-top: 50px !important;">
          <h2 style="color: ${colors.primary} !important; border-left: 4px solid ${colors.primary} !important; padding-left: 15px !important; margin-bottom: 25px !important; font-size: 24px !important; font-weight: bold !important; line-height: 1.4 !important;">
            ${heading.emoji} ${heading.title}
          </h2>
          <div style="font-size: 18px !important; line-height: 1.8 !important; color: #374151 !important;">[SECTION_CONTENT_${index + 1}]</div>
          ${index === 2 ? tableContent : ''}
        </div>
      `).join('')}

      <div style="margin-top: 50px !important;"></div>

      <div style="background: #fff8e1 !important; border: 2px solid #ffb74d !important; padding: 25px !important; border-radius: 12px !important; margin: 40px 0 !important; text-align: center !important;">
        <p style="margin: 0 !important; line-height: 1.8 !important;">
          <a href="${refLink}" target="_blank" rel="noopener" style="color: ${colors.link} !important; text-decoration: underline !important; font-size: 22px !important; font-weight: bold !important;">
            📝 ${referenceSentence || '워드프레스 꿀팁 더 보러가기'}
          </a>
        </p>
      </div>

      <div style="margin: 40px 0 !important;">
        <div style="margin-top: 20px !important;">[GENERATED_TAGS]</div>
      </div>
    </div>
    
    <style>
      @media (max-width: 768px) {
        .container { padding: 10px !important; }
        h1 { font-size: 24px !important; }
        h2 { font-size: 20px !important; }
        p { font-size: 16px !important; }
        table { font-size: 14px !important; }
        th, td { padding: 8px !important; }
        .reference-link { font-size: 18px !important; }
      }
    </style>
  `;
};

export const createBlogTemplate = (
  title: string,
  content: string,
  metaDescription?: string,
  tags: string[] = [],
  adsenseCode?: string,
  isAdsenseEnabled?: boolean,
  topic?: string,
  headings?: Array<{title: string, emoji: string, content: string}>
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
  const tagsSection = getTagsSection(topic || title, headings || []);
  
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
            font-family: 'Malgun Gothic', sans-serif !important; 
            line-height: 1.8 !important; 
            color: #333 !important; 
            max-width: 800px !important; 
            margin: 0 auto !important; 
            padding: 20px !important;
            background: #fff !important;
        }
        h1, h2, h3, h4 { 
            color: #2c3e50 !important; 
            margin-top: 2.5em !important; 
            margin-bottom: 1em !important;
            line-height: 1.4 !important;
        }
        h1 { 
            font-size: 28px !important; 
            text-align: center !important; 
            padding-bottom: 15px !important; 
            margin-bottom: 30px !important;
        }
        h2 { 
            font-size: 24px !important; 
            border-left: 4px solid #3498db !important; 
            padding-left: 15px !important; 
            margin-top: 50px !important;
        }
        h3 { 
            font-size: 20px !important; 
            color: #e74c3c !important; 
        }
        p { 
            margin-bottom: 20px !important; 
            line-height: 1.8 !important;
            font-size: 18px !important;
            color: #374151 !important;
            font-weight: 500 !important;
        }
        img { 
            max-width: 100% !important; 
            height: auto !important; 
            border-radius: 8px !important; 
            margin: 20px 0 !important; 
        }
        ul, ol { 
            margin-bottom: 20px !important; 
            padding-left: 30px !important; 
        }
        li { 
            margin-bottom: 8px !important; 
            line-height: 1.8 !important;
        }
        .highlight { 
            background: #fff3cd !important; 
            padding: 15px !important; 
            border-radius: 5px !important; 
            margin: 20px 0 !important; 
        }
        table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 25px 0 !important;
            font-size: 16px !important;
        }
        th, td {
            padding: 12px !important;
            text-align: left !important;
            border-bottom: 1px solid #ddd !important;
        }
        th {
            font-weight: bold !important;
            color: white !important;
        }
        @media (max-width: 768px) {
            body { 
                padding: 15px !important; 
                margin: 0 !important;
            }
            h1 { 
                font-size: 24px !important; 
            }
            h2 { 
                font-size: 20px !important; 
                margin-top: 40px !important;
            }
            h3 {
                font-size: 18px !important;
            }
            p {
                font-size: 16px !important;
            }
            table {
                font-size: 14px !important;
            }
            th, td {
                padding: 8px !important;
            }
            .adsbygoogle {
                margin: 20px 0 !important;
            }
        }
        
        /* 애드센스 광고 스타일 강화 */
        .adsbygoogle {
            display: block !important;
            margin: 30px 0 !important;
            text-align: center !important;
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
