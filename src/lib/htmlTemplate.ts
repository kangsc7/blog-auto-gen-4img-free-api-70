// 격려 섹션 생성
const getEncouragementSection = (): string => {
  return `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin: 40px 0; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
    <h3 style="color: white; margin-bottom: 15px;">💪 함께 성장해요!</h3>
    <p style="font-size: 16px; line-height: 1.8; margin: 0;">작은 변화도 큰 성과의 시작입니다. 오늘도 한 걸음씩 전진해보세요!</p>
  </div>`;
};

// 요약 카드 섹션 생성
const getSummaryCardSection = (content: string): string => {
  const sentences = content.split('.').filter(s => s.trim().length > 10);
  const keyPoints = sentences.slice(0, 3).map(s => s.trim()).join('. ');
  
  return `<div style="background: #f8f9fa; border-left: 5px solid #007bff; padding: 25px; margin: 30px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
    <h4 style="color: #007bff; margin-bottom: 15px;">📝 핵심 요약</h4>
    <p style="font-size: 16px; line-height: 1.8; margin: 0;">${keyPoints}</p>
  </div>`;
};

// 마무리 섹션 생성
const getClosingSection = (): string => {
  return `<div style="background: #e8f5e8; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
    <h4 style="color: #28a745; margin-bottom: 15px;">🌟 마무리</h4>
    <p style="font-size: 16px; line-height: 1.8; margin: 0;">이 정보가 도움이 되셨나요? 더 많은 유용한 콘텐츠로 찾아뵙겠습니다!</p>
  </div>`;
};

