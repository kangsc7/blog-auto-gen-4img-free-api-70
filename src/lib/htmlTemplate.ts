const getCssStyles = (colors: any): string => `
@media (max-width: 768px) { .wrapper-div { padding: 0 15px; } }
.single-summary-card-container{font-family:'Noto Sans KR',sans-serif;display:flex;justify-content:center;align-items:center;padding:25px 15px;background-color:${colors.highlight};margin:25px 0}.single-summary-card{width:100%;max-width:700px;background-color:#ffffff;border-radius:15px;box-shadow:0 8px 24px rgba(0,0,0,0.15);padding:30px;display:flex;flex-direction:column;overflow:hidden;border:1px solid ${colors.highlightBorder};box-sizing:border-box}.single-summary-card .card-header{display:flex;align-items:center;border-bottom:2px solid ${colors.primary};padding-bottom:15px;margin-bottom:15px}.single-summary-card .card-header-icon{font-size:38px;color:${colors.primary};margin-right:16px}.single-summary-card .card-header h3{font-size:28px;color:${colors.primary};margin:0;line-height:1.3;font-weight:700}.single-summary-card .card-content{flex-grow:1;display:flex;flex-direction:column;justify-content:flex-start;font-size:18px;line-height:1.7;color:#333}.single-summary-card .card-content .section{margin-bottom:12px;line-height:1.7}.single-summary-card .card-content .section:last-child{margin-bottom:0}.single-summary-card .card-content strong{color:${colors.primary};font-weight:600}.single-summary-card .card-content .highlight{background-color:${colors.textHighlight};padding:3px 8px;border-radius:4px;font-weight:bold}.single-summary-card .card-content .formula{background-color:${colors.secondary};padding:8px 12px;border-radius:6px;font-size:0.95em;text-align:center;margin-top:8px;color:${colors.primary}}.single-summary-card .card-footer{font-size:15px;color:#777;text-align:center;padding-top:15px;border-top:1px dashed ${colors.highlightBorder};margin-top:auto}@media (max-width:768px){.single-summary-card-container{padding:20px 10px}.single-summary-card{padding:22px;border-radius:10px}.single-summary-card .card-header-icon{font-size:32px;margin-right:12px}.single-summary-card .card-header h3{font-size:24px}.single-summary-card .card-content{font-size:16px;line-height:1.6}.single-summary-card .card-content .section{margin-bottom:10px;line-height:1.6}.single-summary-card .card-content .highlight{padding:2px 5px}.single-summary-card .card-content .formula{padding:7px 10px;font-size:.9em}.single-summary-card .card-footer{font-size:14px;padding-top:12px}}@media (max-width:480px){.single-summary-card{padding:18px;border-radius:8px}.single-summary-card .card-header-icon{font-size:28px;margin-right:10px}.single-summary-card .card-header h3{font-size:20px}.single-summary-card .card-content{font-size:15px;line-height:1.5}.single-summary-card .card-content .section{margin-bottom:8px;line-height:1.5}.single-summary-card .card-content .formula{padding:6px 8px;font-size:.85em}.single-summary-card .card-footer{font-size:13px;padding-top:10px}}
`;

