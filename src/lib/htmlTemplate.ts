
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
최근 많은 분들이 [CONTENT_KEYWORD_1]에 대해 관심을 갖고 계시는데요. 실제로 저도 이 제도를 통해 도움을 받았던 경험이 있어요. 처음엔 복잡한 절차와 조건들 때문에 포기하려고 했었는데, 차근차근 알아보니 생각보다 어렵지 않더라고요. 😊
</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
이 글에서는 복잡한 용어나 절차를 쉽게 풀어서 설명드릴 예정이에요. 특히 실제 신청 과정에서 놓치기 쉬운 부분들까지 상세히 다뤄보겠습니다! 💡
</p>

<br>
`;

const getProblemDefinitionSection = (colors: any): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>핵심 정보와 기본 내용 완벽 정리</b> 💡</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
[SECTION_CONTENT_1]가 정확히 무엇인지, 누구에게 지급되는지 궁금하시죠? 이 제도는 에너지 비용 부담을 줄여주기 위한 정부 지원 정책이에요. 저소득층과 차상위계층을 대상으로 하며, 전기·가스·지역난방비 등에 사용할 수 있답니다.
</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
많은 분들이 신청 자격이나 지급 방식에 대해 헷갈려하시는데, 실제로는 생각보다 간단해요. 가장 중요한 건 정확한 정보를 알고 제때 신청하는 것이랍니다.
</p>
<div style="background-color: ${colors.highlight}; border-left: 5px solid ${colors.highlightBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.primary};">💡 꼭 기억하세요!</strong><br>
에너지바우처는 소급 적용이 되지 않아요. 신청 기간을 놓치면 그 해 지원을 받을 수 없으니, 미리 확인하고 준비하시는 게 중요해요. 자세한 내용은 <a href="https://www.welfaresupport.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">복지정보포털</a>에서 확인하실 수 있어요.
</div>
`;

const getSolutionGuideSection = (colors: any): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>신청 방법 단계별 가이드</b> 📝</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
[SECTION_CONTENT_2] 신청 과정이 복잡해 보일 수 있지만, 한 단계씩 따라하시면 어렵지 않아요. 온라인과 오프라인 모두 가능하니 편한 방법을 선택하세요.
</p>
<div style="overflow-x: auto; margin: 25px 0; padding: 0;">
<table style="min-width: 100%; width: 100%; border-collapse: collapse; font-size: 16px; table-layout: auto;">
<thead><tr><th style="padding:14px;text-align:left;border:1px solid #ddd;background-color:#f5f5f5;font-weight:bold;color:#333;">단계</th><th style="padding:14px;text-align:left;border:1px solid #ddd;background-color:#f5f5f5;font-weight:bold;color:#333;">신청 방법</th><th style="padding:14px;text-align:left;border:1px solid #ddd;background-color:#f5f5f5;font-weight:bold;color:#333;">필요 서류</th></tr></thead>
<tbody>
<tr><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">1단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">자격 요건 확인 후 거주지 주민센터 방문 또는 온라인 신청 사이트 접속</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">신분증, 가족관계증명서</td></tr>
<tr style="background-color: #f9f9f9;"><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">2단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">신청서 작성 및 소득·재산 관련 서류 제출</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">소득증명서, 재산세 납세증명서</td></tr>
<tr><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">3단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">접수 완료 후 심사 진행 (약 2주 소요)</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">통장 사본</td></tr>
<tr style="background-color: #f9f9f9;"><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">4단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">승인 시 바우처 카드 발급 및 충전</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">-</td></tr>
</tbody></table></div>
`;

const getTipsAndWarningsSection = (colors: any): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>신청 시 꼭 알아야 할 주의사항</b> ⚠️</h2>
<div style="background-color: ${colors.warnBg}; border-left: 5px solid ${colors.warnBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
    <strong style="color: ${colors.warnBorder};">⚠️ 꼭 확인하세요!</strong><br>
    <ul style="margin: 10px 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">신청 기간을 놓치면 그 해 지원이 불가능해요 - 보통 11월부터 다음해 10월까지</li>
        <li style="margin-bottom: 8px;">가구원 수에 따라 지원 금액이 달라지니 정확한 가구원 신고가 중요해요</li>
        <li style="margin-bottom: 8px;">[SECTION_CONTENT_3] 관련 정보는 <a href="https://www.energyvoucher.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">에너지바우처 공식사이트</a>에서 미리 확인하세요</li>
        <li>소득·재산 기준이 매년 조금씩 변동될 수 있으니 신청 전 최신 정보를 확인하세요</li>
    </ul>
</div>
`;

