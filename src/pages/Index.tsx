import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, User, Lock, Lightbulb, Edit, Image, Download, RefreshCw, LogOut, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  password: string;
}

interface AppState {
  isLoggedIn: boolean;
  currentUser: string;
  apiKey: string;
  keyword: string;
  topicCount: number;
  topics: string[];
  selectedTopic: string;
  colorTheme: string;
  referenceLink: string;
  generatedContent: string;
  imageStyle: string;
  imagePrompt: string;
}

const colorThemes = [
  { value: 'blue-gray', label: '블루-그레이 (차분하고 전문적인 느낌)' },
  { value: 'green-orange', label: '그린-오렌지 (활기차고 친근한 느낌)' },
  { value: 'purple-yellow', label: '퍼플-옐로우 (세련되고 창의적인 느낌)' },
  { value: 'teal-light-gray', label: '틸-라이트그레이 (안정적이고 현대적인 느낌)' },
  { value: 'terracotta-light-gray', label: '테라코타-라이트그레이 (따뜻하고 편안한 느낌)' },
  { value: 'classic-blue', label: '클래식 블루 (신뢰할 수 있고 안정적인 느낌)' },
  { value: 'nature-green', label: '네이처 그린 (생기 있고 조화로운 느낌)' },
  { value: 'royal-purple', label: '로얄 퍼플 (우아하고 독창적인 느낌)' },
  { value: 'future-teal', label: '퓨처 틸 (혁신적이고 활기찬 느낌)' },
  { value: 'earth-terracotta', label: '어스 테라코타 (온화하고 견고한 느낌)' }
];

const imageStyles = [
  { value: 'realistic', label: '사실적' },
  { value: 'artistic', label: '예술적' },
  { value: 'minimal', label: '미니멀' },
  { value: 'cinematic', label: '시네마틱' },
  { value: 'animation', label: '애니메이션' },
  { value: 'cartoon', label: '만화' }
];