export const getHtmlTemplate = (colors: any, topic: string, keyword: string, refLink: string): string => `
<div style="font-family: 'Noto Sans KR', sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; font-size: 17px; box-sizing: border-box; padding: 0 16px; word-break: keep-all; overflow-wrap: break-word;">
<style>
${getCssStyles(colors)}
</style>
<div class="wrapper-div">
<h3 style="font-size: 28px; color: #333; margin-top: 25px; margin-bottom: 20px; text-align: center; line-height: 1.4;" data-ke-size="size23">${topic}</h3>
<div style="background-color: ${colors.secondary}; padding: 18px; border-radius: 10px; font-style: italic; margin-bottom: 28px; font-size: 18px; line-height: 1.7;"><b>[독자의 흥미를 유발하는 강력한 질문으로 시작]</b> [이 글을 통해 얻게 될 핵심 가치를 요약 설명. '이 글을 끝까지 읽으시면 ~을 확실히 알게 되실 거예요!' 와 같은 문장 포함. 최소 2문장 이상 작성]</div>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[개인적인 경험이나 일화를 2~3문단에 걸쳐 구체적으로 공유하며 독자와의 깊은 공감대 형성. 핵심 키워드 '${keyword}'를 자연스럽게 포함] 😥 [이후 <span style="background-color: ${colors.textHighlight}; padding: 3px 6px; border-radius: 4px; font-weight: bold;">핵심 노하우</span>를 깨닫게 된 계기를 스토리텔링으로 연결]</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[이 글이 다른 글과 어떻게 다른지, 초보자도 쉽게 이해할 수 있다는 점을 강조하며 글의 신뢰도를 높임] 😊</p>
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>[문제 제기 또는 기본 개념에 대한 소제목. '${keyword}' 포함]</b> 💡</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[첫 번째 소제목에 대한 상세 설명. 왜 이 내용이 중요한지, 독자가 겪는 문제의 근본 원인을 심층적으로 분석. 전문 용어는 쉽게 풀어서 설명. 최소 2~3문단 이상 작성.]</p>
<div style="background-color: ${colors.highlight}; border-left: 5px solid ${colors.highlightBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;"><strong style="color: ${colors.primary};">💡 알아두세요!</strong><br>[독자가 꼭 알아야 할 핵심 팁이나 기본 원칙을 간결하지만 구체적으로 작성. '${keyword}' 관련 내용이면 더욱 좋음. 관련 정보를 더 찾아볼 수 있는 외부 링크를 하나 포함.]</div>
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>[구체적인 해결 방법 또는 단계별 가이드에 대한 소제목. '${keyword}' 포함]</b> 📝</h2>
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
<div style="background-color: ${colors.secondary}; padding: 20px; border-radius: 10px; margin: 25px 0; font-size: 17px; line-height: 1.6; box-sizing: border-box;">
<h3 style="font-size: 20px; color: #333; margin: 0 0 12px; font-weight: bold; line-height: 1.5;">실제 적용 사례 📝</h3>
<p style="margin-bottom: 15px;">[실제 적용 사례를 구체적인 스토리로 설명. <span style="background-color: ${colors.textHighlight}; padding: 3px 6px; border-radius: 4px; font-weight: bold;">수치적 결과 (예: '비용 30% 절감', '시간 50% 단축')</span>를 보여주면 신뢰도 상승. 최소 2문단 이상 작성.]</p>
<p>[사례를 통해 얻은 교훈이나 독려 메시지. '${keyword}' 관리의 중요성 강조.]</p>
</div>
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>[성공률을 높이는 꿀팁 및 주의사항에 대한 소제목]</b> ⚠️</h2>
<div style="background-color: ${colors.warnBg}; border-left: 5px solid ${colors.warnBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
    <strong style="color: ${colors.warnBorder};">⚠️ 꼭 확인하세요!</strong><br>
    [독자들이 흔히 하는 실수나 꼭 알아야 할 주의사항, 그리고 추가적인 꿀팁을 리스트(ul, li) 형태로 3~4가지 구체적으로 작성. 각 항목은 실제 경험을 바탕으로 상세하게 설명. 여기서도 유용한 외부 자료 링크를 하나 포함 가능.]
</div>
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>['${keyword}' 적용 시 실패 사례와 극복 방법]</b> 😥</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[${keyword} 적용 과정에서 흔히 겪는 실패 사례를 2-3가지 구체적으로 제시합니다. 실패의 원인을 분석하고, 이를 어떻게 극복했는지에 대한 실제적인 경험담이나 해결책을 상세히 서술해주세요. 이 부분은 독자에게 현실적인 조언을 제공하여 신뢰도를 높입니다. 최소 2~3문단 이상 작성.]</p>
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>['${keyword}'와 관련된 심화 탐구 소제목]</b> 🧐</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[핵심 키워드와 관련된 연관 키워드를 사용하여 독자들이 더 깊이 알고 싶어할 만한 내용을 다룹니다. 전문적인 정보나 데이터를 포함하여 신뢰성을 높여주세요. 최소 2~3문단 이상 작성.]</p>
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>['${keyword}' 연관 검색어 활용 전략]</b> 📈</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[핵심 키워드 '${keyword}'와 함께 검색되는 연관 검색어들을 2~3개 제시하고, 각 연관 검색어를 어떻게 활용하여 콘텐츠를 더욱 풍부하게 만들 수 있는지 구체적인 아이디어와 예시를 들어 설명합니다. 이를 통해 포스트의 주제 확장성과 SEO 점수를 동시에 높일 수 있다는 점을 강조해주세요. 최소 2~3문단 이상 작성.]</p>
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>['${keyword}' 활용 성공 사례 분석에 대한 소제목]</b> ✨</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[실제 성공 사례나 가상의 성공 스토리를 통해 '${keyword}'를 활용했을 때 얻을 수 있는 긍정적인 결과를 생생하게 보여줍니다. 독자들이 자신도 할 수 있다는 자신감을 얻도록 동기부여를 해주세요. 최소 2~3문단 이상 작성.]</p>
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>['${keyword}' 관련 추천 도구 및 서비스 소제목]</b> 🛠️</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[${keyword} 작업의 효율성을 높여주는 유용한 도구나 온라인 서비스를 2~3가지 추천하고, 각 도구의 장점과 사용법을 간략하게 설명합니다. 실제 사용 경험을 바탕으로 작성하면 신뢰도가 높아집니다.]</p>
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
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>자주 묻는 질문 (FAQ)</b> ❓</h2>
<div style="margin: 30px 0;">
<div style="margin-bottom: 22px;"><div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [핵심 키워드 '${keyword}'와 관련된 첫 번째 예상 질문]</div><div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [첫 번째 질문에 대한 명확하고 상세한 답변]</div></div>
<div style="margin-bottom: 22px;"><div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [주제 '${topic}'에 대한 두 번째 예상 질문]</div><div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [두 번째 질문에 대한 상세한 답변. 초보자도 이해하기 쉽게]</div></div>
<div style="margin-bottom: 22px;"><div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [독자들이 가장 궁금해할 만한 세 번째 예상 질문]</div><div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [세 번째 질문에 대한 추가 정보 또는 팁 제공]</div></div>
<div style="margin-bottom: 22px;"><div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [네 번째 심층 질문]</div><div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [네 번째 질문에 대한 전문가 수준의 답변]</div></div>
</div>
<p style="margin-bottom: 15px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[글을 마무리하며 핵심 내용을 다시 한번 요약하고, 독자에게 도움이 되었기를 바라는 마음을 표현. '${keyword}'의 중요성을 마지막으로 강조. 독자의 행동을 유도하는 문장 포함.] 😊</p>
<p style="text-align: center; font-size: 18px;" data-ke-size="size16"><b>이 글과 관련된 다른 정보가 궁금하다면?</b><br>👉 <a href="${refLink}" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: none; font-weight: bold;"><strong>워드프레스 꿀팁 더 보러가기</strong></a></p>
<br><br>
[${keyword}, ${topic} 등 관련 키워드를 콤마로 구분하여 5개에서 10개 사이의 태그를 생성하여 나열해주세요. 목록의 끝을 ...으로 마무리하는 등, 내용을 완성하지 않고 생략하면 안 됩니다. 반드시 완성된 전체 태그 목록을 제공해야 합니다.]
</div>
</div>
`;
```

```typescript
import { getColors } from './promptUtils';
import { getHtmlTemplate } from './htmlTemplate';

