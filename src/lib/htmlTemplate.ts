const getCssStyles = (colors: any): string => `
@media (max-width: 768px) { 
  .wrapper-div { padding: 0 15px !important; }
  /* 모바일에서 이미지 더 크게 표시 - !important 추가 */
  img { 
    max-width: 100% !important; 
    min-height: 250px !important; 
    object-fit: cover !important;
    margin: 20px 0 !important;
  }
  /* 모바일에서 여백 강제 조정 */
  .wrapper-div * {
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 15px !important;
    padding-right: 15px !important;
    box-sizing: border-box !important;
  }
  /* 특정 요소들은 패딩 초기화 */
  .wrapper-div h1, .wrapper-div h2, .wrapper-div h3, .wrapper-div p, .wrapper-div div {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
}
@media (max-width: 480px) {
  /* 작은 모바일에서도 충분한 크기 보장 - !important 추가 */
  img { 
    min-height: 200px !important; 
  }
  .wrapper-div {
    padding: 0 10px !important;
  }
}
.single-summary-card-container{font-family:'Noto Sans KR',sans-serif;display:flex;justify-content:center;align-items:center;padding:25px 15px;background-color:${colors.highlight};margin:25px 0}.single-summary-card{width:100%;max-width:700px;background-color:#ffffff;border-radius:15px;box-shadow:0 8px 24px rgba(0,0,0,0.15);padding:30px;display:flex;flex-direction:column;overflow:hidden;border:1px solid ${colors.highlightBorder};box-sizing:border-box}.single-summary-card .card-header{display:flex;align-items:center;border-bottom:2px solid ${colors.primary};padding-bottom:15px;margin-bottom:15px}.single-summary-card .card-header-icon{font-size:38px;color:${colors.primary};margin-right:16px}.single-summary-card .card-header h3{font-size:28px;color:${colors.primary};margin:0;line-height:1.3;font-weight:700}.single-summary-card .card-content{flex-grow:1;display:flex;flex-direction:column;justify-content:flex-start;font-size:18px;line-height:1.7;color:#333}.single-summary-card .card-content .section{margin-bottom:12px;line-height:1.7}.single-summary-card .card-content .section:last-child{margin-bottom:0}.single-summary-card .card-content strong{color:${colors.primary};font-weight:600}.single-summary-card .card-content .highlight{background-color:${colors.textHighlight};padding:3px 8px;border-radius:4px;font-weight:bold}.single-summary-card .card-content .formula{background-color:${colors.secondary};padding:8px 12px;border-radius:6px;font-size:0.95em;text-align:center;margin-top:8px;color:${colors.primary}}.single-summary-card .card-footer{font-size:15px;color:#777;text-align:center;padding-top:15px;border-top:1px dashed ${colors.highlightBorder};margin-top:auto}@media (max-width:768px){.single-summary-card-container{padding:20px 10px}.single-summary-card{padding:22px;border-radius:10px}.single-summary-card .card-header-icon{font-size:32px;margin-right:12px}.single-summary-card .card-header h3{font-size:24px}.single-summary-card .card-content{font-size:16px;line-height:1.6}.single-summary-card .card-content .section{margin-bottom:10px;line-height:1.6}.single-summary-card .card-content .highlight{padding:2px 5px}.single-summary-card .card-content .formula{padding:7px 10px;font-size:.9em}.single-summary-card .card-footer{font-size:14px;padding-top:12px}}@media (max-width:480px){.single-summary-card{padding:18px;border-radius:8px}.single-summary-card .card-header-icon{font-size:28px;margin-right:10px}.single-summary-card .card-header h3{font-size:20px}.single-summary-card .card-content{font-size:15px;line-height:1.5}.single-summary-card .card-content .section{margin-bottom:8px;line-height:1.5}.single-summary-card .card-content .formula{padding:6px 8px;font-size:.85em}.single-summary-card .card-footer{font-size:13px;padding-top:10px}}
`;

// AdSense 광고 코드 생성 함수 - 직접 삽입 방식으로 변경
const generateAdSenseCode = (adClient: string, adSlot: string): string => {
  // 입력값 검증
  if (!adClient || !adSlot) {
    console.warn('AdSense 설정이 불완전합니다:', { adClient, adSlot });
    return '';
  }

  // Gemini가 해석하지 않도록 직접 HTML 코드 반환
  return `
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${adClient}"
     crossorigin="anonymous"></script>
<!-- 중간 광고 -->
<ins class="adsbygoogle"
     style="display:block; margin:30px 0 !important;"
     data-ad-client="ca-pub-${adClient}"
     data-ad-slot="${adSlot}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
`;
};

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

