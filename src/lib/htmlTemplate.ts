const getCssStyles = (colors: any): string => `
@media (max-width: 768px) { .wrapper-div { padding: 0 15px; } }
.single-summary-card-container{font-family:'Noto Sans KR',sans-serif;display:flex;justify-content:center;align-items:center;padding:25px 15px;background-color:${colors.highlight};margin:25px 0}.single-summary-card{width:100%;max-width:700px;background-color:#ffffff;border-radius:15px;box-shadow:0 8px 24px rgba(0,0,0,0.15);padding:30px;display:flex;flex-direction:column;overflow:hidden;border:1px solid ${colors.highlightBorder};box-sizing:border-box}.single-summary-card .card-header{display:flex;align-items:center;border-bottom:2px solid ${colors.primary};padding-bottom:15px;margin-bottom:15px}.single-summary-card .card-header-icon{font-size:38px;color:${colors.primary};margin-right:16px}.single-summary-card .card-header h3{font-size:28px;color:${colors.primary};margin:0;line-height:1.3;font-weight:700}.single-summary-card .card-content{flex-grow:1;display:flex;flex-direction:column;justify-content:flex-start;font-size:18px;line-height:1.7;color:#333}.single-summary-card .card-content .section{margin-bottom:12px;line-height:1.7}.single-summary-card .card-content .section:last-child{margin-bottom:0}.single-summary-card .card-content strong{color:${colors.primary};font-weight:600}.single-summary-card .card-content .highlight{background-color:${colors.textHighlight};padding:3px 8px;border-radius:4px;font-weight:bold}.single-summary-card .card-content .formula{background-color:${colors.secondary};padding:8px 12px;border-radius:6px;font-size:0.95em;text-align:center;margin-top:8px;color:${colors.primary}}.single-summary-card .card-footer{font-size:15px;color:#777;text-align:center;padding-top:15px;border-top:1px dashed ${colors.highlightBorder};margin-top:auto}@media (max-width:768px){.single-summary-card-container{padding:20px 10px}.single-summary-card{padding:22px;border-radius:10px}.single-summary-card .card-header-icon{font-size:32px;margin-right:12px}.single-summary-card .card-header h3{font-size:24px}.single-summary-card .card-content{font-size:16px;line-height:1.6}.single-summary-card .card-content .section{margin-bottom:10px;line-height:1.6}.single-summary-card .card-content .highlight{padding:2px 5px}.single-summary-card .card-content .formula{padding:7px 10px;font-size:.9em}.single-summary-card .card-footer{font-size:14px;padding-top:12px}}@media (max-width:480px){.single-summary-card{padding:18px;border-radius:8px}.single-summary-card .card-header-icon{font-size:28px;margin-right:10px}.single-summary-card .card-header h3{font-size:20px}.single-summary-card .card-content{font-size:15px;line-height:1.5}.single-summary-card .card-content .section{margin-bottom:8px;line-height:1.5}.single-summary-card .card-content .formula{padding:6px 8px;font-size:.85em}.single-summary-card .card-footer{font-size:13px;padding-top:10px}}
`;

const getHeaderSection = (topic: string): string => `
<h3 style="font-size: 28px; color: #333; margin-top: 25px; margin-bottom: 20px; text-align: center; line-height: 1.4;" data-ke-size="size23">${topic}</h3>
`;

const getIntroSection = (colors: any, naturalKeyword: string): string => `
<div style="background-color: ${colors.secondary}; padding: 18px; border-radius: 10px; font-style: italic; margin-bottom: 28px; font-size: 18px; line-height: 1.7;">
<b>📢 중요한 소식!</b> [INTRO_KEYWORD_CONTEXT]에 대해 궁금하셨나요? 이 글을 끝까지 읽으시면 정확한 정보와 함께 실질적인 도움을 받으실 수 있을 거예요!
</div>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
최근 많은 분들이 [CONTENT_KEYWORD_1]에 대해 관심을 갖고 계시는데요. 실제로 저도 이 제도를 통해 도움을 받았던 경험이 있어요.
</p>
<p style="height: 20px;">&nbsp;</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
처음엔 복잡한 절차와 조건들 때문에 포기하려고 했었는데, 차근차근 알아보니 생각보다 어렵지 않더라고요. 😊 이 글에서는 복잡한 용어나 절차를 쉽게 풀어서 설명드릴 예정이에요.
</p>
<p style="height: 20px;">&nbsp;</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
특히 실제 신청 과정에서 놓치기 쉬운 부분들까지 상세히 다뤄보겠습니다! 💡
</p>

<p style="height: 20px;">&nbsp;</p>
`;