interface ArticlePromptParams {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink?: string;
  referenceSentence?: string;
}

export const getArticlePrompt = ({
  topic,
  keyword,
  selectedColorTheme,
  referenceLink,
  referenceSentence,
}: ArticlePromptParams): string => {
  const colors = getColors(selectedColorTheme);
  const refLink = referenceLink || 'https://worldpis.com';
  const htmlTemplate = getHtmlTemplate(colors, topic, keyword, refLink);

  return `
        당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.
        주제: "${topic}"
        핵심 키워드: "${keyword}"

        다음 지침에 따라, 독자의 시선을 사로잡고 검색 엔진 상위 노출을 목표로 하는 완벽한 블로그 게시물을 작성해주세요.
        - 출력 형식: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요. HTML 외에 다른 텍스트, 설명, 마크다운 형식(\`\`\`html)을 포함하지 마세요.
        - 콘텐츠 독창성: 동일한 주제나 키워드로 이전에 글을 작성했을 수 있습니다. 하지만 이번에는 완전히 새로운 관점과 독창적인 접근 방식을 사용해야 합니다. 이전 글과 절대 중복되지 않는, 완전히 새로운 글을 생성해주세요. 예시, 비유, 스토리텔링을 다르게 구성하고, 글의 구조와 표현 방식에도 변화를 주어 독자에게 신선한 가치를 제공해야 합니다. 이 지침은 검색 엔진의 중복 콘텐츠 페널티를 피하기 위해 매우 중요합니다.
        - **독자 중심 글쓰기 (매우 중요)**: 글의 모든 내용은 독자가 '${topic}'에 대해 검색했을 때 가장 궁금해하고, 알고 싶어하는 정보를 중심으로 구성해야 합니다. 단순히 정보를 나열하는 것을 넘어, 독자의 문제를 해결해주고 실질적인 도움을 준다는 느낌을 주어야 합니다. 독자의 입장에서 '이 글을 읽길 정말 잘했다'고 느낄 수 있도록 깊이 있는 분석, 구체적인 예시, 실행 가능한 조언을 풍부하게 담아주세요.
        - 대상 독자: 한국어 사용자
        - **콘텐츠 분량 (매우 중요)**: SEO 점수 100점을 위해, 전체 글자 수는 반드시 **1,600 단어에서 2,000 단어 사이**여야 합니다. 이는 100점 달성을 위한 필수 조건입니다. 각 섹션을 매우 상세하고 깊이 있게 다루어 분량을 확보하고, 특히 새로 추가된 '실패 사례와 극복 방법' 섹션을 포함하여 모든 소제목에 충실한 내용을 채워 이 분량을 달성해주세요.
        - **키워드 밀도 (가장 중요한 규칙)**: SEO 100점 달성을 위해, 핵심 키워드 '${keyword}'의 밀도를 **정확히 1.5% ~ 2.5%**로 맞춰야 합니다. 이는 **가장 중요한 요구사항**입니다. 예를 들어, 총 단어가 2,000개라면 '${keyword}'는 30번에서 50번 사이로 등장해야 합니다. 글을 완성한 후, 직접 단어 수와 키워드 등장 횟수를 세어 밀도를 확인하고, 범위를 벗어난다면 반드시 수정하여 이 규칙을 준수해야 합니다. 이 밀도 범위를 벗어나는 것은 절대 허용되지 않습니다.
        - 콘텐츠 스타일: 제공된 HTML 템플릿과 스타일을 정확히 사용해야 합니다. 모든 섹션('[ ]'으로 표시된 부분)을 실제 가치를 제공하는 풍부하고 자연스러운 콘텐츠로 채워주세요.
        - 문체: 전체 글의 어조를 일관되게 유지해주세요. 독자에게 말을 거는 듯한 친근하고 부드러운 구어체('~해요', '~죠' 체)를 사용해주세요. 단, '핵심만 요약!' 카드 섹션은 간결하고 명료한 정보 전달을 위해 '~입니다', '~습니다'체를 사용해도 좋습니다. 개인적인 경험이나 스토리를 섞어 독자의 공감을 얻고, 이모지(예: 😊, 💡, 😥)를 적절히 사용하여 글의 생동감을 더해주세요.
        - **키워드 강조 (매우 중요)**: 글의 가독성과 SEO를 위해, **각 H2 소제목 아래 본문에서** 핵심 키워드 '${keyword}'는 문맥에 맞게 자연스럽게 사용하되, **정확히 1~2번만** \`<strong>${keyword}</strong>\` 와 같이 \`<strong>\` 태그로 강조해주세요. **절대로 2번을 초과하여 강조해서는 안 됩니다.** 이 규칙은 모든 H2 섹션에 예외 없이 엄격하게 적용됩니다.
        - 가독성 향상: 독자가 내용을 쉽게 읽을 수 있도록 문단 구성을 최적화해야 합니다. **각 단락은 최대 3개의 문장으로 구성하는 것을 원칙으로 합니다.** 만약 한 단락에 3개 이상의 문장이 포함될 경우, 의미 단위에 맞게 자연스럽게 별도의 단락으로 나눠주세요. 이는 가독성 점수를 높이는 데 매우 중요합니다.
        - 내부/외부 링크: 글의 신뢰도를 높이기 위해, 본문 내용과 관련된 권위 있는 외부 사이트나 통계 자료로 연결되는 링크를 최소 2개 이상 자연스럽게 포함해주세요. 예를 들어, '한 연구에 따르면...' 과 같은 문장에 실제 연구 자료 링크를 추가할 수 있습니다. 링크는 반드시 a 태그를 사용해야 합니다.
        - 참조 링크 텍스트: HTML 템플릿의 끝에 위치한 참조 링크의 앵커 텍스트를 아래 "사용할 변수" 섹션의 "Reference Sentence" 값으로 설정해주세요. 만약 "Reference Sentence" 값이 비어있다면, 기본 텍스트인 "더 많은 정보 확인하기"를 사용하세요.
        - **가장 중요한 최종 규칙**: 위에서 **(매우 중요)** 또는 **(가장 중요한 규칙)**이라고 표시된 **콘텐츠 분량**과 **키워드 밀도** 지침은 이 작업에서 가장 중요합니다. 어떤 경우에도 이 두 가지 규칙을 어겨서는 안 됩니다.

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
        - Reference Sentence: ${referenceSentence}
        - Topic: ${topic}
        - Main Keyword: ${keyword}

        아래는 반드시 따라야 할 HTML 템플릿입니다.
        
        --- HTML TEMPLATE START ---
${htmlTemplate}
--- HTML TEMPLATE END ---
      `;
};
