const getCssStyles = (colors: any): string => `
@media (max-width: 768px) { .wrapper-div { padding: 0 15px; } }
.single-summary-card-container{font-family:'Noto Sans KR',sans-serif;display:flex;justify-content:center;align-items:center;padding:25px 15px;background-color:${colors.highlight};margin:25px 0}.single-summary-card{width:100%;max-width:700px;background-color:#ffffff;border-radius:15px;box-shadow:0 8px 24px rgba(0,0,0,0.15);padding:30px;display:flex;flex-direction:column;overflow:hidden;border:1px solid ${colors.highlightBorder};box-sizing:border-box}.single-summary-card .card-header{display:flex;align-items:center;border-bottom:2px solid ${colors.primary};padding-bottom:15px;margin-bottom:15px}.single-summary-card .card-header-icon{font-size:38px;color:${colors.primary};margin-right:16px}.single-summary-card .card-header h3{font-size:28px;color:${colors.primary};margin:0;line-height:1.3;font-weight:700}.single-summary-card .card-content{flex-grow:1;display:flex;flex-direction:column;justify-content:flex-start;font-size:18px;line-height:1.7;color:#333}.single-summary-card .card-content .section{margin-bottom:12px;line-height:1.7}.single-summary-card .card-content .section:last-child{margin-bottom:0}.single-summary-card .card-content strong{color:${colors.primary};font-weight:600}.single-summary-card .card-content .highlight{background-color:${colors.textHighlight};padding:3px 8px;border-radius:4px;font-weight:bold}.single-summary-card .card-content .formula{background-color:${colors.secondary};padding:8px 12px;border-radius:6px;font-size:0.95em;text-align:center;margin-top:8px;color:${colors.primary}}.single-summary-card .card-footer{font-size:15px;color:#777;text-align:center;padding-top:15px;border-top:1px dashed ${colors.highlightBorder};margin-top:auto}@media (max-width:768px){.single-summary-card-container{padding:20px 10px}.single-summary-card{padding:22px;border-radius:10px}.single-summary-card .card-header-icon{font-size:32px;margin-right:12px}.single-summary-card .card-header h3{font-size:24px}.single-summary-card .card-content{font-size:16px;line-height:1.6}.single-summary-card .card-content .section{margin-bottom:10px;line-height:1.6}.single-summary-card .card-content .highlight{padding:2px 5px}.single-summary-card .card-content .formula{padding:7px 10px;font-size:.9em}.single-summary-card .card-footer{font-size:14px;padding-top:12px}}@media (max-width:480px){.single-summary-card{padding:18px;border-radius:8px}.single-summary-card .card-header-icon{font-size:28px;margin-right:10px}.single-summary-card .card-header h3{font-size:20px}.single-summary-card .card-content{font-size:15px;line-height:1.5}.single-summary-card .card-content .section{margin-bottom:8px;line-height:1.5}.single-summary-card .card-content .formula{padding:6px 8px;font-size:.85em}.single-summary-card .card-footer{font-size:13px;padding-top:10px}}
`;

const getHeaderSection = (topic: string): string => `
<h3 style="font-size: 28px; color: #333; margin-top: 25px; margin-bottom: 20px; text-align: center; line-height: 1.4;" data-ke-size="size23">${topic}</h3>
`;

const getIntroSection = (colors: any, keyword: string): string => `
<div style="background-color: ${colors.secondary}; padding: 18px; border-radius: 10px; font-style: italic; margin-bottom: 28px; font-size: 18px; line-height: 1.7;"><b>[독자의 흥미를 유발하는 강력한 질문으로 시작]</b> [이 글을 통해 얻게 될 핵심 가치를 요약 설명. '이 글을 끝까지 읽으시면 ~을 확실히 알게 되실 거예요!' 와 같은 문장 포함. 최소 2문장 이상 작성]</div>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[개인적인 경험이나 일화를 2~3문단에 걸쳐 구체적으로 공유하며 독자와의 깊은 공감대 형성. 핵심 키워드 '${keyword}'를 자연스럽게 포함] 😥 [이후 <span style="background-color: ${colors.textHighlight}; padding: 3px 6px; border-radius: 4px; font-weight: bold;">핵심 노하우</span>를 깨닫게 된 계기를 스토리텔링으로 연결]</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[이 글이 다른 글과 어떻게 다른지, 초보자도 쉽게 이해할 수 있다는 점을 강조하며 글의 신뢰도를 높임] 😊</p>
`;