// 동적 섹션 생성 함수
const getDynamicSection = (colors: any, heading: { title: string; emoji: string; content: string }, sectionNumber: number): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>${heading.title} ${heading.emoji}</b></h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
[SECTION_CONTENT_${sectionNumber}] 관련해서 많은 분들이 궁금해하시는 부분들을 자세히 알아보겠어요. 실제로 도움이 되는 정보들을 중심으로 설명드릴게요.
</p>
<p style="height: 20px;">&nbsp;</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
${heading.content}를 통해 더 구체적인 내용을 확인하실 수 있어요. 복잡해 보일 수 있지만 차근차근 따라하시면 어렵지 않답니다.
</p>
<p style="height: 20px;">&nbsp;</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
특히 이 부분에서 놓치기 쉬운 중요한 포인트들을 꼭 확인해보세요. 😊
</p>
${sectionNumber === 2 ? `
<div style="overflow-x: auto; margin: 25px 0; padding: 0;">
<table style="min-width: 100%; width: 100%; border-collapse: collapse; font-size: 16px; table-layout: auto;">
<thead><tr><th style="padding:14px;text-align:left;border:1px solid #ddd;background-color:#f5f5f5;font-weight:bold;color:#333;">단계</th><th style="padding:14px;text-align:left;border:1px solid #ddd;background-color:#f5f5f5;font-weight:bold;color:#333;">신청 방법</th><th style="padding:14px;text-align:left;border:1px solid #ddd;background-color:#f5f5f5;font-weight:bold;color:#333;">필요 서류</th></tr></thead>
<tbody>
<tr><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">1단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">자격 요건 확인 후 거주지 주민센터 방문 또는 온라인 신청 사이트 접속</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">신분증, 가족관계증명서</td></tr>
<tr style="background-color: #f9f9f9;"><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">2단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">신청서 작성 및 소득·재산 관련 서류 제출</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">소득증명서, 재산세 납세증명서</td></tr>
<tr><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">3단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">접수 완료 후 심사 진행 (약 2주 소요)</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">통장 사본</td></tr>
<tr style="background-color: #f9f9f9;"><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">4단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">승인 시 바우처 카드 발급 및 충전</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">-</td></tr>
</tbody></table></div>
` : ''}
${sectionNumber === 4 ? `
<div style="background-color: ${colors.warnBg}; border-left: 5px solid ${colors.warnBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
    <strong style="color: ${colors.warnBorder};">⚠️ 꼭 확인하세요!</strong><br>
    <ul style="margin: 10px 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">신청 기간을 놓치면 그 해 지원이 불가능해요 - 보통 11월부터 다음해 10월까지</li>
        <li style="margin-bottom: 8px;">가구원 수에 따라 지원 금액이 달라지니 정확한 가구원 신고가 중요해요</li>
        <li style="margin-bottom: 8px;">바우처 카드는 <a href="https://www.energyvoucher.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">에너지바우처 공식사이트</a>에서 미리 확인하세요</li>
        <li>소득·재산 기준이 매년 조금씩 변동될 수 있으니 신청 전 최신 정보를 확인하세요</li>
    </ul>
</div>
` : ''}
${sectionNumber === 7 ? `
<div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
<p style="margin-bottom: 15px; font-size: 16px; line-height: 1.6;"><strong>Q: 신청 후 언제부터 사용 가능한가요?</strong><br>
A: 승인 후 약 1-2주 내에 카드가 발급되며, 즉시 사용 가능해요.</p>
<p style="margin-bottom: 15px; font-size: 16px; line-height: 1.6;"><strong>Q: 다른 가족이 대신 신청할 수 있나요?</strong><br>
A: 세대주 또는 배우자만 신청 가능하며, 위임장이 있으면 대리 신청도 가능해요.</p>
<p style="margin-bottom: 0; font-size: 16px; line-height: 1.6;"><strong>Q: 이사를 가면 어떻게 되나요?</strong><br>
A: 주소 변경 신고를 하시면 새로운 주소에서도 계속 사용 가능해요.</p>
</div>
` : ''}
<p style="height: 20px;">&nbsp;</p>
`;

const getSummaryCardSection = (naturalKeyword: string): string => `
<div class="single-summary-card-container">
<div class="single-summary-card">
<div class="card-header"><span class="card-header-icon">💡</span><h3 data-ke-size="size23">[SUMMARY_TITLE] 핵심 정보 요약</h3></div>
<div class="card-content">
<div class="section"><strong>지원 대상:</strong> <span class="highlight">기준 중위소득 60% 이하 가구 (생계·의료급여 수급자, 차상위계층)</span></div>
<div class="section"><strong>지원 금액:</strong> <span class="highlight">가구원 수에 따라 22만원~70만원 차등 지급</span></div>
<div class="section"><strong>신청 방법:</strong><div class="formula">거주지 주민센터 방문 또는 온라인 신청</div></div>
<div class="section"><strong>사용 용도:</strong> <span class="highlight">전기·가스·지역난방비, 연탄·등유 구매</span></div>
</div>
<div class="card-footer">성공적인 신청을 위한 필수 체크리스트!</div>
</div>
</div>
`;

const getClosingSection = (colors: any, refLink: string, referenceSentence?: string): string => `
<p style="margin-bottom: 15px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
지금까지 [SECTION_CONTENT_8] 관련 정보에 대해 자세히 알아봤는데요, 도움이 되셨길 바라요. 에너지 비용 부담을 줄이는 것은 가계 경제에 정말 큰 도움이 되니까요.
</p>
<p style="height: 20px;">&nbsp;</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
신청 자격에 해당하신다면 꼭 신청해서 혜택을 받으시길 권해드려요! 😊
</p>
<p style="text-align: center; font-size: 18px; margin-bottom: 30px;" data-ke-size="size16"><b>이 글과 관련된 다른 정보가 궁금하다면?</b><br>👉 <a href="${refLink}" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: none; font-weight: bold;"><strong>${referenceSentence || '더 많은 정보 확인하기'}</strong></a></p>
<p style="height: 30px;">&nbsp;</p>
`;

const getTagsSection = (topic: string, keyword: string): string => {
  // 기본 태그들을 생성
  const baseTags = [keyword, topic];
  const additionalTags = [
    '신청방법',
    '지원대상', 
    '혜택',
    '정부지원',
    '2025년',
    '에너지바우처',
    '생활정보'
  ];
  
  // 중복 제거 후 태그 조합
  const allTags = [...new Set([...baseTags, ...additionalTags])];
  
  return `