const getFailureCaseSection = (colors: any): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>실패 사례와 해결 방법</b> 😥</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
실제로 신청 과정에서 실패하시는 분들의 가장 흔한 원인은 서류 준비 미흡이에요. 특히 [SECTION_CONTENT_4] 관련 소득증명서의 기준 시점을 잘못 이해하거나, 가구원 정보를 부정확하게 기재하는 경우가 많아요.
</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
또 다른 실패 원인은 신청 시기를 놓치는 것인데요. 많은 분들이 연말에 몰려서 신청하다가 마감일을 넘기는 경우가 있어요. 가능하면 신청 시작과 동시에 준비하시는 것을 추천드려요.
</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
재신청이 가능한 경우도 있으니, 한 번 실패했다고 포기하지 마시고 부족한 서류를 보완해서 다시 도전해보세요. 주민센터 담당자분들이 친절하게 도와주실 거예요.
</p>
`;

const getDeepDiveSection = (colors: any): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>지원 대상 및 금액 상세 안내</b> 🧐</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
[SECTION_CONTENT_5] 지원 대상은 기준 중위소득 60% 이하 가구로, 생계급여·의료급여 수급자와 차상위계층이 해당돼요. 가구원 수에 따라 1인 가구 22만원부터 6인 이상 가구 70만원까지 차등 지급되고 있어요.
</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
특히 2025년부터는 지원 금액이 상향 조정되어 더 많은 도움을 받으실 수 있게 되었어요. 또한 사용처도 확대되어 전기·가스·지역난방뿐만 아니라 일부 연탄·등유 구매에도 사용 가능해졌답니다.
</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
자세한 소득 기준과 지원 금액은 <a href="https://www.mw.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">보건복지부 공식 홈페이지</a>에서 확인하실 수 있어요.
</p>
`;

const getRelatedInfoSection = (colors: any): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>관련 추가 혜택 및 지원 제도</b> 📈</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
[SECTION_CONTENT_6] 외에도 저소득층을 위한 다양한 에너지 지원 제도가 있어요. 전기요금 할인, 가스요금 할인, 연탄쿠폰 지원 등이 있는데, 이런 제도들을 함께 활용하면 에너지 비용을 더욱 효과적으로 절약할 수 있답니다.
</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
특히 겨울철에는 한파대응 추가 지원도 있으니, 평소보다 난방비가 많이 나올 것 같다면 이런 제도들도 함께 알아보시길 권해드려요. 중복 신청이 가능한 경우도 있어서 더 많은 혜택을 받으실 수 있어요.
</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
또한 에너지 효율 개선 사업이나 취약계층 주거환경 개선 사업 등도 있으니, 근본적인 에너지 절약을 원하신다면 이런 프로그램들도 살펴보세요.
</p>
`;

const getCommonMistakesSection = (colors: any): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>많은 사람들이 놓치는 중요한 포인트</b> 🔍</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
많은 분들이 [SECTION_CONTENT_7] 신청할 때 가장 자주 놓치는 부분이 있어요. 바로 '소득 산정 기준 시점'인데요. 대부분 현재 소득으로 생각하시는데, 실제로는 신청일 기준 최근 3개월 평균 소득을 기준으로 한답니다.
</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
또 다른 놓치기 쉬운 포인트는 '가구원 범위'예요. 주민등록상 동일 세대가 아니더라도 실제 생계를 같이하는 가족이 있다면 가구원에 포함될 수 있어요. 이 부분을 정확히 신고하지 않으면 나중에 문제가 될 수 있으니 주의하세요.
</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
마지막으로 많은 분들이 [SECTION_CONTENT_8] 관련해서 헷갈리는 부분은 '중복 신청'인데요. 다른 에너지 지원 제도와 함께 신청할 수 있는 경우가 많으니, 이런 정보들도 미리 알아보시면 더 많은 혜택을 받으실 수 있어요.
</p>
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

const getFaqSection = (colors: any, topic: string): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>자주 묻는 질문 (FAQ)</b> ❓</h2>
<div style="margin: 30px 0;">
<div style="margin-bottom: 22px;"><div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: 신청 자격은 어떻게 되나요?</div><div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: 기준 중위소득 60% 이하 가구가 대상이며, 생계급여·의료급여 수급자와 차상위계층이 해당됩니다. 정확한 소득 기준은 가구원 수에 따라 달라지니 주민센터에서 확인해보세요.</div></div>
<div style="margin-bottom: 22px;"><div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: 바우처 카드는 어디서 사용할 수 있나요?</div><div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: 전국 가스, 전기, 지역난방 공급업체와 연탄·등유 판매점에서 사용 가능합니다. 사용 가능한 업체 목록은 에너지바우처 홈페이지에서 확인하실 수 있어요.</div></div>
<div style="margin-bottom: 22px;"><div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: 신청 후 언제부터 사용할 수 있나요?</div><div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: 신청 후 심사를 거쳐 약 2주 정도 소요되며, 승인되면 바우처 카드가 발급됩니다. 카드 수령 즉시 사용 가능해요.</div></div>
<div style="margin-bottom: 22px;"><div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: 다른 에너지 할인 혜택과 중복 적용이 가능한가요?</div><div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: 대부분의 다른 에너지 할인 혜택과 중복 적용이 가능합니다. 전기요금 할인, 가스요금 할인 등과 함께 받으실 수 있어요.</div></div>
</div>
`;

