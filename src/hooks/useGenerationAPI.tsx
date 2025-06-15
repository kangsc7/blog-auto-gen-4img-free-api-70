
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { colorThemes } from '@/data/constants';

export const useGenerationAPI = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const generateTopics = async (keywordOverride?: string): Promise<string[] | null> => {
    const keyword = (keywordOverride || appState.keyword).trim();
    if (!keyword) {
      toast({
        title: "키워드 오류",
        description: "핵심 키워드를 입력해주세요.",
        variant: "destructive"
      });
      return null;
    }

    if (!appState.isApiKeyValidated) {
      toast({
        title: "API 키 검증 필요",
        description: "먼저 API 키를 입력하고 검증해주세요.",
        variant: "destructive"
      });
      return null;
    }

    setIsGeneratingTopics(true);
    
    try {
      const count = appState.topicCount;
      const prompt = `'${keyword}'를(을) 주제로, 구글과 네이버 검색에 최적화된 블로그 포스팅 제목 ${count}개를 생성해 주세요. 각 제목은 사람들이 클릭하고 싶게 만드는 흥미로운 내용이어야 합니다. 결과는 각 제목을 줄바꿈으로 구분하여 번호 없이 텍스트만 제공해주세요. 다른 설명 없이 주제 목록만 생성해주세요.`;
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
      }
      
      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }
      
      const generatedText = data.candidates[0].content.parts[0].text;
      const newTopics = generatedText.split('\n').map(topic => topic.replace(/^[0-9-."']+\s*/, '').trim()).filter(topic => topic.length > 0);

      saveAppState({ topics: newTopics });
      toast({ title: "AI 기반 주제 생성 완료", description: `${newTopics.length}개의 새로운 주제가 생성되었습니다.` });
      return newTopics;
    } catch (error) {
      console.error('주제 생성 오류:', error);
      toast({ title: "주제 생성 실패", description: error instanceof Error ? error.message : "주제 생성 중 오류가 발생했습니다.", variant: "destructive" });
      return null;
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  const generateArticle = async (topicOverride?: string): Promise<string | null> => {
    const selectedTopic = topicOverride || appState.selectedTopic;
    if (!selectedTopic) {
      toast({ title: "주제 선택 오류", description: "주제를 먼저 선택해주세요.", variant: "destructive" });
      return null;
    }
    if (!appState.isApiKeyValidated) {
      toast({ title: "API 키 검증 필요", description: "먼저 API 키를 입력하고 검증해주세요.", variant: "destructive" });
      return null;
    }

    setIsGeneratingContent(true);
    saveAppState({ generatedContent: '' });
    
    try {
      const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
      const selectedColorTheme = appState.colorTheme || randomTheme.value;
      
      const getColors = (theme: string) => {
        const colorMap: { [key: string]: any } = {
          'blue-gray': { primary: '#1a73e8', secondary: '#f5f5f5', textHighlight: '#e8f4fd', highlight: '#e8f4fd', highlightBorder: '#1a73e8', warnBg: '#ffebee', warnBorder: '#f44336', link: '#1a73e8' },
          'green-orange': { primary: '#059669', secondary: '#f0fdf4', textHighlight: '#dcfce7', highlight: '#f1f8e9', highlightBorder: '#10b981', warnBg: '#fed7aa', warnBorder: '#e11d48', link: '#16a34a' },
          'purple-yellow': { primary: '#7c3aed', secondary: '#fefce8', textHighlight: '#f3e8ff', highlight: '#faf5ff', highlightBorder: '#9333ea', warnBg: '#fff1f2', warnBorder: '#e91e63', link: '#8b5cf6' },
          'teal-light-gray': { primary: '#0d9488', secondary: '#f8fafc', textHighlight: '#ccfbf1', highlight: '#f0fdfa', highlightBorder: '#14b8a6', warnBg: '#fffde7', warnBorder: '#ffeb3b', link: '#0d9488' },
          'terracotta-light-gray': { primary: '#e57373', secondary: '#fafafa', textHighlight: '#ffebee', highlight: '#fff8e1', highlightBorder: '#ffab91', warnBg: '#fce4ec', warnBorder: '#e11d48', link: '#e57373' },
          'classic-blue': { primary: '#1a73e8', secondary: '#f5f5f5', textHighlight: '#fffde7', highlight: '#e8f4fd', highlightBorder: '#1a73e8', warnBg: '#ffebee', warnBorder: '#f44336', link: '#1a73e8' },
          'nature-green': { primary: '#4caf50', secondary: '#f1f8e9', textHighlight: '#e8f5e9', highlight: '#f1f8e9', highlightBorder: '#81c784', warnBg: '#fff3e0', warnBorder: '#ff9800', link: '#4caf50' },
          'royal-purple': { primary: '#673ab7', secondary: '#f3e5f5', textHighlight: '#ede7f6', highlight: '#f3e5f5', highlightBorder: '#9575cd', warnBg: '#fce4ec', warnBorder: '#e91e63', link: '#673ab7' },
          'future-teal': { primary: '#009688', secondary: '#e0f2f1', textHighlight: '#b2dfdb', highlight: '#e0f2f1', highlightBorder: '#4db6ac', warnBg: '#fffde7', warnBorder: '#ffeb3b', link: '#009688' },
          'earth-terracotta': { primary: '#ff7043', secondary: '#fbe9e7', textHighlight: '#ffccbc', highlight: '#fbe9e7', highlightBorder: '#ff8a65', warnBg: '#fff9c4', warnBorder: '#fdd835', link: '#ff7043' }
        };
        return colorMap[theme] || colorMap['classic-blue'];
      };
      
      const colors = getColors(selectedColorTheme);
      const refLink = appState.referenceLink || 'https://worldpis.com';
      const topic = selectedTopic;
      const keyword = appState.keyword || topic.split(' ')[0];
      const prompt = `
        당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.
        주제: "${topic}"
        핵심 키워드: "${keyword}"

        다음 지침에 따라, 독자의 시선을 사로잡고 검색 엔진 상위 노출을 목표로 하는 완벽한 블로그 게시물을 작성해주세요.
        - 출력 형식: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요. HTML 외에 다른 텍스트, 설명, 마크다운 형식(\`\`\`html)을 포함하지 마세요.
        - 대상 독자: 한국어 사용자
        - SEO 최적화: Google 및 Naver 검색 엔진에 최적화된 콘텐츠여야 합니다. 제목, 소제목, 본문에 핵심 키워드를 자연스럽게 2~3% 밀도로 배치해주세요.
        - 콘텐츠 스타일: 제공된 HTML 템플릿과 스타일을 정확히 사용해야 합니다. 모든 섹션('[ ]'으로 표시된 부분)을 실제 가치를 제공하는 풍부하고 자연스러운 콘텐츠로 채워주세요.
        - 문체: 친근하고 유익하며, 독자의 공감을 얻을 수 있도록 개인적인 경험이나 스토리를 섞어주세요. 이모지(예: 😊, 💡, 😥)를 적절히 사용하여 글의 생동감을 더해주세요.
        - 콘텐츠 분량: 최소 1500단어 이상의 풍부하고 깊이 있는 내용으로 작성해주세요. 각 섹션에 할당된 지침보다 더 상세하고 구체적인 정보를 제공하여 독자의 체류 시간을 극대화해야 합니다.
        - 내부/외부 링크: 글의 신뢰도를 높이기 위해, 본문 내용과 관련된 권위 있는 외부 사이트나 통계 자료로 연결되는 링크를 최소 2개 이상 자연스럽게 포함해주세요. 예를 들어, '한 연구에 따르면...' 과 같은 문장에 실제 연구 자료 링크를 추가할 수 있습니다. 링크는 반드시 a 태그를 사용해야 합니다.

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
        - Topic: ${topic}
        - Main Keyword: ${keyword}

        아래는 반드시 따라야 할 HTML 템플릿입니다. 구조와 클래스, 인라인 스타일을 절대 변경하지 마세요.
        
        --- HTML TEMPLATE START ---
<div style="font-family: 'Noto Sans KR', sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; font-size: 17px; box-sizing: border-box; padding: 0 8px; word-break: break-all; overflow-wrap: break-word;">
<style>
@media (max-width: 768px) { .wrapper-div { padding: 0 10px !important; } }
.single-summary-card-container{font-family:'Noto Sans KR',sans-serif;display:flex;justify-content:center;align-items:center;padding:25px 15px;background-color:${colors.highlight};margin:25px 0}.single-summary-card{width:100%;max-width:700px;background-color:#ffffff;border-radius:15px;box-shadow:0 8px 24px rgba(0,0,0,0.15);padding:30px;display:flex;flex-direction:column;overflow:hidden;border:1px solid ${colors.highlightBorder};box-sizing:border-box}.single-summary-card .card-header{display:flex;align-items:center;border-bottom:2px solid ${colors.primary};padding-bottom:15px;margin-bottom:15px}.single-summary-card .card-header-icon{font-size:38px;color:${colors.primary};margin-right:16px}.single-summary-card .card-header h3{font-size:28px;color:${colors.primary};margin:0;line-height:1.3;font-weight:700}.single-summary-card .card-content{flex-grow:1;display:flex;flex-direction:column;justify-content:flex-start;font-size:18px;line-height:1.7;color:#333}.single-summary-card .card-content .section{margin-bottom:12px;line-height:1.7}.single-summary-card .card-content .section:last-child{margin-bottom:0}.single-summary-card .card-content strong{color:${colors.primary};font-weight:600}.single-summary-card .card-content .highlight{background-color:${colors.textHighlight};padding:3px 8px;border-radius:4px;font-weight:bold}.single-summary-card .card-content .formula{background-color:${colors.secondary};padding:8px 12px;border-radius:6px;font-size:0.95em;text-align:center;margin-top:8px;color:${colors.primary}}.single-summary-card .card-footer{font-size:15px;color:#777;text-align:center;padding-top:15px;border-top:1px dashed ${colors.highlightBorder};margin-top:auto}@media (max-width:768px){.single-summary-card-container{padding:20px 10px}.single-summary-card{padding:22px;border-radius:10px}.single-summary-card .card-header-icon{font-size:32px;margin-right:12px}.single-summary-card .card-header h3{font-size:24px}.single-summary-card .card-content{font-size:16px;line-height:1.6}.single-summary-card .card-content .section{margin-bottom:10px;line-height:1.6}.single-summary-card .card-content .highlight{padding:2px 5px}.single-summary-card .card-content .formula{padding:7px 10px;font-size:.9em}.single-summary-card .card-footer{font-size:14px;padding-top:12px}}@media (max-width:480px){.single-summary-card{padding:18px;border-radius:8px}.single-summary-card .card-header-icon{font-size:28px;margin-right:10px}.single-summary-card .card-header h3{font-size:20px}.single-summary-card .card-content{font-size:15px;line-height:1.5}.single-summary-card .card-content .section{margin-bottom:8px;line-height:1.5}.single-summary-card .card-content .formula{padding:6px 8px;font-size:.85em}.single-summary-card .card-footer{font-size:13px;padding-top:10px}}
</style>
<div class="wrapper-div">
<h3 style="font-size: 28px; color: #333; margin-top: 25px; margin-bottom: 20px; text-align: center; line-height: 1.4;" data-ke-size="size23">${topic}</h3>
<div style="background-color: ${colors.secondary}; padding: 18px; border-radius: 10px; font-style: italic; margin-bottom: 28px; font-size: 18px; line-height: 1.7;"><b>[독자의 흥미를 유발하는 강력한 질문으로 시작]</b> [이 글을 통해 얻게 될 핵심 가치를 요약 설명. '이 글을 끝까지 읽으시면 ~을 확실히 알게 되실 거예요!' 와 같은 문장 포함. 최소 2문장 이상 작성]</div>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[개인적인 경험이나 일화를 2~3문단에 걸쳐 구체적으로 공유하며 독자와의 깊은 공감대 형성. 핵심 키워드 '${keyword}'를 자연스럽게 포함] 😥 [이후 <span style="background-color: ${colors.textHighlight}; padding: 3px 6px; border-radius: 4px; font-weight: bold;">핵심 노하우</span>를 깨닫게 된 계기를 스토리텔링으로 연결]</p>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[이 글이 다른 글과 어떻게 다른지, 초보자도 쉽게 이해할 수 있다는 점을 강조하며 글의 신뢰도를 높임] 😊</p>
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>[첫 번째 핵심 소제목: 문제 제기 또는 기본 개념. '${keyword}' 포함]</b> 💡</h2>
<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[첫 번째 소제목에 대한 상세 설명. 왜 이 내용이 중요한지, 독자가 겪는 문제의 근본 원인을 심층적으로 분석. 전문 용어는 쉽게 풀어서 설명. 최소 2~3문단 이상 작성.]</p>
<div style="background-color: ${colors.highlight}; border-left: 5px solid ${colors.highlightBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;"><strong style="color: ${colors.primary};">💡 알아두세요!</strong><br>[독자가 꼭 알아야 할 핵심 팁이나 기본 원칙을 간결하지만 구체적으로 작성. '${keyword}' 관련 내용이면 더욱 좋음. 관련 정보를 더 찾아볼 수 있는 외부 링크를 하나 포함.]</div>
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>[두 번째 핵심 소제목: 구체적인 해결 방법 또는 단계별 가이드. '${keyword}' 포함]</b> 📝</h2>
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
<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26"><b>[세 번째 핵심 소제목: 성공률 높이는 꿀팁 및 주의사항]</b> ⚠️</h2>
<div style="background-color: ${colors.warnBg}; border-left: 5px solid ${colors.warnBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
    <strong style="color: ${colors.warnBorder};">⚠️ 꼭 확인하세요!</strong><br>
    [독자들이 흔히 하는 실수나 꼭 알아야 할 주의사항, 그리고 추가적인 꿀팁을 리스트(ul, li) 형태로 3~4가지 구체적으로 작성. 각 항목은 실제 경험을 바탕으로 상세하게 설명. 여기서도 유용한 외부 자료 링크를 하나 포함 가능.]
</div>
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
[${keyword}, ${topic} 등 관련 키워드를 콤마로 구분하여 5~10개 나열. 블로그 태그로 활용]
</div>
</div>
--- HTML TEMPLATE END ---
      `;
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
      }
      
      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }
      
      const htmlContent = data.candidates[0].content.parts[0].text;
      const cleanedHtml = htmlContent.replace(/^```html\s*/, '').replace(/\s*```$/, '').trim();

      saveAppState({ generatedContent: cleanedHtml, colorTheme: selectedColorTheme });
      toast({ title: "AI 기반 블로그 글 생성 완료", description: "콘텐츠가 준비되었습니다." });
      return cleanedHtml;
    } catch (error) {
      console.error('글 생성 오류:', error);
      toast({ title: "글 생성 실패", description: error instanceof Error ? error.message : "블로그 글 생성 중 오류가 발생했습니다.", variant: "destructive" });
      return null;
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const createImagePrompt = async (): Promise<boolean> => {
    if (!appState.selectedTopic || !appState.imageStyle) {
      toast({ title: "선택 오류", description: "주제와 이미지 스타일을 먼저 선택해주세요.", variant: "destructive" });
      return false;
    }
    if (!appState.isApiKeyValidated) {
      toast({ title: "API 키 검증 필요", description: "먼저 API 키를 입력하고 검증해주세요.", variant: "destructive" });
      return false;
    }

    setIsGeneratingImage(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const styleMap: { [key: string]: string } = {
        'realistic': 'photorealistic style with natural lighting and high detail',
        'artistic': 'artistic painting style with creative composition',
        'minimal': 'clean minimal design with simple elements',
        'cinematic': 'cinematic style with dramatic lighting and depth',
        'animation': 'animated style with vibrant colors and dynamic elements',
        'cartoon': 'cartoon illustration style with playful characters'
      };
      const styleDescription = styleMap[appState.imageStyle] || styleMap['realistic'];
      const prompt = `A professional blog content creation scene showing a person writing on a laptop, surrounded by creative elements like floating text, colorful graphics, and digital tools, warm natural lighting, modern workspace environment, ${styleDescription}, 4k photorealistic style with high detail, realistic, and natural lighting`;
      
      saveAppState({ imagePrompt: prompt });
      toast({ title: "이미지 프롬프트 생성 완료", description: "ImageFX에서 사용할 수 있는 프롬프트가 생성되었습니다." });
      return true;
    } catch (error) {
      console.error('이미지 프롬프트 생성 오류:', error);
      toast({ title: "프롬프트 생성 실패", description: "이미지 프롬프트 생성 중 오류가 발생했습니다.", variant: "destructive" });
      return false;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return {
    isGeneratingTopics,
    isGeneratingContent,
    isGeneratingImage,
    generateTopics,
    generateArticle,
    createImagePrompt,
  };
};