// 동적 섹션 생성 함수 수정 - 광고 삽입을 후처리로 변경
const getDynamicSection = (colors: any, heading: { title: string; emoji: string; content: string }, sectionNumber: number): string => {
  return `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>${heading.title} ${heading.emoji}</b></h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
[SECTION_CONTENT_${sectionNumber}] 관련해서 많은 분들이 궁금해하시는 부분들을 전문가 수준의 깊이 있는 정보로 설명드리겠어요. 단순한 안내가 아닌, 실제로 성공적인 결과를 얻을 수 있는 구체적인 방법들을 중심으로 다뤄보겠습니다.
</p>
<p style="height: 20px;">&nbsp;</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
${heading.content}를 통해 더 구체적인 내용을 확인하실 수 있어요. 여기서는 일반적으로 알려지지 않은 전문가만의 노하우와 실무에서 바로 적용 가능한 팁들을 공유드릴게요. 복잡해 보일 수 있지만 단계별로 차근차근 따라하시면 누구나 성공할 수 있답니다.
</p>
<p style="height: 20px;">&nbsp;</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
특히 이 부분에서 많은 분들이 놓치기 쉬운 중요한 포인트들과 함정들을 미리 알려드릴게요. 실제 경험을 바탕으로 한 구체적인 수치와 사례들도 함께 제공해드리니 꼭 참고해보시기 바라요. 😊
</p>
<p style="height: 20px;">&nbsp;</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
마지막으로 이 분야의 최신 동향과 앞으로의 변화 전망까지 포함해서 여러분이 더 나은 선택을 할 수 있도록 도움을 드리겠습니다. 💡
</p>
${sectionNumber === 2 ? `
<div style="overflow-x: auto; margin: 25px 0; padding: 0;">
<table style="min-width: 100%; width: 100%; border-collapse: collapse; font-size: 16px; table-layout: auto;">
<thead><tr><th style="padding:14px;text-align:left;border:1px solid #ddd;background-color:#f5f5f5;font-weight:bold;color:#333;">단계</th><th style="padding:14px;text-align:left;border:1px solid #ddd;background-color:#f5f5f5;font-weight:bold;color:#333;">신청 방법</th><th style="padding:14px;text-align:left;border:1px solid #ddd;background-color:#f5f5f5;font-weight:bold;color:#333;">필요 서류</th><th style="padding:14px;text-align:left;border:1px solid #ddd;background-color:#f5f5f5;font-weight:bold;color:#333;">소요 기간</th></tr></thead>
<tbody>
<tr><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">1단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">자격 요건 확인 후 거주지 주민센터 방문 또는 온라인 신청 사이트 접속</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">신분증, 가족관계증명서</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">즉시</td></tr>
<tr style="background-color: #f9f9f9;"><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">2단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">신청서 작성 및 소득·재산 관련 서류 제출</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">소득증명서, 재산세 납세증명서</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">1-2일</td></tr>
<tr><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">3단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">접수 완료 후 심사 진행 (약 2주 소요)</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">통장 사본</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">14일</td></tr>
<tr style="background-color: #f9f9f9;"><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">4단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">승인 시 바우처 카드 발급 및 충전</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">-</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">3-5일</td></tr>
</tbody></table></div>
` : ''}
${sectionNumber === 3 ? `
<div style="background-color: ${colors.warnBg}; border-left: 5px solid ${colors.warnBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
    <strong style="color: ${colors.warnBorder};">⚠️ 전문가 팁 - 꼭 확인하세요!</strong><br>
    <ul style="margin: 10px 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">신청 기간을 놓치면 그 해 지원이 불가능해요 - 보통 11월부터 다음해 10월까지</li>
        <li style="margin-bottom: 8px;">가구원 수에 따라 지원 금액이 달라지니 정확한 가구원 신고가 중요해요</li>
        <li style="margin-bottom: 8px;">바우처 카드는 <a href="https://www.energyvoucher.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">에너지바우처 공식사이트</a>에서 미리 확인하세요</li>
        <li style="margin-bottom: 8px;">소득·재산 기준이 매년 조금씩 변동될 수 있으니 신청 전 최신 정보를 확인하세요</li>
        <li>복수 지원금 동시 신청 시 중복 제한이 있을 수 있으니 사전 문의가 필수입니다</li>
    </ul>
</div>
` : ''}
${sectionNumber === 5 ? `
<div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
<p style="margin-bottom: 15px; font-size: 16px; line-height: 1.6;"><strong>Q: 신청 후 언제부터 사용 가능한가요?</strong><br>
A: 승인 후 약 1-2주 내에 카드가 발급되며, 발급 즉시 사용 가능합니다. 카드 활성화는 자동으로 처리되니 별도 절차는 불필요해요.</p>
<p style="margin-bottom: 15px; font-size: 16px; line-height: 1.6;"><strong>Q: 다른 가족이 대신 신청할 수 있나요?</strong><br>
A: 세대주 또는 배우자만 신청 가능하며, 위임장과 함께 인감증명서가 있으면 대리 신청도 가능합니다. 단, 대리인은 성인이어야 해요.</p>
<p style="margin-bottom: 15px; font-size: 16px; line-height: 1.6;"><strong>Q: 이사를 가면 어떻게 되나요?</strong><br>
A: 주소 변경 신고를 하시면 새로운 주소에서도 계속 사용 가능하며, 카드 재발급 없이 기존 카드로 이용할 수 있어요.</p>
<p style="margin-bottom: 0; font-size: 16px; line-height: 1.6;"><strong>Q: 카드를 분실했을 때는 어떻게 하나요?</strong><br>
A: 즉시 발급기관에 분실신고를 하시고, 재발급 신청을 하시면 됩니다. 잔액은 그대로 보호되니 걱정하지 마세요.</p>
</div>
` : ''}
<p style="height: 20px;">&nbsp;</p>
`;
};