const getEncouragingClosingSection = (colors: any, refLink: string, referenceSentence?: string): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>당신도 할 수 있어요! 꿈을 향한 첫걸음을 응원합니다</b> 💪✨</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
여기까지 읽어주신 당신, 정말 대단해요! 관련 정보에 대해 꼼꼼히 알아보시는 모습에서 진정한 성공의 자질이 보입니다. 많은 분들이 복잡해 보인다는 이유로 포기하시는데, 여러분은 끝까지 정보를 찾아보고 계시잖아요. 😊
</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
처음엔 어려워 보일 수 있지만, 한 걸음씩 차근차근 따라하시면 반드시 좋은 결과가 있을 거예요. 작은 변화가 모여서 큰 변화를 만들어내듯이, 오늘 알아본 이 정보가 여러분의 삶에 작지만 의미 있는 변화의 시작이 되길 바라요.
</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
혹시 신청 과정에서 막히는 부분이 있더라도 포기하지 마세요. 주변에 도움을 요청하거나, 관련 기관에 문의하시면 친절하게 도와주실 거예요. 여러분의 용기 있는 도전을 진심으로 응원합니다! 🌟
</p>
`;

const getClosingSection = (colors: any, refLink: string, referenceSentence?: string): string => `
<p style="margin-bottom: 15px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">
지금까지 관련 정보에 대해 자세히 알아봤는데요, 도움이 되셨길 바라요. 에너지 비용 부담을 줄이는 것은 가계 경제에 정말 큰 도움이 되니까요. 신청 자격에 해당하신다면 꼭 신청해서 혜택을 받으시길 권해드려요! 😊
</p>
<p style="text-align: center; font-size: 18px; margin-bottom: 30px;" data-ke-size="size16"><b>이 글과 관련된 다른 정보가 궁금하다면?</b><br>👉 <a href="${refLink}" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: none; font-weight: bold;"><strong>${referenceSentence || '더 많은 정보 확인하기'}</strong></a></p>
<br><br>
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
<div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 10px; border-left: 4px solid #4CAF50;">
<h3 style="font-size: 18px; color: #333; margin-bottom: 15px; font-weight: bold;">📌 관련 태그</h3>
<p style="font-size: 16px; line-height: 1.6; color: #555;">${allTags.join(', ')}</p>
</div>
<br>`;
};

export const getHtmlTemplate = (colors: any, topic: string, keyword: string, refLink: string, referenceSentence?: string): string => {
  const htmlParts = [
    getHeaderSection(topic),
    getIntroSection(colors, keyword),
    getProblemDefinitionSection(colors),
    getSolutionGuideSection(colors),
    getTipsAndWarningsSection(colors),
    getFailureCaseSection(colors),
    getDeepDiveSection(colors),
    getRelatedInfoSection(colors),
    getCommonMistakesSection(colors),
    getSummaryCardSection(keyword),
    getEncouragingClosingSection(colors, refLink, referenceSentence),
    getFaqSection(colors, topic),
    getClosingSection(colors, refLink, referenceSentence),
    getTagsSection(topic, keyword),
  ];

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