// 태그 섹션 생성 (태그: 텍스트 제거)
const getTagsSection = (tags: string[]): string => {
  if (!tags || tags.length === 0) return '';
  
  // 태그를 짧게 변환하는 함수
  const shortenTag = (tag: string): string => {
    // 길이가 8자 이하면 그대로 사용
    if (tag.length <= 8) return tag;
    
    // 공통 패턴들을 짧은 태그로 변환
    const tagMapping: { [key: string]: string } = {
      '방법': '방법',
      '신청': '신청',
      '혜택': '혜택',
      '정보': '정보',
      '가이드': '가이드',
      '팁': '팁',
      '절약': '절약',
      '지원금': '지원금',
      '정책': '정책',
      '할인': '할인',
      '무료': '무료',
      '온라인': '온라인',
      '모바일': '모바일',
      '앱': '앱',
      '서비스': '서비스'
    };
    
    // 매핑된 키워드가 포함되어 있으면 해당 키워드 사용
    for (const [key, shortTag] of Object.entries(tagMapping)) {
      if (tag.includes(key)) return shortTag;
    }
    
    // 첫 번째 단어만 사용 (최대 6자)
    const firstWord = tag.split(' ')[0] || tag.split(',')[0] || tag;
    return firstWord.length > 6 ? firstWord.substring(0, 6) : firstWord;
  };
  
  const shortTags = tags.map(shortenTag);
  const tagElements = shortTags.map(tag => 
    `<span style="background: #e3f2fd; color: #1976d2; padding: 8px 16px; border-radius: 20px; margin: 5px; display: inline-block; font-size: 14px;">#${tag.trim()}</span>`
  ).join('');
  
  return `<div style="margin: 40px 0; padding: 25px; background: #fafafa; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
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

// 색상 대비 확인 및 조정 함수
const ensureReadableColors = (colors: any) => {
  // 배경색과 텍스트 색상의 대비를 확인하고 조정
  const adjustedColors = { ...colors };
  
  // 소제목 색상이 배경색과 비슷하면 더 진한 색상으로 변경
  if (colors.secondary && colors.textHighlight) {
    // 밝은 배경에는 진한 텍스트 사용
    adjustedColors.secondary = '#1a202c'; // 진한 회색
  }
  
  // 주요 색상도 가독성 확보
  if (colors.primary) {
    adjustedColors.primary = '#1a365d'; // 진한 파란색
  }
  
  return adjustedColors;
};

// 줄바꿈 처리 함수 (150자 이상 시 두 번째 문장 끝에서 줄바꿈)
const processLineBreaks = (content: string): string => {
  return content.replace(/<div>\[SECTION_CONTENT_\d+\]<\/div>/g, (match) => {
    // 섹션 콘텐츠에 줄바꿈 로직 적용
    return match.replace(/(\S.{149,}?)(\.\s+)(\S)/g, '$1$2<br><br>$3');
  });
};

// 핵심 키워드 강조 함수
const emphasizeKeywords = (content: string): string => {
  // 일반적인 핵심 키워드들을 굵게 표시
  const keywords = [
    '중요', '필수', '핵심', '주의', '반드시', '꼭', '절대', '특히', '가장',
    '신청', '접수', '마감', '기한', '조건', '자격', '대상', '혜택', '할인',
    '무료', '지원', '보조금', '지원금', '환급', '면제', '감면'
  ];
  
  let processedContent = content;
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'g');
    processedContent = processedContent.replace(regex, '<strong>$1</strong>');
  });
  
  return processedContent;
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
  const adjustedColors = ensureReadableColors(colors);
  
  const headings = dynamicHeadings || [
    { title: "기본 정보", emoji: "📋", content: "기본적인 정보를 확인해보세요" },
    { title: "신청 방법", emoji: "📝", content: "신청 절차를 알아보세요" },
    { title: "주의사항", emoji: "⚠️", content: "놓치면 안 되는 중요한 포인트" },
    { title: "활용 팁", emoji: "💡", content: "더 효과적으로 활용하는 방법" },
    { title: "혜택 내용", emoji: "💰", content: "받을 수 있는 혜택들" },
    { title: "용기와 응원", emoji: "🌟", content: "함께 성장해요" },
    { title: "자주 묻는 질문", emoji: "❓", content: "많이 궁금해하는 내용들" }
  ];

  // 7개 섹션 확보
  while (headings.length < 7) {
    headings.push({ title: "추가 정보", emoji: "📌", content: "유용한 정보를 제공합니다" });
  }

  let template = `
    <div style="font-family: 'Noto Sans KR', sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; font-size: 17px; box-sizing: border-box; padding: 0 8px; word-break: break-all; overflow-wrap: break-word;">
      <h1 style="color: ${adjustedColors.primary}; text-align: center; border-bottom: 3px solid ${adjustedColors.primary}; padding-bottom: 10px; margin-bottom: 30px;">[TOPIC_TITLE]</h1>
      
      <div style="background-color: ${adjustedColors.highlight}; padding: 18px; border-radius: 10px; font-style: italic; margin-bottom: 28px; font-size: 18px; line-height: 1.7;">
        <strong>[INTRO_KEYWORD_CONTEXT]</strong> [INTRO_CONTENT]
      </div>

      ${headings.slice(0, 5).map((heading, index) => `
        <h2 style="font-size: 24px; color: ${adjustedColors.secondary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;">
          <strong>${heading.title}</strong> ${heading.emoji}
        </h2>
        [IMAGE_PLACEHOLDER_${index + 1}]
        <div style="margin-bottom: 30px; line-height: 1.8;">[SECTION_CONTENT_${index + 1}]</div>
      `).join('')}

      <style>
      .single-summary-card-container {
          font-family: 'Noto Sans KR', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 25px 15px;
          background-color: ${adjustedColors.highlight};
          margin: 25px 0;
      }
      .single-summary-card {
          width: 100%;
          max-width: 700px;
          background-color: #ffffff;
          border-radius: 15px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          padding: 30px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid ${adjustedColors.highlightBorder};
          box-sizing: border-box;
      }
      .single-summary-card .card-header {
          display: flex;
          align-items: center;
          border-bottom: 2px solid ${adjustedColors.primary};
          padding-bottom: 15px;
          margin-bottom: 15px;
      }
      .single-summary-card .card-header-icon {
          font-size: 38px;
          color: ${adjustedColors.primary};
          margin-right: 16px;
      }
      .single-summary-card .card-header h3 {
          font-size: 28px;
          color: ${adjustedColors.primary};
          margin: 0;
          line-height: 1.3;
          font-weight: 700;
      }
      .single-summary-card .card-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          font-size: 18px;
          line-height: 1.7;
          color: #333;
      }
      .single-summary-card .card-content .section {
          margin-bottom: 12px;
          line-height: 1.7;
      }
      .single-summary-card .card-content .section:last-child {
          margin-bottom: 0;
      }
      .single-summary-card .card-content strong {
          color: ${adjustedColors.secondary};
          font-weight: 600;
      }
      .single-summary-card .card-content .highlight {
          background-color: ${adjustedColors.textHighlight};
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: bold;
      }
      .single-summary-card .card-footer {
          font-size: 15px;
          color: #777;
          text-align: center;
          padding-top: 15px;
          border-top: 1px dashed ${adjustedColors.highlightBorder};
          margin-top: auto;
      }
      @media (max-width: 768px) {
          .single-summary-card-container {
              padding: 20px 10px;
          }
          .single-summary-card {
              padding: 22px;
              border-radius: 10px;
          }
          .single-summary-card .card-header-icon {
              font-size: 32px;
              margin-right: 12px;
          }
          .single-summary-card .card-header h3 {
              font-size: 24px;
          }
          .single-summary-card .card-content {
              font-size: 16px;
              line-height: 1.6;
          }
      }
      </style>
      
      <div class="single-summary-card-container">
          <div class="single-summary-card">
              <div class="card-header">
                  <span class="card-header-icon">💡</span>
                  <h3>[SUMMARY_TITLE] 핵심 요약</h3>
              </div>
              <div class="card-content">
                  <div class="section"><b>핵심 포인트 1:</b> <span class="highlight">[SUMMARY_POINT_1]</span></div>
                  <div class="section"><b>핵심 포인트 2:</b> <span class="highlight">[SUMMARY_POINT_2]</span></div>
                  <div class="section"><b>핵심 포인트 3:</b> <span class="highlight">[SUMMARY_POINT_3]</span></div>
                  <div class="section"><b>활용 팁:</b> <span class="highlight">[SUMMARY_TIP]</span></div>
              </div>
              <div class="card-footer">이 정보가 도움이 되셨나요? 더 많은 유용한 콘텐츠로 찾아뵙겠습니다!</div>
          </div>
      </div>

      <h2 style="font-size: 24px; color: ${adjustedColors.secondary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;">
        <strong>${headings[5].title}</strong> ${headings[5].emoji}
      </h2>
      <div style="margin-bottom: 30px; line-height: 1.8;">[SECTION_CONTENT_6]</div>

      <h2 style="font-size: 24px; color: ${adjustedColors.secondary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;">
        <strong>${headings[6].title}</strong> ${headings[6].emoji}
      </h2>
      <div style="margin: 30px 0;">
          <div style="margin-bottom: 22px;">
              <div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [FAQ_QUESTION_1]</div>
              <div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [FAQ_ANSWER_1]</div>
          </div>
          <div style="margin-bottom: 22px;">
              <div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [FAQ_QUESTION_2]</div>
              <div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [FAQ_ANSWER_2]</div>
          </div>
          <div style="margin-bottom: 22px;">
              <div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [FAQ_QUESTION_3]</div>
              <div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [FAQ_ANSWER_3]</div>
          </div>
      </div>

      <div style="background: ${adjustedColors.warnBg}; border: 2px solid ${adjustedColors.warnBorder}; padding: 25px; border-radius: 10px; margin: 40px 0; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #1a202c;">
          <a href="${refLink}" target="_blank" rel="noopener" style="color: ${adjustedColors.link}; text-decoration: underline;">
            ${referenceSentence || '더 많은 정보 확인하기'}
          </a>
        </p>
      </div>

      <div style="margin: 40px 0;">
        <p style="font-size: 14px; color: #666;">[GENERATED_TAGS]</p>
      </div>
    </div>
  `;
  
  return template;
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
  
  // 핵심 키워드 강조 적용
  processedContent = emphasizeKeywords(processedContent);
  
  // 애드센스 활성화 시 코드 삽입
  if (isAdsenseEnabled && adsenseCode) {
    processedContent = insertAdsenseCode(processedContent, adsenseCode);
  }
  
  // FAQ 섹션을 H2로 변경
  processedContent = processedContent.replace(
    /(자주\s*묻는\s*질문|FAQ)/gi,
    '<h2 style="color: #1a202c !important; border-left: 4px solid #1a202c !important; padding-left: 15px !important; margin-top: 40px !important; margin-bottom: 20px !important;">❓ $1</h2>'
  );
  
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
            font-family: 'Malgun Gothic', sans-serif !important; 
            line-height: 1.8 !important; 
            color: #333 !important; 
            max-width: 800px !important; 
            margin: 0 auto !important; 
            padding: 15px !important;
            background: #fff !important;
        }
        h1, h2, h3, h4 { 
            color: #1a202c !important; 
            margin-top: 2em !important; 
            margin-bottom: 1em !important;
            line-height: 1.4 !important;
        }
        h1 { 
            font-size: 2.2em !important; 
            text-align: center !important; 
            border-bottom: 3px solid #1a365d !important; 
            padding-bottom: 10px !important; 
        }
        h2 { 
            font-size: 1.6em !important; 
            border-left: 4px solid #1a202c !important; 
            padding-left: 15px !important; 
        }
        h3 { 
            font-size: 1.3em !important; 
            color: #1a202c !important; 
        }
        p { 
            margin-bottom: 1.8em !important; 
            line-height: 1.9 !important;
            color: #2d3748 !important;
        }
        strong {
            font-weight: 700 !important;
            color: #1a202c !important;
        }
        img { 
            max-width: 100% !important; 
            height: auto !important; 
            border-radius: 8px !important; 
            margin: 20px 0 !important; 
        }
        ul, ol { 
            margin-bottom: 1.8em !important; 
            padding-left: 30px !important; 
            line-height: 1.8 !important;
        }
        li { 
            margin-bottom: 0.8em !important; 
            line-height: 1.7 !important;
        }
        .highlight { 
            background: #fff3cd !important; 
            padding: 20px !important; 
            border-radius: 8px !important; 
            margin: 25px 0 !important; 
            line-height: 1.8 !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
        }
        
        @media (max-width: 768px) {
            body { 
                padding: 10px !important; 
                margin: 0 !important;
            }
            h1 { 
                font-size: 1.8em !important; 
            }
            h2 { 
                font-size: 1.4em !important; 
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
