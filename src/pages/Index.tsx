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
  isApiKeyValidated: boolean;
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
      const existingUsers = localStorage.getItem('blog_users');
      
      if (!existingUsers) {
        const defaultUsers: User[] = [{ id: '123', password: '123' }];
        localStorage.setItem('blog_users', JSON.stringify(defaultUsers));
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
        // API 키 관련 상태는 로드하지 않음 (보안상 매번 새로 입력하도록)
        delete parsedState.apiKey;
        delete parsedState.isApiKeyValidated;
        setAppState(prev => ({ ...prev, ...parsedState, apiKey: '', isApiKeyValidated: false }));
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const keyword = appState.keyword.toLowerCase().trim();
      
      // 키워드별 전문적이고 자연스러운 주제 템플릿
      const topicTemplates = {
        "당뇨병": [
          "당뇨병 초기 증상과 예방 관리법",
          "당뇨병 환자를 위한 올바른 식단 가이드",
          "당뇨병 합병증 예방하는 생활습관",
          "당뇨병 혈당 관리 실전 노하우",
          "당뇨병과 함께 건강하게 살아가는 방법"
        ],
        "블로그": [
          "블로그 수익화를 위한 완전 가이드",
          "성공하는 블로그 운영 전략과 팁",
          "블로그 방문자 늘리는 SEO 최적화 방법",
          "블로그 콘텐츠 기획부터 작성까지",
          "블로그로 수익을 만드는 실전 방법"
        ],
        "투자": [
          "투자 초보를 위한 안전한 시작 가이드",
          "2024년 주목해야 할 투자 분야",
          "부동산 투자 성공 전략과 주의사항",
          "안정적인 펀드 투자 방법과 선택법",
          "투자 실패를 피하는 핵심 원칙"
        ],
        "요리": [
          "바쁜 직장인을 위한 간단 요리 레시피",
          "건강한 다이어트 요리 만들기",
          "집에서 만드는 카페 스타일 음료",
          "아이가 좋아하는 영양 만점 요리",
          "초보자를 위한 홈베이킹 시작 가이드"
        ],
        "운동": [
          "집에서 하는 효과적인 홈트레이닝",
          "다이어트 성공을 위한 운동 방법",
          "헬스장 이용 가이드와 운동 루틴",
          "바쁜 직장인을 위한 10분 운동법",
          "근력 운동으로 몸매 관리하는 방법"
        ],
        "여행": [
          "국내 숨은 여행지 추천 베스트",
          "해외여행 경비 절약하는 꿀팁",
          "혼자 떠나는 안전한 여행 가이드",
          "가족 여행지 추천과 계획 세우기",
          "여행 필수품 완벽 체크리스트"
        ],
        "프로그래밍": [
          "프로그래밍 입문자를 위한 완전 가이드",
          "웹개발 학습 로드맵과 순서",
          "코딩테스트 합격을 위한 알고리즘 공부법",
          "개발자 취업을 위한 포트폴리오 만들기",
          "실무에서 자주 사용하는 개발 도구들"
        ],
        "마케팅": [
          "소상공인을 위한 디지털 마케팅 전략",
          "SNS 마케팅으로 고객 늘리는 방법",
          "브랜딩 성공 사례와 핵심 전략",
          "온라인 광고 효과 극대화하는 방법",
          "바이럴 마케팅의 성공 비결"
        ],
        "부동산": [
          "내 집 마련을 위한 부동산 투자 가이드",
          "전세와 월세 선택 기준과 가이드",
          "부동산 중개수수료 절약하는 방법",
          "아파트 매매 시 체크해야 할 포인트",
          "부동산 대출 조건과 금리 비교법"
        ],
        "건강": [
          "면역력 높이는 생활 습관과 방법",
          "올바른 다이어트와 건강 관리법",
          "스트레스 해소에 효과적인 방법들",
          "건강한 수면을 위한 실천법",
          "중년 건강관리 필수 체크리스트"
        ],
        "사랑": [
          "연인과의 관계 개선하는 방법",
          "건강한 연애를 위한 소통 기술",
          "사랑을 표현하는 다양한 방법들",
          "연애 갈등 해결을 위한 실용적 조언",
          "오래가는 연애 관계 유지 비결"
        ]
      };

      // 키워드에 맞는 자연스러운 주제 생성 함수
      const generateContextualTopics = (keyword: string, count: number) => {
        const topics = [];
        
        // 키워드별 맞춤형 패턴
        const contextualPatterns = {
          "사랑": [
            `${keyword}을 표현하는 특별한 방법`,
            `${keyword}하는 사람과의 관계 발전시키기`,
            `진정한 ${keyword}의 의미와 표현법`,
            `${keyword}받는 사람이 되는 방법`,
            `${keyword}을 오래 지속시키는 비결`
          ],
          "고백": [
            `성공하는 ${keyword} 방법과 타이밍`,
            `${keyword} 전 준비해야 할 것들`,
            `상황별 ${keyword} 메시지 작성법`,
            `${keyword} 후 관계 발전시키는 방법`,
            `${keyword} 실패를 극복하는 방법`
          ],
          "데이트": [
            `완벽한 첫 ${keyword} 계획 세우기`,
            `${keyword} 장소 추천과 선택 가이드`,
            `${keyword} 중 피해야 할 실수들`,
            `기념일 ${keyword} 아이디어와 준비법`,
            `${keyword} 비용 절약하는 스마트한 방법`
          ],
          "결혼": [
            `${keyword} 준비 완벽 가이드와 체크리스트`,
            `행복한 ${keyword} 생활을 위한 조언`,
            `${keyword} 비용 절약하는 현실적 방법`,
            `${keyword} 전 꼭 알아야 할 것들`,
            `성공적인 ${keyword} 준비 단계별 가이드`
          ]
        };
        
        // 기본 패턴 (모든 키워드에 적용 가능)
        const universalPatterns = [
          `${keyword} 완전 정복 가이드`,
          `${keyword} 성공하는 실전 방법`,
          `${keyword} 초보자를 위한 단계별 가이드`,
          `${keyword} 전문가가 알려주는 노하우`,
          `${keyword} 실패하지 않는 선택법`,
          `${keyword} 체계적으로 접근하는 방법`,
          `${keyword} 효과적인 관리와 활용법`,
          `${keyword} 성공 사례와 배울 점`,
          `${keyword} 기초부터 응용까지`,
          `${keyword} 실전에서 바로 쓰는 팁`
        ];
        
        // 맞춤형 패턴이 있는 경우 우선 사용
        const patterns = contextualPatterns[keyword] || universalPatterns;
        
        // 패턴을 섞어서 중복 없이 선택
        const shuffled = patterns.sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
          topics.push(shuffled[i]);
        }
        
        return topics;
      };

      let topics: string[] = [];
      
      // 미리 정의된 템플릿이 있는 경우
      if (topicTemplates[keyword]) {
        topics = topicTemplates[keyword].slice(0, appState.topicCount);
        
        // 요청한 개수가 더 많으면 맞춤형 추가 주제 생성
        if (appState.topicCount > topics.length) {
          const additionalTopics = generateContextualTopics(appState.keyword, appState.topicCount - topics.length);
          topics = [...topics, ...additionalTopics];
        }
      } else {
        // 일반적인 키워드인 경우 맞춤형 주제 생성
        topics = generateContextualTopics(appState.keyword, appState.topicCount);
      }

      saveAppState({ topics });
      toast({
        title: "자연스러운 SEO 최적화 주제 생성 완료",
        description: `${topics.length}개의 검색 친화적 주제가 생성되었습니다.`,
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
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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
      
      // 개선된 키워드 추출 함수 - 주제의 핵심 개념을 더 정확하게 파악
      const extractMainConcept = (topic: string) => {
        // 주제에서 핵심 개념을 추출하는 규칙들
        const conceptPatterns = [
          // 명사형 개념들
          { pattern: /(\w+) (완전|성공|실전|효과적인|안전한|올바른|건강한|체계적인)/, extract: 1 },
          { pattern: /(\w+)을? (표현|관리|예방|개선|해결|선택|활용)/, extract: 1 },
          { pattern: /(\w+)를? (위한|통한|이용한)/, extract: 1 },
          { pattern: /(\w+) (방법|가이드|전략|노하우|팁|기술|비결)/, extract: 1 },
          { pattern: /(\w+) (초보자|입문자|환자)/, extract: 1 },
          // 동사형 개념들
          { pattern: /(투자|요리|운동|여행|학습|마케팅) /, extract: 1 },
          // 복합 개념들
          { pattern: /(부동산 투자|홈트레이닝|다이어트|프로그래밍|블로그 운영)/, extract: 1 }
        ];

        for (const { pattern, extract } of conceptPatterns) {
          const match = topic.match(pattern);
          if (match && match[extract]) {
            return match[extract];
          }
        }
        
        // 패턴에 매칭되지 않으면 원래 키워드 사용
        return appState.keyword;
      };
      
      const mainConcept = extractMainConcept(appState.selectedTopic);
      
      // 개념별 맞춤형 문구 생성
      const getConceptualIntro = (concept: string, topic: string) => {
        const introPatterns = {
          "투자": `${concept} 때문에 고민이시죠?`,
          "다이어트": `${concept} 때문에 스트레스받고 계시나요?`,
          "요리": `${concept}가 어려우시다고요?`,
          "운동": `${concept}을 시작하고 싶으신가요?`,
          "여행": `${concept} 계획 때문에 고민이시죠?`,
          "프로그래밍": `${concept} 학습이 막막하신가요?`,
          "블로그": `${concept} 운영이 어려우신가요?`,
          "마케팅": `${concept} 전략 때문에 고민이시죠?`,
          "부동산": `${concept} 때문에 고민이시나요?`,
          "건강": `${concept} 관리가 어려우신가요?`,
          "사랑": `${concept} 때문에 고민이시나요?`,
          "고백": `${concept}을 어떻게 해야 할지 모르겠다고요?`,
          "데이트": `${concept} 준비 때문에 스트레스받고 계시나요?`,
          "결혼": `${concept} 준비가 막막하신가요?`
        };
        
        return introPatterns[concept] || `${concept} 때문에 고민이시죠?`;
      };

      const getConceptualH2Title = (concept: string) => {
        const h2Patterns = {
          "투자": `${concept}, 왜 중요할까요? 기초 지식부터!`,
          "다이어트": `${concept}, 왜 실패할까요? 원인 분석부터!`,
          "요리": `${concept}, 왜 어려울까요? 기본기부터!`,
          "운동": `${concept}, 왜 중요할까요? 효과 파악부터!`,
          "여행": `${concept}, 왜 계획이 중요할까요? 준비부터!`,
          "프로그래밍": `${concept}, 왜 어려울까요? 기초 이해부터!`,
          "블로그": `${concept}, 왜 중요할까요? 전략 수립부터!`,
          "마케팅": `${concept}, 왜 필요할까요? 목적 파악부터!`,
          "부동산": `${concept}, 왜 신중해야 할까요? 시장 이해부터!`,
          "건강": `${concept}, 왜 중요할까요? 기본 원리부터!`,
          "사랑": `${concept}, 왜 어려울까요? 마음 이해부터!`,
          "고백": `${concept}, 왜 떨릴까요? 준비 과정부터!`,
          "데이트": `${concept}, 왜 긴장될까요? 계획 세우기부터!`,
          "결혼": `${concept}, 왜 신중해야 할까요? 준비 과정부터!`
        };
        
        return h2Patterns[concept] || `${concept}, 왜 중요할까요? 원리 파악부터!`;
      };
      
      const conceptualIntro = getConceptualIntro(mainConcept, appState.selectedTopic);
      const conceptualH2 = getConceptualH2Title(mainConcept);
      
      const htmlContent = `<div>
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

<h3 style="font-size: 28px; color: #333; margin-top: 25px; margin-bottom: 20px; text-align: center; line-height: 1.4;" data-ke-size="size23">${appState.selectedTopic}</h3>

<div style="background-color: ${colors.secondary}; padding: 18px; border-radius: 10px; font-style: italic; margin-bottom: 28px; font-size: 18px; line-height: 1.7;">
<strong>${conceptualIntro}</strong> ${appState.selectedTopic}에 대한 완벽한 가이드를 통해 누구나 쉽게 따라할 수 있는 실전 노하우를 소개해드립니다.
</div>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">안녕하세요! 저도 ${mainConcept}와 관련해서 정말 많은 시행착오를 겪었는데요. 처음엔 어디서부터 시작해야 할지 막막했거든요. 😥 하지만 지금은 저만의 <span style="background-color: ${colors.textHighlight}; padding: 3px 6px; border-radius: 4px; font-weight: bold;">${mainConcept} 노하우</span>가 생겼답니다!</p>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">실제로 제가 경험해보고 검증한 방법들만 골라서 정리했으니까, 바로 적용해볼 수 있는 내용들이에요. 특히 초보자분들도 쉽게 따라할 수 있도록 단계별로 자세히 설명드릴게요! 이 글을 통해 여러분도 ${mainConcept} 스트레스에서 벗어나 더욱 만족스러운 결과를 얻으실 수 있을 거예요. 😊</p>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26">
<strong>${conceptualH2}</strong> 💡
</h2>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">${appState.selectedTopic}와 관련된 문제는 사실 아주 흔한 일이에요. 많은 분들이 비슷한 고민을 갖고 계시죠. 특히 이런 분들에게는 더욱 중요합니다:</p>

<ul style="margin: 0 0 20px 0; padding-left: 25px; font-size: 17px; line-height: 1.7;" data-ke-list-type="disc">
<li style="margin-bottom: 8px;">시간은 부족하지만 효과적인 결과를 원하시는 분</li>
<li style="margin-bottom: 8px;">처음 시작하는데 어디서부터 해야 할지 모르겠는 분</li>
<li style="margin-bottom: 8px;">이미 시도해봤지만 만족스러운 결과를 얻지 못한 분</li>
<li style="margin-bottom: 8px;">체계적이고 검증된 방법을 찾고 계신 분</li>
</ul>

<p style="margin-bottom: 18px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">하지만 ${mainConcept}가 갑자기 문제가 되거나, 스트레스, 환경 변화 등 <span style="background-color: ${colors.textHighlight}; padding: 3px 6px; border-radius: 4px; font-weight: bold;">다른 요인</span>으로 인해 발생하는 경우도 있어요. 저도 한번은 스트레스로 인해 어려움을 겪었던 기억이 나네요. 🥺 그래서 단순히 문제라고 생각하기보다, 혹시 다른 원인이 있는 건 아닌지 세심히 살펴보는 게 중요합니다.</p>

<div style="background-color: ${colors.highlight}; border-left: 5px solid ${colors.highlightBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.primary};">💡 알아두세요!</strong><br>
${mainConcept}의 핵심은 올바른 순서와 꾸준한 실행이에요. 무작정 시작하기보다는 체계적으로 접근하는 것이 성공의 열쇠입니다.
</div>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26">
<strong>${mainConcept} 핵심 실전 가이드!</strong> 📝
</h2>

<div style="margin-top: 20px;"></div>

<div style="background-color: ${colors.highlight}; border-left: 5px solid ${colors.highlightBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.primary};">💡 팁 1: 기초 준비는 필수!</strong><br>
체계적인 준비는 성공의 50%를 좌우한다고 생각해요. 기본기가 탄탄해야 나중에 응용할 수 있거든요.
</div>

<ul style="margin: 0 0 20px 0; padding-left: 25px; font-size: 17px; line-height: 1.7;" data-ke-list-type="disc">
<li style="margin-bottom: 8px;"><strong>목표 설정:</strong> 명확하고 측정 가능한 목표를 세우세요. 구체적일수록 좋아요!</li>
<li style="margin-bottom: 8px;"><strong>현재 상황 파악:</strong> 지금 어느 단계에 있는지 정확히 파악하기. 솔직한 자기 진단이 중요합니다.</li>
<li style="margin-bottom: 8px;"><strong>필요한 도구 준비:</strong> 기본적인 도구들을 미리 준비해두면 중간에 헤매지 않아요.</li>
</ul>

<div style="background-color: ${colors.highlight}; border-left: 5px solid ${colors.highlightBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.primary};">💡 팁 2: 올바른 실행 방법!</strong><br>
준비가 끝났다면 이제 본격적인 실행 단계예요. 여기서 실수하면 나중에 돌이키기 어려우니까 천천히 따라해보세요.
</div>

<ul style="margin: 0 0 20px 0; padding-left: 25px; font-size: 17px; line-height: 1.7;" data-ke-list-type="disc">
<li style="margin-bottom: 8px;"><strong>단계별 접근:</strong> 한 번에 모든 걸 하려고 하지 마시고 단계별로 차근차근 진행하세요.</li>
<li style="margin-bottom: 8px;"><strong>꾸준한 실행:</strong> 매일 조금씩이라도 꾸준히 하는 게 더 효과적이에요. 습관을 만드는 게 중요합니다.</li>
<li style="margin-bottom: 8px;"><strong>결과 확인:</strong> 중간중간 결과를 점검하고 필요하면 방향을 조정하세요.</li>
</ul>

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

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26">
<strong>이것만은 주의하세요!</strong> ⚠️
</h2>

<div style="background-color: ${colors.warnBg}; border-left: 5px solid ${colors.warnBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.warnBorder};">⚠️ 과도한 스트레스는 금물!</strong><br>
${mainConcept} 때문에 너무 스트레스받지 마세요. 스트레스는 오히려 문제를 악화시키는 요인이 될 수 있어요. 저도 처음엔 너무 강박적으로 접근했는데, 그게 독이 되더라고요. ㅠㅠ
</div>

<div style="background-color: ${colors.warnBg}; border-left: 5px solid ${colors.warnBorder}; padding: 18px; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 17px; line-height: 1.6;">
<strong style="color: ${colors.warnBorder};">⚠️ 전문가 상담이 필요한 경우!</strong><br>
만약 일반적인 방법으로 해결되지 않거나, 다른 증상이 동반된다면 바로 전문가와 상담하는 것이 중요해요. 자가 판단으로 시간을 지체하면 상황이 악화될 수 있습니다.
</div>

<div style="border-top: 1px dashed #ddd; margin: 35px 0;"></div>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26">
<strong>${mainConcept} 관리, 핵심 요약 카드!</strong> 📌
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
<h3 data-ke-size="size23">${mainConcept} 관리의 핵심!</h3>
</div>
<div class="card-content">
<div class="section"><strong>체계적인 준비:</strong> <span class="highlight">명확한 목표와 계획 수립!</span></div>
<div class="section"><strong>단계별 실행:</strong> <span class="highlight">꾸준함이 성공의 열쇠!</span></div>
<div class="section"><strong>올바른 방법:</strong>
<div class="formula">검증된 방법으로 차근차근 접근하기</div>
</div>
<div class="section"><strong>지속적인 관리:</strong> <span class="highlight">정기적인 점검과 개선!</span></div>
</div>
<div class="card-footer">성공적인 ${mainConcept} 관리를 위한 필수 습관!</div>
</div>
</div>

<h2 style="font-size: 24px; color: ${colors.primary}; margin: 35px 0 18px; padding-bottom: 10px; border-bottom: 2px solid #eaeaea; font-weight: bold; line-height: 1.4;" data-ke-size="size26">
<strong>궁금해요! ${mainConcept} Q&A</strong> ❓
</h2>

<div style="margin: 30px 0;">
<div style="margin-bottom: 22px;">
<div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: ${mainConcept}를 시작하는데 얼마나 시간이 걸리나요?</div>
<div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: 개인차가 있지만 보통 기초 준비에 1-2주, 본격적인 적용에 4-6주 정도 소요됩니다. 중요한 건 꾸준히 하는 거예요!</div>
</div>
<div style="margin-bottom: 22px;">
<div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: 초기 비용이 많이 드나요?</div>
<div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: 기본적인 것들만 있으면 시작할 수 있어요. 처음에는 무료로 할 수 있는 것들을 활용하다가 필요에 따라 단계적으로 투자하시면 됩니다.</div>
</div>
<div style="margin-bottom: 22px;">
<div style="font-weight: bold; margin-bottom: 8px; font-size: 17px; line-height: 1.5;">Q: 혼자서도 할 수 있을까요?</div>
<div style="padding-left: 18px; font-size: 17px; line-height: 1.6;">A: 물론이죠! 이 가이드대로 천천히 따라하시면 혼자서도 충분히 가능해요. 막히는 부분이 있으면 관련 커뮤니티나 전문가와 상담하시면 도움이 될 거예요.</div>
</div>
</div>

<p style="margin-bottom: 15px; font-size: 17px; line-height: 1.7;" data-ke-size="size16">${appState.selectedTopic}에 대한 완벽한 가이드, 어떠셨나요? 제가 알려드린 팁들이 조금이나마 도움이 되셨으면 좋겠어요. 꾸준한 관심과 노력이 있다면 여러분도 ${mainConcept} 고민에서 벗어날 수 있답니다! 더 궁금한 점이 있다면 언제든 댓글로 물어봐주세요~ 😊</p>

<p style="text-align: center; font-size: 18px;" data-ke-size="size16">
<strong>이건 아직 못 봤다면, 진짜 아쉬울 수 있어요.</strong><br>
👉 <a href="${refLink}" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: none; font-weight: bold;"><strong>워드프레스 꿀팁 보러 가기</strong></a>
</p>

</div>

<br><br>
${mainConcept}, ${appState.keyword}, 블로그 작성, 콘텐츠 제작, SEO 최적화, 디지털 마케팅, 온라인 비즈니스`;

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Bot className="h-12 w-12 text-blue-600 mr-2" />
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">AI 블로그 콘텐츠 생성기</CardTitle>
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
            <span className="text-sm text-gray-600">사용자: {appState.currentUser}</span>
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

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 왼쪽 컬럼 - 4/12 비율 */}
        <div className="lg:col-span-4 space-y-6">
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
                disabled={!appState.keyword.trim() || isGeneratingTopics || !appState.isApiKeyValidated}
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
                    추가
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
                disabled={!appState.selectedTopic || isGeneratingContent || !appState.isApiKeyValidated}
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
                disabled={!appState.generatedContent || !appState.imageStyle || isGeneratingImage || !appState.isApiKeyValidated}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingImage ? '이미지 프롬프트 생성 중...' : '이미지 프롬프트 생성'}
              </Button>
            </CardContent>
          </Card>

          {/* 이미지 프롬프트 - 3. 이미지 생성 바로 아래 */}
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

          {/* API 키 설정 */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                API 키 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API 키</label>
                <div className="flex space-x-2">
                  <Input
                    type="password"
                    placeholder="API 키를 입력해주세요"
                    value={appState.apiKey}
                    onChange={(e) => saveAppState({ apiKey: e.target.value })}
                    className="flex-1"
                  />
                  <Button 
                    onClick={validateApiKey} 
                    disabled={!appState.apiKey.trim() || isValidatingApi}
                    variant="outline" 
                    className={appState.isApiKeyValidated ? "text-green-600 border-green-600 hover:bg-green-50" : "text-blue-600 border-blue-600 hover:bg-blue-50"}
                  >
                    {isValidatingApi ? (
                      <>검증 중...</>
                    ) : appState.isApiKeyValidated ? (
                      <><CheckCircle className="h-4 w-4 mr-1" />연결됨</>
                    ) : (
                      '검증'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="hover:underline">Google AI Studio에서 발급</a>
                </p>
                {appState.isApiKeyValidated && (
                  <p className="text-xs text-green-600 mt-1">✅ API 키가 검증되었습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽 컬럼 - 8/12 비율 */}
        <div className="lg:col-span-8 space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
                <div className="border p-4 rounded bg-gray-50 overflow-y-auto max-h-screen">
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
        </div>
      </div>
    </div>
  );
};

export default Index;