const getProblemDefinitionSection = (colors: any, keyword: string): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>'${keyword}', 왜 중요할까요? 기본 개념부터 제대로 알기</b> 💡</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[첫 번째 소제목에 대한 상세 설명. 왜 이 내용이 중요한지, 독자가 겪는 문제의 근본 원인을 심층적으로 분석. 전문 용어는 쉽게 풀어서 설명. 최소 2~3문단 이상 작성.]</p>
<div style="background-color: ${colors.highlight}; border-left: 5px solid ${colors.highlightBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;"><strong style="color: ${colors.primary};">💡 알아두세요!</strong><br>[독자가 꼭 알아야 할 핵심 팁이나 기본 원칙을 간결하지만 구체적으로 작성. '${keyword}' 관련 내용이면 더욱 좋음. 관련 정보를 더 찾아볼 수 있는 외부 링크를 하나 포함.]</div>
`;

const getSolutionGuideSection = (colors: any, keyword: string): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>'${keyword}' 실천 가이드: 단계별로 따라하기</b> 📝</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[해결 방법에 대한 전반적인 소개. 따라하기 쉽다는 점 강조. 전체 과정을 간략하게 요약.]</p>
<div style="overflow-x: auto; margin: 25px 0; padding: 0;">
<table style="min-width: 100%; width: 100%; border-collapse: collapse; font-size: 16px; table-layout: auto;">
<thead><tr><th style="padding:14px;text-align:left;border:1px solid #ddd;background-color:#f5f5f5;font-weight:bold;color:#333;">단계</th><th style="padding:14px;text-align:left;border:1px solid #ddd;background-color:#f5f5f5;font-weight:bold;color:#333;">핵심 내용</th><th style="padding:14px;text-align:left;border:1px solid #ddd;background-color:#f5f5f5;font-weight:bold;color:#333;">포인트</th></tr></thead>
<tbody>
<tr><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">1단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">[1단계 내용 상세 설명: 독자가 쉽게 따라할 수 있도록 최소 2-3문장으로 구체적으로 서술]</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">[1단계에서 가장 중요한 핵심 포인트]</td></tr>
<tr style="background-color: #f9f9f9;"><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">2단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">[2단계 내용 상세 설명: 독자가 쉽게 따라할 수 있도록 최소 2-3문장으로 구체적으로 서술]</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">[2단계에서 가장 중요한 핵심 포인트]</td></tr>
<tr><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">3단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">[3단계 내용 상세 설명: 독자가 쉽게 따라할 수 있도록 최소 2-3문장으로 구체적으로 서술]</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">[3단계에서 가장 중요한 핵심 포인트]</td></tr>
<tr style="background-color: #f9f9f9;"><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">4단계</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">[4단계 내용 상세 설명: 독자가 쉽게 따라할 수 있도록 최소 2-3문장으로 구체적으로 서술. 필요시 단계 추가]</td><td style="padding:14px;text-align:left;border:1px solid #ddd;line-height:1.6;">[4단계에서 가장 중요한 핵심 포인트]</td></tr>
</tbody></table></div>
`;

const getPracticalExampleSection = (colors: any, keyword: string): string => `
<div style="background-color: ${colors.secondary}; padding: 20px; border-radius: 10px; margin: 25px 0; font-size: 17px; line-height: 1.6; box-sizing: border-box;">
<h3 style="font-size: 20px; color: #333; margin: 0 0 12px; font-weight: bold; line-height: 1.5;">실제 적용 사례 📝</h3>
<p style="margin-bottom: 15px;">[실제 적용 사례를 구체적인 스토리로 설명. <span style="background-color: ${colors.textHighlight}; padding: 3px 6px; border-radius: 4px; font-weight: bold;">수치적 결과 (예: '비용 30% 절감', '시간 50% 단축')</span>를 보여주면 신뢰도 상승. 최소 2문단 이상 작성.]</p>
<p>[사례를 통해 얻은 교훈이나 독려 메시지. '${keyword}' 관리의 중요성 강조.]</p>
</div>
`;

const getTipsAndWarningsSection = (colors: any, keyword: string): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>'${keyword}' 성공률을 높이는 꿀팁과 주의사항</b> ⚠️</h2>
<div style="background-color: ${colors.warnBg}; border-left: 5px solid ${colors.warnBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
    <strong style="color: ${colors.warnBorder};">⚠️ 꼭 확인하세요!</strong><br>
    [독자들이 흔히 하는 실수나 꼭 알아야 할 주의사항, 그리고 추가적인 꿀팁을 리스트(ul, li) 형태로 3~4가지 구체적으로 작성. 각 항목은 실제 경험을 바탕으로 상세하게 설명. 여기서도 유용한 외부 자료 링크를 하나 포함 가능.]
</div>
`;

const getFailureCaseSection = (colors: any, keyword: string): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>'${keyword}' 적용 시 흔한 실패 사례와 극복법</b> 😥</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[${keyword} 적용 과정에서 흔히 겪는 실패 사례를 2-3가지 구체적으로 제시합니다. 실패의 원인을 분석하고, 이를 어떻게 극복했는지에 대한 실제적인 경험담이나 해결책을 상세히 서술해주세요. 이 부분은 독자에게 현실적인 조언을 제공하여 신뢰도를 높입니다. 최소 2~3문단 이상 작성.]</p>
`;

