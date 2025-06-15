import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState, User } from '@/types';
import { colorThemes } from '@/data/constants';
import { LoginForm } from '@/components/auth/LoginForm';
import { AppHeader } from '@/components/layout/AppHeader';
import { ProgressTracker } from '@/components/layout/ProgressTracker';
import { TopicGenerator } from '@/components/control/TopicGenerator';
import { ArticleGenerator } from '@/components/control/ArticleGenerator';
import { ImageCreation } from '@/components/control/ImageCreation';
import { ApiKeyManager } from '@/components/control/ApiKeyManager';
import { TopicList } from '@/components/display/TopicList';
import { ArticlePreview } from '@/components/display/ArticlePreview';

const Index = () => {
  const { toast } = useToast();
  const [appState, setAppState] = useState<AppState>({
    isLoggedIn: false,
    currentUser: '',
    apiKey: '',
    isApiKeyValidated: false,
    keyword: '',
    topicCount: 3,
    topics: [],
    selectedTopic: '',
    colorTheme: '',
    referenceLink: '',
    generatedContent: '',
    imageStyle: '',
    imagePrompt: ''
  });

  const [loginData, setLoginData] = useState({
    id: '',
    password: ''
  });

  const [manualTopic, setManualTopic] = useState('');
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isValidatingApi, setIsValidatingApi] = useState(false);

  useEffect(() => {
    initializeUsers();
    loadAppState();
  }, []);

  const initializeUsers = () => {
    try {
      // 항상 관리자 계정을 '1234'/'1234'로 설정하여 이전 값이 남아있는 문제를 해결합니다.
      const defaultUsers: User[] = [{ id: '1234', password: '1234' }];
      localStorage.setItem('blog_users', JSON.stringify(defaultUsers));
    } catch (error) {
      console.error('사용자 초기화 오류:', error);
    }
  };

  const loadAppState = () => {
    try {
      const savedState = localStorage.getItem('blog_app_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // API 키 관련 상태는 로드하지 않음 (보안상 매번 새로 입력하도록)
        delete parsedState.apiKey;
        delete parsedState.isApiKeyValidated;
        setAppState(prev => ({ ...prev, ...parsedState, apiKey: '', isApiKeyValidated: false }));
      }
      const savedApiKey = localStorage.getItem('blog_api_key');
      if (savedApiKey) {
        const savedApiKeyValidated = localStorage.getItem('blog_api_key_validated') === 'true';
        setAppState(prev => ({
          ...prev,
          apiKey: savedApiKey,
          isApiKeyValidated: savedApiKeyValidated
        }));
      }
    } catch (error) {
      console.error('앱 상태 로드 오류:', error);
    }
  };

  const saveAppState = (newState: Partial<AppState>) => {
    try {
      const updatedState = { ...appState, ...newState };
      setAppState(updatedState);
      // API 키는 저장하지 않음 (보안상)
      const stateToSave = { ...updatedState };
      delete stateToSave.apiKey;
      delete stateToSave.isApiKeyValidated;
      localStorage.setItem('blog_app_state', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('앱 상태 저장 오류:', error);
    }
  };

  const saveApiKeyToStorage = () => {
    if (!appState.apiKey.trim()) {
      toast({
        title: "저장 오류",
        description: "API 키를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    try {
      localStorage.setItem('blog_api_key', appState.apiKey);
      localStorage.setItem('blog_api_key_validated', String(appState.isApiKeyValidated));
      toast({
        title: "저장 완료",
        description: "API 키가 브라우저에 저장되었습니다.",
      });
    } catch (error) {
      console.error("API 키 저장 오류:", error);
      toast({
        title: "저장 실패",
        description: "API 키 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const deleteApiKeyFromStorage = () => {
    try {
      localStorage.removeItem('blog_api_key');
      localStorage.removeItem('blog_api_key_validated');
      saveAppState({ apiKey: '', isApiKeyValidated: false });
      toast({
        title: "삭제 완료",
        description: "저장된 API 키가 삭제되었습니다.",
      });
    } catch (error) {
      console.error("API 키 삭제 오류:", error);
      toast({
        title: "삭제 실패",
        description: "API 키 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = () => {
    try {
      const users = JSON.parse(localStorage.getItem('blog_users') || '[]');
      
      // 아이디와 비밀번호 모두 입력되었는지 확인
      if (!loginData.id || !loginData.password) {
        toast({
          title: "로그인 실패",
          description: "아이디와 비밀번호를 모두 입력해주세요.",
          variant: "destructive"
        });
        return;
      }
      
      const user = users.find((user: User) => user.id === loginData.id && user.password === loginData.password);
      
      if (user) {
        saveAppState({ isLoggedIn: true, currentUser: user.id });
        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        });
      } else {
        toast({
          title: "로그인 실패",
          description: "아이디 또는 비밀번호가 올바르지 않습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      toast({
        title: "로그인 오류",
        description: "로그인 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    saveAppState({ isLoggedIn: false, currentUser: '', apiKey: '', isApiKeyValidated: false });
    setLoginData({ id: '', password: '' });
    toast({
      title: "로그아웃",
      description: "성공적으로 로그아웃되었습니다.",
    });
  };

  const validateApiKey = async () => {
    if (!appState.apiKey.trim()) {
      toast({
        title: "API 키 오류",
        description: "API 키를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    setIsValidatingApi(true);
    
    try {
      // API 키 검증 시뮬레이션 (실제로는 Google AI Studio API로 요청)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 간단한 API 키 형식 검증 (실제 환경에서는 실제 API 호출로 검증)
      if (appState.apiKey.length < 20) {
        toast({
          title: "API 키 검증 실패",
          description: "API 키 값이 올바르지 않습니다. 다시 확인해주세요.",
          variant: "destructive"
        });
        return;
      }
      
      saveAppState({ isApiKeyValidated: true });
      toast({
        title: "API 키 검증 성공",
        description: "API 키가 성공적으로 확인되었습니다.",
      });
    } catch (error) {
      console.error('API 키 검증 오류:', error);
      toast({
        title: "API 키 검증 실패",
        description: "API 키 검증 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsValidatingApi(false);
    }
  };

  const generateTopicsFromKeyword = async () => {
    if (!appState.keyword.trim()) {
      toast({
        title: "키워드 오류",
        description: "핵심 키워드를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!appState.isApiKeyValidated) {
      toast({
        title: "API 키 검증 필요",
        description: "먼저 API 키를 입력하고 검증해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingTopics(true);
    
    try {
      const keyword = appState.keyword.trim();
      const count = appState.topicCount;
      const prompt = `'${keyword}'를(을) 주제로, 구글과 네이버 검색에 최적화된 블로그 포스팅 제목 ${count}개를 생성해 주세요. 각 제목은 사람들이 클릭하고 싶게 만드는 흥미로운 내용이어야 합니다. 결과는 각 제목을 줄바꿈으로 구분하여 번호 없이 텍스트만 제공해주세요. 다른 설명 없이 주제 목록만 생성해주세요.`;

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google API Error:', errorData);
        throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content?.parts[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }
      
      const generatedText = data.candidates[0].content.parts[0].text;
      const newTopics = generatedText
        .split('\n')
        .map(topic => topic.replace(/^[0-9-."']+\s*/, '').trim()) // Remove potential numbering/bullets
        .filter(topic => topic.length > 0);

      saveAppState({ topics: newTopics });
      toast({
        title: "AI 기반 주제 생성 완료",
        description: `${newTopics.length}개의 새로운 주제가 생성되었습니다.`,
      });

    } catch (error) {
      console.error('주제 생성 오류:', error);
      toast({
        title: "주제 생성 실패",
        description: error instanceof Error ? error.message : "주제 생성 중 오류가 발생했습니다. API 키와 네트워크 연결을 확인해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  const handleManualTopicAdd = () => {
    if (!manualTopic.trim()) {
      toast({
        title: "주제 입력 오류",
        description: "주제를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    const newTopics = [...appState.topics, manualTopic.trim()];
    saveAppState({ topics: newTopics, selectedTopic: manualTopic.trim() });
    setManualTopic('');
    
    toast({
      title: "수동 주제 추가 완료",
      description: "새로운 주제가 추가되고 선택되었습니다.",
    });
  };

  const selectTopic = (topic: string) => {
    saveAppState({ selectedTopic: topic });
    toast({
      title: "주제 선택 완료",
      description: `"${topic}"이 선택되었습니다.`,
    });
  };

  const generateArticleContent = async () => {
    if (!appState.selectedTopic) {
      toast({
        title: "주제 선택 오류",
        description: "주제를 먼저 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!appState.isApiKeyValidated) {
      toast({
        title: "API 키 검증 필요",
        description: "먼저 API 키를 입력하고 검증해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingContent(true);
    
    try {
      const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
      const selectedColorTheme = appState.colorTheme || randomTheme.value;
      
      const getColors = (theme: string) => {
        const colorMap: { [key: string]: any } = {
          'blue-gray': {
            primary: '#1a73e8',
            secondary: '#f5f5f5',
            textHighlight: '#fffde7',
            highlight: '#e8f4fd',
            highlightBorder: '#1a73e8',
            warnBg: '#ffebee',
            warnBorder: '#f44336',
            link: '#1a73e8'
          },
          'green-orange': {
            primary: '#059669',
            secondary: '#f0fdf4',
            textHighlight: '#dcfce7',
            highlight: '#ecfdf5',
            highlightBorder: '#10b981',
            warnBg: '#fed7aa',
            warnBorder: '#ea580c',
            link: '#16a34a'
          },
          'classic-blue': {
            primary: '#1a73e8',
            secondary: '#f5f5f5',
            textHighlight: '#fffde7',
            highlight: '#e8f4fd',
            highlightBorder: '#1a73e8',
            warnBg: '#ffebee',
            warnBorder: '#f44336',
            link: '#1a73e8'
          }
        };
        return colorMap[theme] || colorMap['classic-blue'];
      };
      
      const colors = getColors(selectedColorTheme);
      const refLink = appState.referenceLink || 'https://worldpis.com';
      const topic = appState.selectedTopic;
      const keyword = appState.keyword || topic.split(' ')[0];

      const prompt = `
        당신은 매력적인 블로그 게시물을 작성하는 전문 카피라이터이자 SEO 전문가입니다.
        주제: "${topic}"
        핵심 키워드: "${keyword}"

        다음 지침에 따라 이 주제에 대한 완벽한 블로그 게시물을 작성해주세요.
        - 출력은 HTML 코드 블록 하나여야 합니다. HTML 외에 다른 텍스트나 마크다운 서식을 포함하지 마세요.
        - 한국어 사용자를 대상으로 하며, Google 및 Naver 검색 엔진에 최적화되어야 합니다.
        - 제공된 HTML 템플릿과 스타일을 정확하게 사용해주세요.
        - 모든 섹션 (예: "[여기 매력적인 도입부 작성]")을 독자에게 실질적인 가치를 제공하는 자연스럽고 잘 작성된 콘텐츠로 채워주세요.
        - 문체는 친근하고 유익해야 하며, 이모지 (예: 😊, 💡, 😥)를 적절하게 사용하여 참여를 유도해주세요.

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

        아래는 반드시 따라야 할 HTML 템플릿입니다. 구조와 클래스, 인라인 스타일을 변경하지 마세요.
        
        --- HTML TEMPLATE START ---
        <div>
<style>
@media (max-width: 768px) {
.wrapper-div {
    padding: 0 10px !important;
}
}
</style>
</div>
<div class="wrapper-div" style="font-family: 'Noto Sans KR', sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; font-size: 17px; box-sizing: border-box; padding: 0 8px; word-break: break-all; overflow-wrap: break-word;">

<div style="margin-top: 10px;"></div>

<h3 style="font-size: 28px; color: #333; margin-top: 25px; margin-bottom: 20px; text-align: center; line-height: 1.4;" data-ke-size="size23">${topic}</h3>

<div style="background-color: ${colors.secondary}; padding: 18px; border-radius: 10px; font-style: italic; margin-bottom: 28px; font-size: 18px; line-height: 1.7;">
<strong>[여기 주제에 대한 흥미로운 질문이나 문제 제기 작성]</strong> [여기 이 글이 어떻게 독자의 문제를 해결해 줄 수 있는지에 대한 간략한 설명 작성]
</div>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[여기 개인적인 경험이나 일화를 공유하며 독자와의 공감대 형성] 😥 [여기 <span style="background-color: ${colors.textHighlight}; padding: 3px 6px; border-radius: 4px; font-weight: bold;">핵심 노하우</span>가 어떻게 생겼는지에 대한 스토리텔링 추가]</p>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[여기 이 글이 왜 특별한지, 독자가 무엇을 얻어갈 수 있는지 강조. 초보자도 쉽게 따라할 수 있다는 점 어필] 😊</p>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26">
<strong>[주제와 관련된 첫 번째 핵심 소제목]</strong> 💡
</h2>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[첫 번째 소제목에 대한 설명. 왜 이 내용이 중요한지, 어떤 사람들이 특히 관심을 가져야 하는지 설명]</p>

<ul style="margin: 0 0 20px 0; padding-left: 25px; font-size: 17px; line-height: 1.7;" data-ke-list-type="disc">
<li style="margin-bottom: 8px;">[이 내용이 필요한 사람 유형 1]</li>
<li style="margin-bottom: 8px;">[이 내용이 필요한 사람 유형 2]</li>
<li style="margin-bottom: 8px;">[이 내용이 필요한 사람 유형 3]</li>
<li style="margin-bottom: 8px;">[이 내용이 필요한 사람 유형 4]</li>
</ul>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[주제와 관련된 문제의 다른 원인이나 고려사항 제시. <span style="background-color: ${colors.textHighlight}; padding: 3px 6px; border-radius: 4px; font-weight: bold;">다른 요인</span>이 있을 수 있음을 언급하며 깊이 있는 분석 제공] 🥺</p>

<div style="background-color: ${colors.highlight}; border-left: 5px solid ${colors.highlightBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.primary};">💡 알아두세요!</strong><br>
[독자가 꼭 알아야 할 핵심 팁이나 원칙을 간결하게 작성]
</div>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26">
<strong>[실용적인 방법이나 가이드를 제시하는 두 번째 소제목]</strong> 📝
</h2>

<div style="margin-top: 20px;"></div>

<div style="background-color: ${colors.highlight}; border-left: 5px solid ${colors.highlightBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.primary};">💡 팁 1: [첫 번째 팁 제목]</strong><br>
[첫 번째 팁에 대한 상세 설명]
</div>

<ul style="margin: 0 0 20px 0; padding-left: 25px; font-size: 17px; line-height: 1.7;" data-ke-list-type="disc">
<li style="margin-bottom: 8px;"><strong>[세부 항목 1]:</strong> [세부 항목 1에 대한 설명]</li>
<li style="margin-bottom: 8px;"><strong>[세부 항목 2]:</strong> [세부 항목 2에 대한 설명]</li>
<li style="margin-bottom: 8px;"><strong>[세부 항목 3]:</strong> [세부 항목 3에 대한 설명]</li>
</ul>

<div style="background-color: ${colors.highlight}; border-left: 5px solid ${colors.highlightBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.primary};">💡 팁 2: [두 번째 팁 제목]</strong><br>
[두 번째 팁에 대한 상세 설명]
</div>

<ul style="margin: 0 0 20px 0; padding-left: 25px; font-size: 17px; line-height: 1.7;" data-ke-list-type="disc">
<li style="margin-bottom: 8px;"><strong>[세부 항목 1]:</strong> [세부 항목 1에 대한 설명]</li>
<li style="margin-bottom: 8px;"><strong>[세부 항목 2]:</strong> [세부 항목 2에 대한 설명]</li>
<li style="margin-bottom: 8px;"><strong>[세부 항목 3]:</strong> [세부 항목 3에 대한 설명]</li>
</ul>

<div style="background-color: ${colors.secondary}; padding: 20px; border-radius: 10px; margin: 25px 0; font-size: 17px; line-height: 1.6; box-sizing: border-box;">
<h3 style="font-size: 20px; color: #333; margin: 0 0 12px; font-weight: bold; line-height: 1.5;">실제 적용 사례 📝</h3>
<p style="margin-bottom: 15px;">[실제 적용 사례에 대한 구체적인 이야기. <span style="background-color: ${colors.textHighlight}; padding: 3px 6px; border-radius: 4px; font-weight: bold;">수치적인 결과</span>를 보여주면 좋음.]</p>
<p style="margin-bottom: 15px;">[사례를 통해 얻은 교훈이나 인사이트 공유.]</p>
<p>[독려 메시지]</p>
</div>

<div style="overflow-x: auto; margin: 25px 0; padding: 0;">
<table style="min-width: 600px; width: 100%; border-collapse: collapse; font-size: 16px; table-layout: auto;">
    <thead>
        <tr>
            <th style="padding: 14px; text-align: left; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold; color: #333;">단계</th>
            <th style="padding: 14px; text-align: left; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold; color: #333;">주요 활동</th>
            <th style="padding: 14px; text-align: left; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold; color: #333;">예상 기간</th>
            <th style="padding: 14px; text-align: left; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold; color: #333;">핵심 포인트</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">1단계</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">[1단계 활동 내용]</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">[1단계 기간]</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">[1단계 핵심 포인트]</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">2단계</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">[2단계 활동 내용]</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">[2단계 기간]</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">[2단계 핵심 포인트]</td>
        </tr>
        <tr>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">3단계</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">[3단계 활동 내용]</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">[3단계 기간]</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">[3단계 핵심 포인트]</td>
        </tr>
    </tbody>
</table>
</div>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26">
<strong>이것만은 주의하세요!</strong> ⚠️
</h2>

<div style="background-color: ${colors.warnBg}; border-left: 5px solid ${colors.warnBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.warnBorder};">⚠️ [첫 번째 주의사항 제목]</strong><br>
[첫 번째 주의사항에 대한 상세 설명. 개인적인 경험을 덧붙이면 좋음.] ㅠㅠ
</div>

<div style="background-color: ${colors.warnBg}; border-left: 5px solid ${colors.warnBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.warnBorder};">⚠️ [두 번째 주의사항 제목]</strong><br>
[두 번째 주의사항에 대한 상세 설명. 전문가의 도움이 필요한 경우를 언급.]
</div>

<div style="border-top: 1px dashed #ddd; margin: 35px 0;"></div>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26">
<strong>${keyword} 관리, 핵심 요약 카드!</strong> 📌
</h2>

<style>
.single-summary-card-container {
    font-family: 'Noto Sans KR', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 25px 15px;
    background-color: ${colors.highlight};
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
    border: 1px solid ${colors.highlightBorder};
    box-sizing: border-box;
}
.single-summary-card .card-header {
    display: flex;
    align-items: center;
    border-bottom: 2px solid ${colors.highlightBorder};
    padding-bottom: 15px;
    margin-bottom: 15px;
}
.single-summary-card .card-header-icon {
    font-size: 38px;
    color: ${colors.primary};
    margin-right: 16px;
}
.single-summary-card .card-header h3 {
    font-size: 28px;
    color: ${colors.primary};
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
    color: ${colors.primary};
    font-weight: 600;
}
.single-summary-card .card-content .highlight {
    background-color: ${colors.textHighlight};
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: bold;
}
.single-summary-card .card-content .formula {
    background-color: ${colors.secondary};
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.95em;
    text-align: center;
    margin-top: 8px;
    color: ${colors.primary};
}
.single-summary-card .card-footer {
    font-size: 15px;
    color: #777;
    text-align: center;
    padding-top: 15px;
    border-top: 1px dashed ${colors.highlightBorder};
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
    .single-summary-card .card-content .section {
        margin-bottom: 10px;
        line-height: 1.6;
    }
    .single-summary-card .card-content .highlight {
        padding: 2px 5px;
    }
    .single-summary-card .card-content .formula {
        padding: 7px 10px;
        font-size: 0.9em;
    }
    .single-summary-card .card-footer {
        font-size: 14px;
        padding-top: 12px;
    }
}
@media (max-width: 480px) {
    .single-summary-card {
        padding: 18px;
        border-radius: 8px;
    }
    .single-summary-card .card-header-icon {
        font-size: 28px;
        margin-right: 10px;
    }
    .single-summary-card .card-header h3 {
        font-size: 20px;
    }
    .single-summary-card .card-content {
        font-size: 15px;
        line-height: 1.5;
    }
    .single-summary-card .card-content .section {
        margin-bottom: 8px;
        line-height: 1.5;
    }
    .single-summary-card .card-content .formula {
        padding: 6px 8px;
        font-size: 0.85em;
    }
    .single-summary-card .card-footer {
        font-size: 13px;
        padding-top: 10px;
    }
}
</style>

<div class="single-summary-card-container">
<div class="single-summary-card">
<div class="card-header">
<span class="card-header-icon">💡</span>
<h3 data-ke-size="size23">${keyword} 관리의 핵심!</h3>
</div>
<div class="card-content">
<div class="section"><strong>[요약 1 제목]:</strong> <span class="highlight">[요약 1 내용]</span></div>
<div class="section"><strong>[요약 2 제목]:</strong> <span class="highlight">[요약 2 내용]</span></div>
<div class="section"><strong>[요약 3 제목]:</strong>
<div class="formula">[요약 3 내용]</div>
</div>
<div class="section"><strong>[요약 4 제목]:</strong> <span class="highlight">[요약 4 내용]</span></div>
</div>
<div class="card-footer">성공적인 ${keyword} 관리를 위한 필수 습관!</div>
</div>
</div>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26">
<strong>궁금해요! ${keyword} Q&A</strong> ❓
</h2>

<div style="margin: 30px 0;">
<div style="margin-bottom: 22px;">
<div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [첫 번째 질문]</div>
<div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [첫 번째 답변]</div>
</div>
<div style="margin-bottom: 22px;">
<div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [두 번째 질문]</div>
<div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [두 번째 답변]</div>
</div>
<div style="margin-bottom: 22px;">
<div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: [세 번째 질문]</div>
<div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: [세 번째 답변]</div>
</div>
</div>

<p style="margin-bottom: 15px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">[글을 마무리하는 문단. 독자에게 도움이 되었기를 바라는 마음을 표현하고, 추가 질문을 유도.] 😊</p>

<p style="text-align: center; font-size: 18px;" data-ke-size="size16">
<strong>이건 아직 못 봤다면, 진짜 아쉬울 수 있어요.</strong><br>
👉 <a href="${refLink}" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: none; font-weight: bold;"><strong>워드프레스 꿀팁 보러 가기</strong></a>
</p>

</div>

<br><br>
[${keyword}, ${topic} 등 관련 키워드를 콤마로 구분하여 5~10개 나열]
--- HTML TEMPLATE END ---
      `;

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google API Error:', errorData);
        throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content?.parts[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }
      
      const htmlContent = data.candidates[0].content.parts[0].text;

      saveAppState({ 
        generatedContent: htmlContent,
        colorTheme: selectedColorTheme 
      });
      
      toast({
        title: "AI 기반 블로그 글 생성 완료",
        description: "Gemini AI가 생성한 전문적인 HTML 콘텐츠가 준비되었습니다.",
      });
    } catch (error) {
      console.error('글 생성 오류:', error);
      toast({
        title: "글 생성 실패",
        description: error instanceof Error ? error.message : "블로그 글 생성 중 오류가 발생했습니다. API 키와 네트워크 연결을 확인해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const createImagePromptFromTopic = async () => {
    if (!appState.selectedTopic || !appState.imageStyle) {
      toast({
        title: "선택 오류",
        description: "주제와 이미지 스타일을 먼저 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!appState.isApiKeyValidated) {
      toast({
        title: "API 키 검증 필요",
        description: "먼저 API 키를 입력하고 검증해주세요.",
        variant: "destructive"
      });
      return;
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
      
      toast({
        title: "이미지 프롬프트 생성 완료",
        description: "ImageFX에서 사용할 수 있는 프롬프트가 생성되었습니다.",
      });
    } catch (error) {
      console.error('이미지 프롬프트 생성 오류:', error);
      toast({
        title: "프롬프트 생성 실패",
        description: "이미지 프롬프트 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "복사 완료",
        description: `${type}이(가) 클립보드에 복사되었습니다.`,
      });
    }).catch(() => {
      toast({
        title: "복사 실패",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive"
      });
    });
  };

  const openWhisk = () => {
    window.open('https://labs.google/fx/ko/tools/whisk', '_blank', 'noopener,noreferrer');
    toast({
      title: "Whisk 열기",
      description: "Google Whisk가 새 탭에서 열렸습니다.",
    });
  };

  const downloadHTML = () => {
    if (!appState.generatedContent) {
      toast({
        title: "다운로드 오류",
        description: "다운로드할 콘텐츠가 없습니다.",
        variant: "destructive"
      });
      return;
    }

    const blob = new Blob([appState.generatedContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appState.selectedTopic.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "다운로드 완료",
      description: "HTML 파일이 다운로드되었습니다.",
    });
  };

  const resetApp = () => {
    const newState = {
      keyword: '',
      topicCount: 3,
      topics: [],
      selectedTopic: '',
      colorTheme: '',
      referenceLink: '',
      generatedContent: '',
      imageStyle: '',
      imagePrompt: '',
      apiKey: '',
      isApiKeyValidated: false
    };
    
    saveAppState(newState);
    setManualTopic('');
    
    toast({
      title: "초기화 완료",
      description: "모든 데이터가 초기화되었습니다.",
    });
  };

  if (!appState.isLoggedIn) {
    return <LoginForm loginData={loginData} setLoginData={setLoginData} handleLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <AppHeader
        currentUser={appState.currentUser}
        resetApp={resetApp}
        handleLogout={handleLogout}
      />

      <ProgressTracker
        topics={appState.topics}
        generatedContent={appState.generatedContent}
        imagePrompt={appState.imagePrompt}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 왼쪽 컬럼 */}
        <div className="lg:col-span-4 space-y-6">
          <TopicGenerator
            appState={appState}
            saveAppState={saveAppState}
            isGeneratingTopics={isGeneratingTopics}
            generateTopicsFromKeyword={generateTopicsFromKeyword}
            manualTopic={manualTopic}
            setManualTopic={setManualTopic}
            handleManualTopicAdd={handleManualTopicAdd}
          />

          <ArticleGenerator
            appState={appState}
            saveAppState={saveAppState}
            selectTopic={selectTopic}
            isGeneratingContent={isGeneratingContent}
            generateArticleContent={generateArticleContent}
          />

          <ImageCreation
            appState={appState}
            saveAppState={saveAppState}
            isGeneratingImage={isGeneratingImage}
            createImagePromptFromTopic={createImagePromptFromTopic}
            copyToClipboard={copyToClipboard}
            openWhisk={openWhisk}
          />
          
          <ApiKeyManager
            appState={appState}
            saveAppState={saveAppState}
            isValidatingApi={isValidatingApi}
            validateApiKey={validateApiKey}
            saveApiKeyToStorage={saveApiKeyToStorage}
            deleteApiKeyFromStorage={deleteApiKeyFromStorage}
          />
        </div>

        {/* 오른쪽 컬럼 */}
        <div className="lg:col-span-8 space-y-6">
          <TopicList
            topics={appState.topics}
            selectedTopic={appState.selectedTopic}
            selectTopic={selectTopic}
          />

          <ArticlePreview
            generatedContent={appState.generatedContent}
            copyToClipboard={copyToClipboard}
            downloadHTML={downloadHTML}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