<div style="margin-top: 30px; padding: 15px 0;">
<p style="font-size: 14px; line-height: 1.4; color: #666; text-align: left;">${allTags.join(', ')}</p>
</div>
<p style="height: 20px;">&nbsp;</p>`;
};

// 동적 HTML 템플릿 생성 함수 (동적 소제목 포함)
export const getHtmlTemplate = (
  colors: any, 
  topic: string, 
  keyword: string, 
  refLink: string, 
  referenceSentence?: string,
  dynamicHeadings?: Array<{ title: string; emoji: string; content: string }>
): string => {
  const htmlParts = [
    getHeaderSection(topic),
    getIntroSection(colors, keyword),
  ];

  // 동적 소제목이 있으면 사용, 없으면 기본 소제목 사용
  if (dynamicHeadings && dynamicHeadings.length >= 7) {
    dynamicHeadings.forEach((heading, index) => {
      htmlParts.push(getDynamicSection(colors, heading, index + 1));
    });
  } else {
    // 기본 섹션들 (기존 코드 유지)
    htmlParts.push(getDynamicSection(colors, { title: `${keyword} 핵심 정보와 기본 내용 완벽 정리`, emoji: '💡', content: '기본 정보를 자세히 알아보겠습니다' }, 1));
    htmlParts.push(getDynamicSection(colors, { title: `${keyword} 신청 방법 단계별 가이드`, emoji: '📝', content: '신청 절차를 단계별로 안내합니다' }, 2));
    htmlParts.push(getDynamicSection(colors, { title: `${keyword} 지원 대상 및 자격 요건`, emoji: '👥', content: '자격 요건을 확인해보세요' }, 3));
    htmlParts.push(getDynamicSection(colors, { title: `${keyword} 지원 금액 및 혜택 내용`, emoji: '💰', content: '받을 수 있는 혜택을 알아봅니다' }, 4));
    htmlParts.push(getDynamicSection(colors, { title: `${keyword} 효과적인 활용법과 주의사항`, emoji: '⚠️', content: '효과적인 활용 방법을 제공합니다' }, 5));
    htmlParts.push(getDynamicSection(colors, { title: `${keyword} 실제 혜택과 기대 효과`, emoji: '📈', content: '실제 효과를 분석해드립니다' }, 6));
    htmlParts.push(getDynamicSection(colors, { title: `${keyword} 자주 묻는 질문 FAQ`, emoji: '❓', content: '자주 묻는 질문에 답해드립니다' }, 7));
  }

  htmlParts.push(getSummaryCardSection(keyword));
  htmlParts.push(getClosingSection(colors, refLink, referenceSentence));
  htmlParts.push(getTagsSection(topic, keyword));

  return `
<div style="font-family: 'Noto Sans KR', sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; font-size: 17px; box-sizing: border-box; padding: 0 16px; word-break: keep-all; overflow-wrap: break-word;">
  <style>
    ${getCssStyles(colors)}
  </style>
  <div class="wrapper-div">
    ${htmlParts.join('\n')}
  </div>
</div>
`;
};