const getEncouragementSection = (colors: any, keyword: string, refLink: string, referenceSentence?: string): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>더 자세한 세부 정보가 필요하시요? 🌟</b></h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
혹시 더 궁금한 것이 있으시거나 추가적인 도움이 필요하시다면 언제든지 문의해보세요. [SECTION_CONTENT_6] 관련 정보는 계속해서 업데이트되고 있어서, 최신 정보를 놓치지 않으시길 바라요.
</p>
<p style="height: 20px;">&nbsp;</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
여러분도 충분히 할 수 있어요! 많은 분들이 이미 성공적으로 혜택을 받고 계시니까 포기하지 마시고 도전해보세요. 💪 작은 한 걸음이 큰 변화를 만들어낼 거예요.
</p>
<p style="height: 20px;">&nbsp;</p>
<p style="margin-bottom: 18px; font-size: 18px; line-height: 1.8; text-align: center; background-color: ${colors.secondary}; padding: 35px 25px; border-radius: 12px; min-height: 80px; display: flex; align-items: center; justify-content: center;" data-ke-size="size16">
<strong>👉 <a href="${refLink}" target="_blank" rel="noopener" style="color: ${colors.primary}; text-decoration: underline; font-weight: bold;">${referenceSentence || '워드프레스 꿀팁 더 보러가기'}</a></strong>
</p>
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
<div class="section"><strong>신청 기간:</strong> <span class="highlight">매년 11월부터 다음해 10월까지 (연중 신청 가능)</span></div>
</div>
<div class="card-footer">성공적인 신청을 위한 필수 체크리스트!</div>
</div>
</div>
`;

const getClosingSection = (colors: any, refLink: string, referenceSentence?: string): string => `
<p style="margin-bottom: 15px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
지금까지 [SECTION_CONTENT_5] 관련 정보에 대해 전문가 수준의 깊이 있는 내용으로 다뤄봤는데요, 실제로 도움이 되는 정보들을 얻으셨길 바라요. 에너지 비용 부담을 줄이는 것은 가계 경제에 정말 큰 도움이 되니까요.
</p>
<p style="height: 20px;">&nbsp;</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
신청 자격에 해당하신다면 꼭 신청해서 혜택을 받으시길 권해드려요! 위에서 알려드린 전문가 팁들을 활용하시면 더욱 원활하게 진행하실 수 있을 거예요. 😊
</p>
<p style="height: 20px;">&nbsp;</p>
<p style="height: 20px;">&nbsp;</p>
<p style="text-align: center; font-size: 18px; margin-bottom: 30px;" data-ke-size="size16"><b>이 글과 관련된 다른 정보가 궁금하다면?</b><br>👉 <a href="${refLink}" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline; font-weight: bold;"><strong>${referenceSentence || '워드프레스 꿀팁 더 보러가기'}</strong></a></p>
<p style="height: 30px;">&nbsp;</p>
`;

const getTagsSection = (topic: string, keyword: string): string => {
  // 주제에서 핵심 키워드 추출 - 더 유연한 로직으로 개선
  const extractKeywordsFromTopic = (topicText: string): string[] => {
    console.log('Original topic:', topicText);
    
    // 불필요한 단어들 제거
    const stopWords = [
      '활용법', '방법', '전략', '가이드', '완벽', '최신', '최대한', '확실하게', 
      '업법', '성공률', '높이는', '꿀팁', '노하우', '비법', '총정리', '정리',
      '2024년', '2025년', '현재', '최근', '신청', '지원', '혜택'
    ];
    
    let cleanedTopic = topicText;
    
    // 불필요한 단어들 제거
    stopWords.forEach(word => {
      cleanedTopic = cleanedTopic.replace(new RegExp(word, 'g'), '');
    });
    
    // 특수문자 제거 및 공백 정리
    cleanedTopic = cleanedTopic
      .replace(/[:]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log('Cleaned topic:', cleanedTopic);
    
    // 50자 이하이고 의미있는 내용이면 포함
    if (cleanedTopic.length <= 50 && cleanedTopic.length > 2) {
      return [cleanedTopic];
    }
    
    // 긴 주제의 경우 핵심 단어만 추출 시도
    const words = cleanedTopic.split(' ').filter(word => word.length > 1);
    const meaningfulWords = words.filter(word => 
      !stopWords.includes(word) && 
      word.length >= 2 && 
      word.length <= 15
    );
    
    console.log('Meaningful words:', meaningfulWords);
    return meaningfulWords.slice(0, 2); // 최대 2개까지만
  };

  // 기본 태그들을 생성 (keyword는 항상 포함)
  const baseTags = [keyword];
  
  // 주제에서 추출한 핵심 키워드
  const topicKeywords = extractKeywordsFromTopic(topic);
  console.log('Extracted topic keywords:', topicKeywords);
  
  const additionalTags = [
    '신청방법',
    '지원대상', 
    '혜택',
    '정부지원',
    '2025년',
    '교육과정',
    '생활정보'
  ];
  
  // 중복 제거 후 태그 조합
  const allTags = [...new Set([...baseTags, ...topicKeywords, ...additionalTags])];
  console.log('Final tags:', allTags);
  
  return `