const getDeepDiveSection = (colors: any, keyword: string): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>'${keyword}' 심화 탐구: 전문가처럼 활용하기</b> 🧐</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[핵심 키워드와 관련된 연관 키워드를 사용하여 독자들이 더 깊이 알고 싶어할 만한 내용을 다룹니다. 전문적인 정보나 데이터를 포함하여 신뢰성을 높여주세요. 최소 2~3문단 이상 작성.]</p>
`;

const getRelatedKeywordsSection = (colors: any, keyword: string): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>'${keyword}'와 함께 쓰면 좋은 연관 검색어 전략</b> 📈</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[핵심 키워드 '${keyword}'와 함께 검색되는 연관 검색어들을 2~3개 제시하고, 각 연관 검색어를 어떻게 활용하여 콘텐츠를 더욱 풍부하게 만들 수 있는지 구체적인 아이디어와 예시를 들어 설명합니다. 이를 통해 포스트의 주제 확장성과 SEO 점수를 동시에 높일 수 있다는 점을 강조해주세요. 최소 2~3문단 이상 작성.]</p>
`;

const getSuccessCaseSection = (colors: any, keyword: string): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>'${keyword}' 성공 사례 분석: 이렇게 활용하세요</b> ✨</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[실제 성공 사례나 가상의 성공 스토리를 통해 '${keyword}'를 활용했을 때 얻을 수 있는 긍정적인 결과를 생생하게 보여줍니다. 독자들이 자신도 할 수 있다는 자신감을 얻도록 동기부여를 해주세요. 최소 2~3문단 이상 작성.]</p>
`;

const getSummaryCardSection = (keyword: string): string => `
<div class="single-summary-card-container">
<div class="single-summary-card">
<div class="card-header"><span class="card-header-icon">💡</span><h3 data-ke-size="size23">${keyword} 관리, 핵심만 요약!</h3></div>
<div class="card-content">
<div class="section"><strong>[요약 1 제목]:</strong> <span class="highlight">[요약 1 내용: 간결하고 명확하게]</span></div>
<div class="section"><strong>[요약 2 제목]:</strong> <span class="highlight">[요약 2 내용: 독자가 기억하기 쉽게]</span></div>
<div class="section"><strong>[요약 3 제목]:</strong><div class="formula">[요약 3 내용: 공식처럼 표현]</div></div>
<div class="section"><strong>[요약 4 제목]:</strong> <span class="highlight">[요약 4 내용: 가장 중요한 팁]</span></div>
</div>
<div class="card-footer">성공적인 ${keyword} 관리를 위한 필수 체크리스트!</div>
</div>
</div>
`;

const getFaqSection = (colors: any, topic: string, keyword: string): string => `
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>자주 묻는 질문 (FAQ)</b> ❓</h2>
<div style="margin: 30px 0;">
<div style="margin-bottom: 22px;"><div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [핵심 키워드 '${keyword}'와 관련된 첫 번째 예상 질문]</div><div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [첫 번째 질문에 대한 명확하고 상세한 답변]</div></div>
<div style="margin-bottom: 22px;"><div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [주제 '${topic}'에 대한 두 번째 예상 질문]</div><div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [두 번째 질문에 대한 상세한 답변. 초보자도 이해하기 쉽게]</div></div>
<div style="margin-bottom: 22px;"><div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [독자들이 가장 궁금해할 만한 세 번째 예상 질문]</div><div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [세 번째 질문에 대한 추가 정보 또는 팁 제공]</div></div>
<div style="margin-bottom: 22px;"><div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [네 번째 심층 질문]</div><div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [네 번째 질문에 대한 전문가 수준의 답변]</div></div>
</div>
`;

const getClosingSection = (colors: any, keyword: string, refLink: string): string => `
<p style="margin-bottom: 15px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[글을 마무리하며 핵심 내용을 다시 한번 요약하고, 독자에게 도움이 되었기를 바라는 마음을 표현. '${keyword}'의 중요성을 마지막으로 강조. 독자의 행동을 유도하는 문장 포함.] 😊</p>
<p style="text-align: center; font-size: 18px;" data-ke-size="size16"><b>이 글과 관련된 다른 정보가 궁금하다면?</b><br>👉 <a href="${refLink}" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: none; font-weight: bold;"><strong>워드프레스 꿀팁 더 보러가기</strong></a></p>
<br><br>
`;

const getTagsSection = (topic: string, keyword: string): string => `
[${keyword}, ${topic} 등 관련 키워드를 콤마로 구분하여 5개에서 10개 사이의 태그를 생성하여 나열해주세요. 목록의 끝을 ...으로 마무리하는 등, 내용을 완성하지 않고 생략하면 안 됩니다. 반드시 완성된 전체 태그 목록을 제공해야 합니다.]
`;

export const getHtmlTemplate = (colors: any, topic: string, keyword: string, refLink: string): string => {
  const htmlParts = [
    getHeaderSection(topic),
    getIntroSection(colors, keyword),
    getProblemDefinitionSection(colors, keyword),
    getSolutionGuideSection(colors, keyword),
    getPracticalExampleSection(colors, keyword),
    getTipsAndWarningsSection(colors, keyword),
    getFailureCaseSection(colors, keyword),
    getDeepDiveSection(colors, keyword),
    getRelatedKeywordsSection(colors, keyword),
    getSuccessCaseSection(colors, keyword),
    getSummaryCardSection(keyword),
    getFaqSection(colors, topic, keyword),
    getClosingSection(colors, keyword, refLink),
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
