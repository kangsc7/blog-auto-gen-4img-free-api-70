
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { Profile } from '@/types';
import { RealTimeTrendCrawler } from '@/lib/realTimeTrendCrawler';

export const useOneClick = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void,
  generateTopics: () => Promise<string[] | null>,
  selectTopic: (topic: string) => void,
  generateArticle: (options?: { topic?: string; keyword?: string }) => Promise<string | null>,
  profile: Profile | null,
  preventDuplicates: boolean,
  hasAccess: boolean
) => {
  const { toast } = useToast();
  const [isOneClickGenerating, setIsOneClickGenerating] = useState(false);
  const [showTopicSelectionDialog, setShowTopicSelectionDialog] = useState(false);
  const [showDuplicateErrorDialog, setShowDuplicateErrorDialog] = useState(false);
  const [oneClickMode, setOneClickMode] = useState<'latest' | 'evergreen' | null>(null);

  const handleStopOneClick = () => {
    setIsOneClickGenerating(false);
    setOneClickMode(null);
    toast({ title: '원클릭 생성 중단', description: '원클릭 생성이 중단되었습니다.' });
  };

  // 원클릭 생성 함수 - 이벤트 핸들러
  const handleOneClickStart = async (mode: 'latest' | 'evergreen') => {
    try {
      if (!appState.isApiKeyValidated) {
        toast({
          title: "API 키 검증 필요",
          description: "API 키를 설정하고 검증한 후 다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }

      setIsOneClickGenerating(true);
      setOneClickMode(mode);

      let keyword: string;
      
      if (mode === 'latest') {
        // 실시간 이슈 크롤링 수행
        toast({
          title: "실시간 이슈 크롤링 중",
          description: "현재 시간대의 최신 이슈를 수집하고 있습니다...",
        });

        try {
          const latestTrends = await RealTimeTrendCrawler.getLatestTrends(appState.apiKey!);
          if (latestTrends.length > 0) {
            keyword = `최신 이슈, 뉴스, 트렌드, 실시간 이슈: ${latestTrends.slice(0, 5).join(', ')}`;
            console.log('크롤링된 최신 이슈:', latestTrends);
          } else {
            keyword = '최신 이슈, 뉴스, 트렌드';
          }
        } catch (error) {
          console.error('실시간 크롤링 오류:', error);
          keyword = '최신 이슈, 뉴스, 트렌드';
        }
      } else {
        keyword = '재테크, 투자, 상품권';
      }

      saveAppState({ keyword });

      toast({
        title: `${mode === 'latest' ? '최신 이슈' : '평생 키워드'} 글 생성 시작`,
        description: "주제를 생성하는 중입니다...",
      });

      // 1. 주제 생성
      const topics = await generateTopics();
      
      if (!topics || topics.length === 0) {
        setIsOneClickGenerating(false);
        setOneClickMode(null);
        toast({
          title: "주제 생성 실패",
          description: "주제를 생성하지 못했습니다. 다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }

      // 2. 주제 선택 다이얼로그 표시
      setShowTopicSelectionDialog(true);
    } catch (error) {
      console.error("원클릭 생성 오류:", error);
      setIsOneClickGenerating(false);
      setOneClickMode(null);
      toast({
        title: "원클릭 생성 실패",
        description: "생성 과정에서 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 주제가 선택되었을 때 처리 함수
  const handleTopicSelect = async (topic: string) => {
    try {
      // 다이얼로그 닫기
      setShowTopicSelectionDialog(false);
      
      // 1. 주제 선택
      selectTopic(topic);
      
      toast({
        title: "글 생성 시작",
        description: `"${topic}" 주제로 블로그 글을 생성하고 있습니다...`,
      });
      
      // 2. 컨텐츠 생성
      await generateArticle({ topic, keyword: appState.keyword });
      
      // 3. 완료 메시지
      toast({
        title: "원클릭 생성 완료",
        description: `"${topic}" 주제로 글이 생성되었습니다.`,
      });
    } catch (error) {
      console.error("주제 선택 후 처리 오류:", error);
      toast({
        title: "글 생성 실패",
        description: "선택한 주제로 글을 생성하지 못했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsOneClickGenerating(false);
      setOneClickMode(null);
    }
  };

  // 주제 선택 취소 시
  const handleTopicSelectionCancel = () => {
    setShowTopicSelectionDialog(false);
    setIsOneClickGenerating(false);
    setOneClickMode(null);
    toast({
      title: "주제 선택 취소",
      description: "원클릭 생성이 취소되었습니다.",
    });
  };

  // 최신 이슈 원클릭 생성 함수
  const handleLatestIssueOneClick = async () => {
    if (!hasAccess) {
      toast({
        title: "접근 제한",
        description: "해당 기능을 사용할 권한이 없습니다. 관리자에게 문의하세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (isOneClickGenerating) {
      toast({
        title: "이미 진행 중인 작업이 있습니다",
        description: "현재 진행 중인 작업이 완료된 후 다시 시도해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('최신 이슈 원클릭 생성 시작');
    handleOneClickStart('latest');
  };

  // 평생 키워드 원클릭 생성 함수
  const handleEvergreenKeywordOneClick = async () => {
    if (!hasAccess) {
      toast({
        title: "접근 제한", 
        description: "해당 기능을 사용할 권한이 없습니다. 관리자에게 문의하세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (isOneClickGenerating) {
      toast({
        title: "이미 진행 중인 작업이 있습니다",
        description: "현재 진행 중인 작업이 완료된 후 다시 시도해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('평생 키워드 원클릭 생성 시작');
    handleOneClickStart('evergreen');
  };

  return {
    isOneClickGenerating,
    handleLatestIssueOneClick,
    handleEvergreenKeywordOneClick,
    handleStopOneClick,
    showTopicSelectionDialog,
    setShowTopicSelectionDialog,
    showDuplicateErrorDialog,
    setShowDuplicateErrorDialog,
    handleTopicSelect,
    handleTopicSelectionCancel,
    oneClickMode
  };
};