const Index = () => {
  const { toast } = useToast();
  const [appState, setAppState] = useState<AppState>({
    isLoggedIn: false,
    currentUser: '',
    apiKey: '',
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

  useEffect(() => {
    initializeUsers();
    loadAppState();
  }, []);

  const initializeUsers = () => {
    try {
      const existingUsers = localStorage.getItem('blog_users');
      console.log('기존 사용자 데이터:', existingUsers);
      
      if (!existingUsers) {
        const defaultUsers: User[] = [{ id: '123', password: '123' }];
        localStorage.setItem('blog_users', JSON.stringify(defaultUsers));
        console.log('기본 관리자 계정이 생성되었습니다.');
      }
      
      // 저장 확인
      const savedUsers = localStorage.getItem('blog_users');
      console.log('저장된 사용자 데이터 확인:', savedUsers);
      
      if (!savedUsers) {
        console.error('localStorage 저장에 실패했습니다. 브라우저 환경을 확인해주세요.');
      }
    } catch (error) {
      console.error('사용자 초기화 오류:', error);
    }
  };

  const loadAppState = () => {
    try {
      const savedState = localStorage.getItem('blog_app_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setAppState(prev => ({ ...prev, ...parsedState }));
      }
    } catch (error) {
      console.error('앱 상태 로드 오류:', error);
    }
  };

  const saveAppState = (newState: Partial<AppState>) => {
    try {
      const updatedState = { ...appState, ...newState };
      setAppState(updatedState);
      localStorage.setItem('blog_app_state', JSON.stringify(updatedState));
    } catch (error) {
      console.error('앱 상태 저장 오류:', error);
    }
  };

  const handleLogin = () => {
    try {
      const users = JSON.parse(localStorage.getItem('blog_users') || '[]');
      console.log('로그인 시도 - 저장된 사용자들:', users);
      
      // 빈 입력으로 로그인 시 관리자 계정으로 자동 로그인
      if (!loginData.id && !loginData.password) {
        const defaultUser = users.find((user: User) => user.id === '123' && user.password === '123');
        if (defaultUser) {
          saveAppState({ isLoggedIn: true, currentUser: '123' });
          toast({
            title: "자동 로그인 성공",
            description: "아이디와 비밀번호 없이 관리자 계정으로 로그인합니다.",
          });
          return;
        }
      }
      
      const user = users.find((user: User) => user.id === loginData.id && user.password === loginData.password);
      
      if (user) {
        saveAppState({ isLoggedIn: true, currentUser: user.id });
        toast({
          title: "로그인 성공",
          description: `${user.id}님, 환영합니다!`,
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
    saveAppState({ isLoggedIn: false, currentUser: '' });
    setLoginData({ id: '', password: '' });
    toast({
      title: "로그아웃",
      description: "성공적으로 로그아웃되었습니다.",
    });
  };

  const handleApiKeySave = () => {
    if (!appState.apiKey.trim()) {
      toast({
        title: "API 키 오류",
        description: "API 키를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    saveAppState({ apiKey: appState.apiKey });
    toast({
      title: "API 키 저장 성공",
      description: "API 키가 성공적으로 저장되었습니다.",
    });
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

    setIsGeneratingTopics(true);
    
    try {
      // 시뮬레이션된 주제 생성 로직 - SEO 최적화된 틈새 키워드 조합
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // SEO 친화적인 접두사들 (검색량이 높은 패턴)
      const seoOptimizedPrefixes = [
        "2024년 최신", "완벽 가이드", "초보자를 위한", "전문가가 추천하는", "실전 노하우",
        "단계별", "쉽게 따라하는", "효과적인", "성공적인", "실용적인", "빠르게 배우는"
      ];
      
      // SEO 친화적인 접미사들
      const seoOptimizedSuffixes = [
        "방법 총정리", "팁 모음", "가이드", "노하우", "전략", "해결법", "비법 공개",
        "완전정복", "실무 가이드", "핵심 포인트", "체크리스트"
      ];

      // 키워드별 연관 SEO 키워드 맵 (실제 검색량이 높은 키워드들)
      const seoKeywordMap: { [key: string]: string[] } = {
        "블로그": ["수익화", "SEO 최적화", "애드센스", "네이버 블로그", "워드프레스", "콘텐츠 마케팅"],
        "투자": ["주식", "부동산", "재테크", "펀드", "ETF", "코인", "연금저축"],
        "요리": ["간단 레시피", "다이어트 식단", "건강식", "반찬", "도시락", "홈쿡"],
        "운동": ["홈트레이닝", "다이어트", "헬스", "요가", "필라테스", "근력운동"],
        "여행": ["국내여행", "해외여행", "자유여행", "패키지", "숙소", "맛집"],
        "프로그래밍": ["파이썬", "자바스크립트", "웹개발", "앱개발", "코딩테스트", "개발자"],
        "마케팅": ["디지털마케팅", "SNS마케팅", "바이럴마케팅", "브랜딩", "광고", "성과측정"],
        "부동산": ["아파트", "전세", "월세", "매매", "분양", "투자", "대출"],
        "건강": ["다이어트", "운동", "영양", "건강관리", "질병예방", "건강식품"],
        "교육": ["온라인강의", "자격증", "취업", "공부법", "학습법", "스킬업"],
        "쇼핑": ["할인", "쿠폰", "세일", "리뷰", "추천", "가성비"],
        "금융": ["대출", "적금", "보험", "카드", "금리", "신용관리"],
        "자동차": ["중고차", "신차", "정비", "보험", "연비", "튜닝"],
        "패션": ["코디", "트렌드", "쇼핑몰", "브랜드", "스타일링", "세일"],
        "뷰티": ["화장품", "스킨케어", "메이크업", "헤어", "네일", "다이어트"]
      };
      
      const topics = [];
      const keywordLower = appState.keyword.toLowerCase();
      
      // 메인 키워드와 관련된 연관 키워드들 가져오기
      let relatedKeywords = seoKeywordMap[keywordLower] || [];
      
      // 연관 키워드가 없는 경우 일반적인 패턴 사용
      if (relatedKeywords.length === 0) {
        relatedKeywords = ["활용법", "시작하기", "노하우", "팁", "가이드", "방법"];
      }
      
      for (let i = 0; i < appState.topicCount; i++) {
        const prefix = seoOptimizedPrefixes[Math.floor(Math.random() * seoOptimizedPrefixes.length)];
        const suffix = seoOptimizedSuffixes[Math.floor(Math.random() * seoOptimizedSuffixes.length)];
        const relatedKeyword = relatedKeywords[i % relatedKeywords.length];
        
        // SEO 최적화된 제목 생성 (메인 키워드 + 연관 키워드 조합)
        const topicTemplates = [
          `${prefix} ${appState.keyword} ${relatedKeyword} ${suffix}`,
          `${appState.keyword} ${relatedKeyword} ${prefix} ${suffix}`,
          `${prefix} ${appState.keyword}로 ${relatedKeyword} 마스터하는 ${suffix}`,
          `${appState.keyword} 전문가가 알려주는 ${relatedKeyword} ${suffix}`,
          `${relatedKeyword} 고수들이 쓰는 ${appState.keyword} ${suffix}`
        ];
        
        const selectedTemplate = topicTemplates[Math.floor(Math.random() * topicTemplates.length)];
        topics.push(selectedTemplate);
      }
      
      saveAppState({ topics });
      toast({
        title: "SEO 최적화된 주제 생성 완료",
        description: `${topics.length}개의 틈새 상위 노출 최적화 주제가 생성되었습니다.`,
      });
    } catch (error) {
      console.error('주제 생성 오류:', error);
      toast({
        title: "주제 생성 실패",
        description: "주제 생성 중 오류가 발생했습니다.",
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

    setIsGeneratingContent(true);
    
    try {
      // SEO 최적화된 블로그 글 생성 로직
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 컬러 테마 자동 선정
      const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
      const selectedColorTheme = appState.colorTheme || randomTheme.value;
      
      // 컬러 테마에 따른 색상 정의
      const getColors = (theme: string) => {
        const colorMap: { [key: string]: any } = {
          'blue-gray': {
            primary: '#374151',
            secondary: '#f8fafc',
            textHighlight: '#dbeafe',
            highlight: '#eff6ff',
            highlightBorder: '#3b82f6',
            warnBg: '#fef3c7',
            warnBorder: '#f59e0b',
            link: '#2563eb'
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
            primary: '#1e40af',
            secondary: '#eff6ff',
            textHighlight: '#dbeafe',
            highlight: '#f0f9ff',
            highlightBorder: '#3b82f6',
            warnBg: '#fef3c7',
            warnBorder: '#f59e0b',
            link: '#2563eb'
          }
        };
        return colorMap[theme] || colorMap['classic-blue'];
      };
      
      const colors = getColors(selectedColorTheme);
      const refLink = appState.referenceLink || 'https://worldpis.com';
      
      // SEO 최적화된 HTML 콘텐츠 생성
      const htmlContent = `<div class="wrapper-div" style="font-family: 'Noto Sans KR', sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; font-size: 17px; box-sizing: border-box; padding: 0 20px; word-break: break-all; overflow-wrap: break-word;">

<style>
@media (max-width: 768px) {
.wrapper-div {
    padding: 0 10px !important;
}
}
</style>

<div style="margin-top: 10px;"></div>

<h3 style="font-size: 28px; font-weight: bold; margin-bottom: 25px; text-align: center; color: #333;">${appState.selectedTopic}</h3>

<div style="background-color: ${colors.secondary}; padding: 18px; border-radius: 10px; font-style: italic; margin-bottom: 28px; font-size: 18px; line-height: 1.7;">
<strong>궁금하지 않으셨나요?</strong> ${appState.selectedTopic}에 대한 완벽한 가이드를 통해 누구나 쉽게 따라할 수 있는 실전 노하우를 소개해드립니다.
</div>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;">${appState.keyword} 때문에 고민이시죠? 저도 처음엔 막막했는데요. 😊 이 글을 끝까지 읽어보시면 <strong style="color: ${colors.primary};">구체적이고 실용적인 해결책</strong>을 얻을 수 있을 거예요!</p>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;">실제로 제가 경험해보고 검증한 방법들만 골라서 정리했으니까, 바로 적용해볼 수 있는 내용들이에요. 특히 초보자분들도 쉽게 따라할 수 있도록 단계별로 자세히 설명드릴게요!</p>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;">
<strong>${appState.keyword}가 중요한 이유</strong> 📚
</h2>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;">요즘 같은 시대에 ${appState.keyword}는 선택이 아니라 필수가 되었어요. 특히 이런 분들에게는 더욱 중요하죠:</p>

<ul style="margin: 0 0 20px 0; padding-left: 25px; font-size: 17px; line-height: 1.7;">
<li style="margin-bottom: 8px;">시간은 부족하지만 효과적인 결과를 원하시는 분</li>
<li style="margin-bottom: 8px;">처음 시작하는데 어디서부터 해야 할지 모르겠는 분</li>
<li style="margin-bottom: 8px;">이미 시도해봤지만 만족스러운 결과를 얻지 못한 분</li>
<li style="margin-bottom: 8px;">체계적이고 검증된 방법을 찾고 계신 분</li>
</ul>

<div style="background-color: ${colors.highlight}; border-left: 5px solid ${colors.highlightBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.primary};">💡 알아두세요!</strong><br>
${appState.keyword}의 핵심은 올바른 순서와 꾸준한 실행이에요. 무작정 시작하기보다는 체계적으로 접근하는 것이 성공의 열쇠입니다.
</div>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;">
<strong>단계별 실행 방법</strong> 🚀
</h2>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;">이제 본격적으로 ${appState.keyword}를 위한 구체적인 실행 방법을 알아보겠어요. 제가 직접 적용해본 결과를 바탕으로 가장 효과적인 순서로 정리했습니다.</p>

<h3 style="font-size: 20px; color: #333; margin: 25px 0 15px; font-weight: bold;">1단계: 기초 준비하기</h3>

<ol style="margin: 0 0 20px 0; padding-left: 25px; font-size: 17px; line-height: 1.7;">
<li style="margin-bottom: 10px;"><strong>목표 설정:</strong> 명확하고 측정 가능한 목표를 세우세요</li>
<li style="margin-bottom: 10px;"><strong>현재 상황 파악:</strong> 지금 어느 단계에 있는지 정확히 파악하기</li>
<li style="margin-bottom: 10px;"><strong>필요한 도구 준비:</strong> 기본적인 도구들을 미리 준비해두기</li>
<li style="margin-bottom: 10px;"><strong>시간 계획 수립:</strong> 언제, 얼마나 투자할지 계획 세우기</li>
</ol>

<h3 style="font-size: 20px; color: #333; margin: 25px 0 15px; font-weight: bold;">2단계: 핵심 전략 적용하기</h3>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;">이 단계가 가장 중요해요. 여기서 실수하면 나중에 돌이키기 어려우니까 천천히 따라해보세요.</p>

<div style="background-color: ${colors.secondary}; padding: 20px; border-radius: 10px; margin: 25px 0; font-size: 17px; line-height: 1.6; box-sizing: border-box;">
<h3 style="font-size: 20px; color: #333; margin: 0 0 12px; font-weight: bold; line-height: 1.5;">실제 적용 사례 📝</h3>
<p style="margin-bottom: 15px;">제가 직접 이 방법을 적용했을 때, <span style="background-color: ${colors.textHighlight}; padding: 3px 6px; border-radius: 4px; font-weight: bold;">3개월 만에 80% 이상의 개선 효과</span>를 보였어요.</p>
<p style="margin-bottom: 15px;">특히 첫 번째 달에는 큰 변화가 없어서 포기하고 싶었는데, 2개월째부터 확실한 변화가 보이기 시작했어요. 그래서 꾸준히 하는 게 정말 중요한 것 같아요.</p>
<p>여러분도 조급해하지 마시고 차근차근 따라해보세요!</p>
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
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">기초 준비 및 계획 수립</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">1-2주</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">명확한 목표 설정</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">2단계</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">핵심 전략 적용</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">4-6주</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">꾸준한 실행</td>
        </tr>
        <tr>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">3단계</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">결과 분석 및 개선</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">2-3주</td>
            <td style="padding: 14px; text-align: left; border: 1px solid #ddd; line-height: 1.6;">데이터 기반 최적화</td>
        </tr>
    </tbody>
</table>
</div>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;">
<strong>주의사항 및 실전 팁</strong> ⚠️
</h2>

<div style="background-color: ${colors.warnBg}; border-left: 5px solid ${colors.warnBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.warnBorder};">⚠️ 흔한 실수들</strong><br>
많은 분들이 ${appState.keyword} 과정에서 이런 실수를 하시더라고요. 미리 알고 계시면 시행착오를 줄일 수 있어요!
</div>

<ul style="margin: 0 0 20px 0; padding-left: 25px; font-size: 17px; line-height: 1.7;">
<li style="margin-bottom: 8px;"><strong>성급한 결과 기대:</strong> 최소 2-3개월은 꾸준히 해야 확실한 효과를 볼 수 있어요</li>
<li style="margin-bottom: 8px;"><strong>일관성 부족:</strong> 한 번에 많이 하는 것보다 조금씩이라도 매일 하는 게 중요해요</li>
<li style="margin-bottom: 8px;"><strong>다른 사람과 비교:</strong> 각자 상황이 다르니까 본인만의 속도로 진행하세요</li>
<li style="margin-bottom: 8px;"><strong>기초 건너뛰기:</strong> 기본기가 탄탄해야 나중에 응용할 수 있어요</li>
</ul>

<h3 style="font-size: 20px; color: #333; margin: 25px 0 15px; font-weight: bold;">실전에서 바로 쓸 수 있는 꿀팁들 💎</h3>

<ol style="margin: 0 0 20px 0; padding-left: 25px; font-size: 17px; line-height: 1.7;">
<li style="margin-bottom: 10px;"><strong>시간 관리:</strong> 매일 같은 시간에 하면 습관으로 만들기 쉬워요</li>
<li style="margin-bottom: 10px;"><strong>진행 상황 기록:</strong> 작은 변화라도 기록해두면 동기부여가 돼요</li>
<li style="margin-bottom: 10px;"><strong>주변 환경 정리:</strong> 집중할 수 있는 환경을 만드는 것도 중요해요</li>
<li style="margin-bottom: 10px;"><strong>커뮤니티 활용:</strong> 비슷한 목표를 가진 사람들과 정보 공유하기</li>
</ol>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;">
<strong>자주 묻는 질문 (FAQ)</strong> ❓
</h2>

<div style="margin: 30px 0;">
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 15px; overflow: hidden;">
        <div style="background: ${colors.secondary}; padding: 15px; font-weight: bold; color: #333; line-height: 1.5;">Q: ${appState.keyword}를 시작하는데 얼마나 시간이 걸리나요?</div>
        <div style="padding: 15px; background: white; line-height: 1.6;">A: 개인차가 있지만 보통 기초 준비에 1-2주, 본격적인 적용에 4-6주 정도 소요됩니다. 중요한 건 꾸준히 하는 거예요!</div>
    </div>
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 15px; overflow: hidden;">
        <div style="background: ${colors.secondary}; padding: 15px; font-weight: bold; color: #333; line-height: 1.5;">Q: 초기 비용이 많이 드나요?</div>
        <div style="padding: 15px; background: white; line-height: 1.6;">A: 기본적인 도구들만 있으면 시작할 수 있어요. 처음에는 무료 도구들을 활용하다가 필요에 따라 단계적으로 투자하시면 됩니다.</div>
    </div>
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 15px; overflow: hidden;">
        <div style="background: ${colors.secondary}; padding: 15px; font-weight: bold; color: #333; line-height: 1.5;">Q: 혼자서도 할 수 있을까요?</div>
        <div style="padding: 15px; background: white; line-height: 1.6;">A: 물론이죠! 이 가이드대로 천천히 따라하시면 혼자서도 충분히 가능해요. 막히는 부분이 있으면 관련 커뮤니티나 블로그를 참고하시면 도움이 될 거예요.</div>
    </div>
</div>

<div style="border-top: 1px dashed #ddd; margin: 35px 0;"></div>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;">
<strong>핵심 정리 및 다음 단계</strong> ✨
</h2>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;">지금까지 ${appState.selectedTopic}에 대해 자세히 알아봤어요. 중요한 포인트들을 다시 한번 정리해드릴게요:</p>

<ol style="margin: 0 0 20px 0; padding-left: 25px; font-size: 17px; line-height: 1.7;">
<li style="margin-bottom: 10px;"><strong>체계적인 접근이 핵심:</strong> 단계별로 차근차근 진행하는 것이 가장 중요해요</li>
<li style="margin-bottom: 10px;"><strong>꾸준함이 성공의 열쇠:</strong> 매일 조금씩이라도 꾸준히 하는 게 더 효과적이에요</li>
<li style="margin-bottom: 10px;"><strong>본인만의 속도로:</strong> 다른 사람과 비교하지 말고 본인의 상황에 맞게 조절하세요</li>
<li style="margin-bottom: 10px;"><strong>기록과 분석:</strong> 진행 상황을 기록하고 정기적으로 점검해보세요</li>
</ol>

<div style="background-color: ${colors.highlight}; border-left: 5px solid ${colors.highlightBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.primary};">🎯 오늘부터 시작할 수 있는 첫 번째 액션</strong><br>
이 글을 읽었으니까 이제 첫 번째 단계부터 시작해보세요! 완벽하게 준비될 때까지 기다리지 말고, 오늘 당장 할 수 있는 작은 것부터 시작하는 게 중요해요.
</div>

<p style="margin-bottom: 15px; font-size: 17px; line-height: 1.7;">더 궁금한 점이 있다면 댓글로 물어봐주세요~ 😊 <strong style="color: ${colors.primary};">여러분의 성공을 진심으로 응원합니다!</strong></p>

<p style="text-align: center; font-size: 18px;">
<strong>이건 아직 못 봤다면, 진짜 아쉬울 수 있어요.</strong><br>
👉 <a href="${refLink}" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: none; font-weight: bold;"><strong>워드프레스 꿀팁 보러 가기</strong></a>
</p>

</div>

<br><br>
${appState.keyword}, 블로그 작성, 콘텐츠 제작, SEO 최적화, 디지털 마케팅, 온라인 비즈니스, 웹 개발`;

      saveAppState({ 
        generatedContent: htmlContent,
        colorTheme: selectedColorTheme 
      });
      
      toast({
        title: "SEO 최적화된 블로그 글 생성 완료",
        description: "전문적이고 체계적인 HTML 콘텐츠가 생성되었습니다.",
      });
    } catch (error) {
      console.error('글 생성 오류:', error);
      toast({
        title: "글 생성 실패",
        description: "블로그 글 생성 중 오류가 발생했습니다.",
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
      
      // 영어로만 프롬프트 생성
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
    const apiKey = appState.apiKey; // API 키 보존
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
      apiKey // API 키만 유지
    };
    
    saveAppState(newState);
    setManualTopic('');
    
    toast({
      title: "초기화 완료",
      description: "API 키를 제외한 모든 데이터가 초기화되었습니다.",
    });
  };

  if (!appState.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Bot className="h-12 w-12 text-blue-600 mr-2" />
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">AI 블로그 콘텐츠 생성기</CardTitle>
                <p className="text-sm text-gray-600 mt-1">GenSpark 기반 자동화 콘텐츠 시스템</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">아이디</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={loginData.id}
                  onChange={(e) => setLoginData(prev => ({ ...prev, id: e.target.value }))}
                  className="pl-10"
                  style={{ color: '#000' }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10"
                  style={{ color: '#000' }}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>
            <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700">
              로그인
            </Button>
            <div className="text-center text-sm text-gray-600">
              <p>관리자 계정: 아이디 <strong>123</strong>, 비밀번호 <strong>123</strong></p>
              <p className="text-xs text-gray-500 mt-1">빈 입력으로 로그인하면 관리자 계정으로 자동 로그인됩니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI 블로그 콘텐츠 생성기</h1>
              <p className="text-sm text-gray-600">GenSpark 기반 자동화 콘텐츠 시스템 도구</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">사용자: {appState.currentUser} (관리자)</span>
            <span className="text-sm text-gray-500">로그인 시간: {new Date().toLocaleString('ko-KR')}</span>
            <Button onClick={resetApp} variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
              <RefreshCw className="h-4 w-4 mr-1" />
              초기화
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-1" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* 진행 단계 표시 */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step, index) => {
              const isActive = step === 1 || 
                              (step === 2 && appState.topics.length > 0) ||
                              (step === 3 && appState.selectedTopic) ||
                              (step === 4 && appState.generatedContent);
              const isCompleted = (step === 1 && appState.topics.length > 0) ||
                                (step === 2 && appState.selectedTopic) ||
                                (step === 3 && appState.generatedContent) ||
                                (step === 4 && appState.imagePrompt);
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted ? 'bg-green-500 text-white' : 
                    isActive ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  <div className="ml-2">
                    <div className={`text-sm font-medium ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                      {step === 1 && '주제 생성'}
                      {step === 2 && '글 작성'}  
                      {step === 3 && '이미지 생성'}
                      {step === 4 && '최종 완성'}
                    </div>
                  </div>
                  {index < 3 && <div className={`flex-1 h-1 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />}
                </div>
              );
            })}
          </div>
          <div className="text-right text-sm text-gray-600">
            생성된 주제 목록: {appState.topics.length}개 생성됨
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽 컬럼 */}
        <div className="space-y-6">
          {/* 1. 주제 생성 */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-700">
                <Lightbulb className="h-5 w-5 mr-2" />
                1. 주제 생성
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">핵심 키워드</label>
                <Input
                  placeholder="예: 프로그래밍, 요리, 투자, 건강 등"
                  value={appState.keyword}
                  onChange={(e) => saveAppState({ keyword: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">SEO에 최적화된 주제를 생성합니다</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">생성할 주제 수: {appState.topicCount}개</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={appState.topicCount}
                  onChange={(e) => saveAppState({ topicCount: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1개</span>
                  <span>20개</span>
                </div>
              </div>

              <Button 
                onClick={generateTopicsFromKeyword}
                disabled={!appState.keyword.trim() || isGeneratingTopics}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingTopics ? '주제 생성 중...' : '주제 생성하기'}
              </Button>

              {/* 수동 주제 생성 */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">수동 주제 입력</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="직접 주제를 입력해주세요"
                    value={manualTopic}
                    onChange={(e) => setManualTopic(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleManualTopicAdd}
                    disabled={!manualTopic.trim()}
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    수동 주제 생성하기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. 글 작성 */}
          <Card className={`shadow-md ${appState.topics.length === 0 ? 'opacity-50' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <Edit className="h-5 w-5 mr-2" />
                2. 글 작성
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">선택된 주제</label>
                <Select
                  value={appState.selectedTopic}
                  onValueChange={(value) => selectTopic(value)}
                  disabled={appState.topics.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="주제를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {appState.topics.map((topic, index) => (
                      <SelectItem key={index} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">컬러 테마</label>
                <Select
                  value={appState.colorTheme}
                  onValueChange={(value) => saveAppState({ colorTheme: value })}
                  disabled={!appState.selectedTopic}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="랜덤 선택 (권장)" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorThemes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>{theme.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">참조 링크</label>
                <Input
                  placeholder="예: https://worldpis.com"
                  value={appState.referenceLink}
                  onChange={(e) => saveAppState({ referenceLink: e.target.value })}
                  disabled={!appState.selectedTopic}
                />
                <p className="text-xs text-gray-500 mt-1">예: https://worldpis.com</p>
              </div>

              <Button 
                onClick={generateArticleContent}
                disabled={!appState.selectedTopic || isGeneratingContent}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingContent ? '글 생성 중...' : '글 생성하기'}
              </Button>
            </CardContent>
          </Card>

          {/* 3. 이미지 생성 */}
          <Card className={`shadow-md ${!appState.generatedContent ? 'opacity-50' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center text-pink-700">
                <Image className="h-5 w-5 mr-2" />
                3. 이미지 생성
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이미지 스타일</label>
                <div className="grid grid-cols-2 gap-2">
                  {imageStyles.map((style) => (
                    <label key={style.value} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="imageStyle"
                        value={style.value}
                        checked={appState.imageStyle === style.value}
                        onChange={(e) => saveAppState({ imageStyle: e.target.value })}
                        disabled={!appState.generatedContent}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{style.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button 
                onClick={createImagePromptFromTopic}
                disabled={!appState.generatedContent || !appState.imageStyle || isGeneratingImage}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingImage ? '이미지 프롬프트 생성 중...' : '이미지 프롬프트 생성 및 ImageFX 열기'}
              </Button>
            </CardContent>
          </Card>

          {/* API 및 링크 설정 */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                API 및 링크 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API 키</label>
                <div className="flex space-x-2">
                  <Input
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••••••••••"
                    value={appState.apiKey}
                    onChange={(e) => saveAppState({ apiKey: e.target.value })}
                    className="flex-1"
                  />
                  <Button onClick={handleApiKeySave} variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    API 키 저장 및 연결 확인
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  <a href="#" className="hover:underline">Google AI Studio에서 발급</a>
                </p>
              </div>

              <Button 
                onClick={handleApiKeySave}
                disabled={!appState.apiKey.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                API 키 저장 및 연결 확인
              </Button>

              <Button 
                variant="destructive"
                className="w-full"
                onClick={() => saveAppState({ apiKey: '' })}
              >
                API 키 삭제
              </Button>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">워드프레스 링크 설정</label>
                <Input
                  placeholder="예: https://yourblog.com"
                  value={appState.referenceLink}
                  onChange={(e) => saveAppState({ referenceLink: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">블로그 글 하단에 삽입될 수 있는 링크 (예: https://worldpis.com)</p>
              </div>

              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => toast({ title: "링크 저장", description: "워드프레스 링크가 저장되었습니다." })}
              >
                링크 저장
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽 컬럼 */}
        <div className="space-y-6">
          {/* 생성된 주제 목록 */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center text-blue-700">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  생성된 주제 목록
                </span>
                <span className="text-sm text-gray-500">{appState.topics.length}개 생성됨</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appState.topics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>키워드를 입력하고 주제를 생성해보세요!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {appState.topics.map((topic, index) => (
                    <div
                      key={index}
                      onClick={() => selectTopic(topic)}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        appState.selectedTopic === topic 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm">{topic}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 블로그 글 미리보기 */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center text-green-700">
                  <Edit className="h-5 w-5 mr-2" />
                  블로그 글 미리보기
                </span>
                <div className="flex space-x-2">
                  {appState.generatedContent && (
                    <>
                      <Button 
                        onClick={() => copyToClipboard(appState.generatedContent, 'HTML 복사')}
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        HTML 복사
                      </Button>
                      <Button 
                        onClick={downloadHTML}
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        다운로드
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appState.generatedContent ? (
                <div className="max-h-96 overflow-y-auto border p-4 rounded bg-gray-50">
                  <div dangerouslySetInnerHTML={{ __html: appState.generatedContent }} />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Edit className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>주제를 선택하고 글을 생성해보세요!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 이미지 프롬프트 */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-pink-700">
                <Image className="h-5 w-5 mr-2" />
                이미지 프롬프트
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appState.imagePrompt ? (
                <div className="space-y-3">
                  <Textarea
                    value={appState.imagePrompt}
                    readOnly
                    className="min-h-32 bg-gray-50"
                  />
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => copyToClipboard(appState.imagePrompt, '이미지 프롬프트')}
                      className="flex-1 bg-pink-600 hover:bg-pink-700"
                    >
                      복사
                    </Button>
                    <Button 
                      onClick={openWhisk}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Whisk 열기
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>이미지 프롬프트를 생성해보세요!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