<div style="margin-top: 30px; padding: 15px 0;">
<p style="font-size: 14px; line-height: 1.4; color: #666; text-align: left;">${allTags.join(', ')}</p>
</div>
<p style="height: 20px;">&nbsp;</p>`;
};

// AdSense 설정 인터페이스 정의
interface AdSenseSettings {
  enabled: boolean;
  adClient: string;
  adSlot: string;
  adCount: number;
}

// 동적 HTML 템플릿 생성 함수 수정 - 후처리 방식으로 변경
export const getHtmlTemplate = (
  colors: any, 
  topic: string, 
  keyword: string, 
  refLink: string, 
  referenceSentence?: string,
  dynamicHeadings?: Array<{ title: string; emoji: string; content: string }>,
  adSenseSettings?: AdSenseSettings
): string => {
  console.log('HTML 템플릿 생성 시작:', { topic, keyword, adSenseSettings });

  try {
    const htmlParts = [
      getHeaderSection(topic),
      getIntroSection(colors, keyword),
    ];

    // 동적 소제목이 있으면 5개만 사용, 없으면 기본 5개 섹션 사용
    if (dynamicHeadings && dynamicHeadings.length >= 5) {
      dynamicHeadings.slice(0, 5).forEach((heading, index) => {
        htmlParts.push(getDynamicSection(colors, heading, index + 1));
      });
    } else {
      // 기본 5개 섹션들
      const defaultHeadings = [
        { title: `${keyword} 핵심 정보와 완벽 분석`, emoji: '💡', content: '기본 정보를 전문가 수준으로 분석합니다' },
        { title: `${keyword} 신청 방법 완벽 가이드`, emoji: '📝', content: '신청 절차를 상세하게 안내합니다' },
        { title: `${keyword} 자격 요건과 전문가 팁`, emoji: '👥', content: '자격 요건과 숨겨진 팁을 공개합니다' },
        { title: `${keyword} 혜택 분석과 활용법`, emoji: '💰', content: '혜택을 최대화하는 방법을 알려드립니다' },
        { title: `${keyword} FAQ와 실무 노하우`, emoji: '❓', content: '실무에서 필요한 모든 정보를 제공합니다' }
      ];
      
      defaultHeadings.forEach((heading, index) => {
        htmlParts.push(getDynamicSection(colors, heading, index + 1));
      });
    }

    // 6번째 섹션 (격려 섹션) 추가
    htmlParts.push(getEncouragementSection(colors, keyword, refLink, referenceSentence));
    htmlParts.push(getSummaryCardSection(keyword));
    htmlParts.push(getClosingSection(colors, refLink, referenceSentence));
    htmlParts.push(getTagsSection(topic, keyword));

    // 기본 HTML 생성 (광고 없이)
    let finalHtml = `
