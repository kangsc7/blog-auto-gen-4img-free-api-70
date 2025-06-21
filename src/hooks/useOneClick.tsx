
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

const LATEST_ISSUE_KEYWORDS = [
  "2025년 최신 트렌드", "올해 주목받는", "최근 화제의", "지금 핫한", "2025 새로운",
  "요즘 인기 있는", "최신 이슈", "트렌딩", "화제", "최근 업데이트",
  "2025년 변화", "새롭게 떠오르는", "주목할 만한", "최근 개선된", "업데이트된"
];

const EVERGREEN_KEYWORDS = [
  "기본 가이드", "완전 정복", "초보자 가이드", "쉽게 따라하는", "단계별 설명",
  "필수 노하우", "꿀팁 모음", "실무 활용법", "효과적인 방법", "성공 전략",
  "기초부터 고급까지", "전문가 팁", "실용적인", "검증된 방법", "핵심 요약"
];

export const useOneClick = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void,
  generateTopics: (keywordOverride?: string) => Promise<string[] | null>,
  selectTopic: (topic: string) => void,
  generateArticle: (options?: { topic?: string; keyword?: string }) => Promise<string | null>,
  profile: any,
  preventDuplicates: boolean,
  hasAccess: boolean
) => {
  const { toast } = useToast();
  const [isOneClickGenerating, setIsOneClickGenerating] = useState(false);
  const [showTopicSelectionDialog, setShowTopicSelectionDialog] = useState(false);
  const [showDuplicateErrorDialog, setShowDuplicateErrorDialog] = useState(false);
  const cancelOneClick = useRef(false);
  const currentController = useRef<AbortController | null>(null);

  const validateConditions = (): boolean => {
    if (!hasAccess) {
      toast({
        title: "접근 권한 없음",
        description: "승인된 사용자만 이용할 수 있습니다.",
        variant: "destructive"
      });
      return false;
    }

    if (!appState.isApiKeyValidated) {
      toast({
        title: "API 키 검증 필요",
        description: "먼저 API 키를 입력하고 검증해주세요.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const executeOneClickFlow = async (keywordType: 'latest' | 'evergreen'): Promise<void> => {
    if (!validateConditions()) return;

    console.log(`🚀 ${keywordType} 원클릭 생성 시작`);
    setIsOneClickGenerating(true);
    cancelOneClick.current = false;
    currentController.current = new AbortController();

    try {
      // 1단계: 키워드 선택
      const keywords = keywordType === 'latest' ? LATEST_ISSUE_KEYWORDS : EVERGREEN_KEYWORDS;
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      
      console.log(`🎯 선택된 키워드: ${randomKeyword}`);
      
      // 키워드를 상태에 저장
      saveAppState({ keyword: randomKeyword });
      
      toast({
        title: `🎯 1단계: 키워드 선택 완료`,
        description: `선택된 키워드: ${randomKeyword}`,
        duration: 2000
      });

      if (cancelOneClick.current) throw new Error("사용자에 의해 중단되었습니다.");

      // 2단계: 주제 생성
      toast({
        title: "🎲 2단계: 주제 생성 중",
        description: "AI가 매력적인 주제들을 생성하고 있습니다.",
        duration: 3000
      });

      const topics = await generateTopics(randomKeyword);
      
      if (cancelOneClick.current) throw new Error("사용자에 의해 중단되었습니다.");

      if (!topics || topics.length === 0) {
        throw new Error("주제 생성에 실패했습니다.");
      }

      console.log(`✅ 생성된 주제 수: ${topics.length}`);
      console.log('📝 생성된 주제들:', topics);

      // 주제가 제대로 저장되었는지 확인
      setTimeout(() => {
        console.log('🔍 상태 확인 - 저장된 주제들:', appState.topics);
      }, 1000);

      toast({
        title: "✅ 2단계: 주제 생성 완료",
        description: `${topics.length}개의 주제가 생성되었습니다.`,
        duration: 2000
      });

      if (cancelOneClick.current) throw new Error("사용자에 의해 중단되었습니다.");

      // 3단계: 중복 체크
      let selectedTopic = "";
      
      if (preventDuplicates) {
        console.log('🔍 중복 방지 모드 - 기존 주제 확인');
        
        const existingTopics = JSON.parse(localStorage.getItem('generated_topics_history') || '[]');
        const availableTopics = topics.filter(topic => 
          !existingTopics.some((existing: string) => 
            existing.toLowerCase().includes(topic.toLowerCase()) || 
            topic.toLowerCase().includes(existing.toLowerCase())
          )
        );

        if (availableTopics.length === 0) {
          console.log('⚠️ 모든 주제가 중복됨');
          setShowDuplicateErrorDialog(true);
          return;
        }

        selectedTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
        console.log(`🎯 중복 제외 후 선택된 주제: ${selectedTopic}`);
      } else {
        selectedTopic = topics[Math.floor(Math.random() * topics.length)];
        console.log(`🎯 랜덤 선택된 주제: ${selectedTopic}`);
      }

      if (cancelOneClick.current) throw new Error("사용자에 의해 중단되었습니다.");

      // 4단계: 주제 선택
      toast({
        title: "🎯 3단계: 주제 선택 완료",
        description: `선택된 주제: ${selectedTopic}`,
        duration: 2000
      });

      selectTopic(selectedTopic);

      if (cancelOneClick.current) throw new Error("사용자에 의해 중단되었습니다.");

      // 5단계: 글 생성
      toast({
        title: "✍️ 4단계: 블로그 글 생성 중",
        description: "고품질 블로그 글을 작성하고 있습니다.",
        duration: 3000
      });

      const article = await generateArticle({ 
        topic: selectedTopic, 
        keyword: randomKeyword 
      });

      if (cancelOneClick.current) throw new Error("사용자에 의해 중단되었습니다.");

      if (!article) {
        throw new Error("블로그 글 생성에 실패했습니다.");
      }

      // 생성된 주제를 히스토리에 저장
      if (preventDuplicates) {
        const existingTopics = JSON.parse(localStorage.getItem('generated_topics_history') || '[]');
        existingTopics.push(selectedTopic);
        localStorage.setItem('generated_topics_history', JSON.stringify(existingTopics));
      }

      toast({
        title: "🎉 원클릭 생성 완료!",
        description: `${keywordType === 'latest' ? '최신 이슈' : '평생 키워드'} 블로그 글이 완성되었습니다.`,
        duration: 5000
      });

    } catch (error) {
      console.error(`❌ ${keywordType} 원클릭 생성 오류:`, error);
      
      let errorMessage = "원클릭 생성 중 오류가 발생했습니다.";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('중단')) {
          errorMessage = "사용자에 의해 중단되었습니다.";
        } else {
          errorMessage = error.message;
        }
      }
      
      if (errorMessage === "사용자에 의해 중단되었습니다.") {
        toast({
          title: "원클릭 생성 중단됨",
          description: "사용자 요청에 따라 생성을 중단했습니다.",
          variant: "default"
        });
      } else {
        toast({
          title: "원클릭 생성 실패",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsOneClickGenerating(false);
      cancelOneClick.current = false;
      currentController.current = null;
    }
  };

  const handleLatestIssueOneClick = () => {
    console.log('🔥 최신 이슈 원클릭 시작');
    executeOneClickFlow('latest');
  };

  const handleEvergreenKeywordOneClick = () => {
    console.log('🌱 평생 키워드 원클릭 시작');
    executeOneClickFlow('evergreen');
  };

  const handleStopOneClick = () => {
    console.log('⏹️ 원클릭 생성 중단 요청');
    
    cancelOneClick.current = true;
    
    if (currentController.current) {
      currentController.current.abort();
      console.log('AbortController.abort() 호출됨');
    }
    
    setIsOneClickGenerating(false);
    
    toast({
      title: "원클릭 생성 즉시 중단",
      description: "현재 진행 중인 원클릭 생성을 즉시 중단했습니다.",
      variant: "default"
    });
  };

  return {
    isOneClickGenerating,
    handleLatestIssueOneClick,
    handleEvergreenKeywordOneClick,
    handleStopOneClick,
    showTopicSelectionDialog,
    setShowTopicSelectionDialog,
    showDuplicateErrorDialog,
    setShowDuplicateErrorDialog
  };
};