<div style="font-family: 'Noto Sans KR', sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; font-size: 17px; box-sizing: border-box; padding: 0 16px; word-break: keep-all; overflow-wrap: break-word;">
  <style>
    ${getCssStyles(colors)}
  </style>
  <div class="wrapper-div">
    ${htmlParts.join('\n')}
  </div>
</div>
`;

    // AdSense 광고를 후처리로 삽입
    finalHtml = insertAdSenseAds(finalHtml, adSenseSettings);

    console.log('HTML 템플릿 생성 완료');
    return finalHtml;
  } catch (error) {
    console.error('HTML 템플릿 생성 중 오류:', error);
    throw new Error(`HTML 템플릿 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
};

// AdSense 광고를 HTML에 직접 삽입하는 함수 추가
const insertAdSenseAds = (html: string, adSenseSettings?: AdSenseSettings): string => {
  if (!adSenseSettings?.enabled || !adSenseSettings?.adClient || !adSenseSettings?.adSlot) {
    return html;
  }

  try {
    // H2 태그를 찾아서 광고 삽입
    const h2Regex = /<h2[^>]*>.*?<\/h2>/gi;
    const h2Matches = html.match(h2Regex);
    
    if (!h2Matches || h2Matches.length === 0) {
      console.log('H2 태그를 찾을 수 없어 광고를 삽입하지 않습니다.');
      return html;
    }

    const totalSections = h2Matches.length;
    const adCount = Math.min(adSenseSettings.adCount || 1, 3);
    
    // 광고 삽입 위치 계산
    const getAdPositions = (count: number, total: number): number[] => {
      if (count <= 0) return [];
      
      const positions: number[] = [];
      if (count === 1) {
        positions.push(Math.floor(total / 2));
      } else {
        const interval = total / count;
        for (let i = 0; i < count; i++) {
          positions.push(Math.floor(interval * (i + 1)) - 1);
        }
      }
      return positions.filter(pos => pos >= 0 && pos < total);
    };

    const adPositions = getAdPositions(adCount, totalSections);
    console.log('광고 삽입 위치:', adPositions, '전체 H2 개수:', totalSections);

    if (adPositions.length === 0) {
      return html;
    }

    // AdSense 광고 코드 생성
    const adCode = generateAdSenseCode(adSenseSettings.adClient, adSenseSettings.adSlot);
    
    // H2 태그들을 찾아서 광고 삽입
    let modifiedHtml = html;
    let insertedCount = 0;
    
    adPositions.reverse().forEach(position => {
      if (position < h2Matches.length) {
        const targetH2 = h2Matches[position];
        const h2Index = modifiedHtml.indexOf(targetH2);
        
        if (h2Index !== -1) {
          modifiedHtml = modifiedHtml.substring(0, h2Index) + 
                        adCode + 
                        modifiedHtml.substring(h2Index);
          insertedCount++;
          console.log(`광고 ${insertedCount}개 삽입 완료 (위치: ${position})`);
        }
      }
    });

    console.log(`총 ${insertedCount}개의 광고가 삽입되었습니다.`);
    return modifiedHtml;

  } catch (error) {
    console.error('AdSense 광고 삽입 중 오류:', error);
    return html;
  }
};
