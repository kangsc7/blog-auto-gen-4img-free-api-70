
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState, Profile } from '@/types';
import { RealTimeTrendCrawler } from '@/lib/realTimeTrendCrawler';

export const useOneClick = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void,
  generateTopics: (keywordOverride?: string) => Promise<string[] | null>,
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

  const handleLatestIssueOneClick = async () => {
    if (!appState.isApiKeyValidated) {
      toast({
        title: "API 키 검증 필요",
        description: "먼저 API 키를 입력하고 검증해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!hasAccess) {
      toast({
        title: "접근 권한 없음",
        description: "이 기능을 사용할 권한이 없습니다.",
        variant: "destructive"
      });
      return;
    }

    setIsOneClickGenerating(true);
    
    try {
      console.log('🚀 최신 이슈 원클릭 생성 시작');
      
      // 1단계: 최신 트렌드 키워드 가져오기
      toast({ title: "1단계: 최신 이슈 분석 중...", description: "실시간 트렌드를 분석하고 있습니다." });
      
      const latestKeyword = await RealTimeTrendCrawler.getRandomLatestKeyword(
        appState.apiKey!,
        preventDuplicates ? appState.topics : []
      );

      if (!latestKeyword) {
        throw new Error('최신 키워드를 가져올 수 없습니다.');
      }

      console.log('📈 선택된 최신 키워드:', latestKeyword);
      
      // 년도 필터링 추가 검증
      if (latestKeyword.includes('2023') || latestKeyword.includes('2024')) {
        console.warn('⚠️ 과거 년도 키워드 감지, 재생성 시도');
        throw new Error('과거 년도가 포함된 키워드가 생성되었습니다. 다시 시도해주세요.');
      }

      // 키워드 업데이트
      saveAppState({ keyword: latestKeyword });

      // 2단계: 주제 생성
      toast({ title: "2단계: 관련 주제 생성 중...", description: `"${latestKeyword}" 관련 주제를 생성하고 있습니다.` });
      
      const topics = await generateTopics(latestKeyword);
      
      if (!topics || topics.length === 0) {
        throw new Error('주제를 생성할 수 없습니다.');
      }

      console.log('📋 생성된 주제들:', topics);

      // 3단계: 첫 번째 주제 자동 선택 및 글 생성
      const selectedTopic = topics[0];
      console.log('🎯 자동 선택된 주제:', selectedTopic);
      
      // 년도 필터링 추가 검증
      if (selectedTopic.includes('2023') || selectedTopic.includes('2024')) {
        console.warn('⚠️ 과거 년도 주제 감지, 필터링');
        throw new Error('과거 년도가 포함된 주제가 생성되었습니다. 다시 시도해주세요.');
      }

      toast({ title: "3단계: 블로그 글 생성 중...", description: `"${selectedTopic}" 주제로 글을 작성하고 있습니다.` });
      
      // 주제 선택
      selectTopic(selectedTopic);
      
      // 글 생성
      const result = await generateArticle({ 
        topic: selectedTopic, 
        keyword: latestKeyword 
      });

      if (result) {
        toast({
          title: "최신 이슈 원클릭 생성 완료! 🎉",
          description: `"${latestKeyword}" 키워드로 최신 트렌드 블로그 글이 완성되었습니다.`,
        });
        console.log('✅ 최신 이슈 원클릭 생성 완료');
      } else {
        throw new Error('글 생성에 실패했습니다.');
      }

    } catch (error) {
      console.error('❌ 최신 이슈 원클릭 생성 오류:', error);
      
      let errorMessage = "최신 이슈 원클릭 생성 중 오류가 발생했습니다.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "최신 이슈 원클릭 생성 실패",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsOneClickGenerating(false);
    }
  };

  const handleEvergreenKeywordOneClick = async () => {
    if (!appState.isApiKeyValidated) {
      toast({
        title: "API 키 검증 필요", 
        description: "먼저 API 키를 입력하고 검증해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!hasAccess) {
      toast({
        title: "접근 권한 없음",
        description: "이 기능을 사용할 권한이 없습니다.", 
        variant: "destructive"
      });
      return;
    }

    setIsOneClickGenerating(true);
    
    try {
      console.log('🌿 평생 키워드 원클릭 생성 시작');
      
      toast({ title: "1단계: 평생 키워드 생성 중...", description: "검색량이 많은 키워드를 분석하고 있습니다." });
      
      const evergreenKeywords = [
        "부업 추천", "재택근무 가이드", "투자 기초", "건강관리 팁", 
        "요리 레시피", "육아 정보", "생활 절약", "홈트레이닝",
        "디지털 활용", "자기계발", "취업 준비", "창업 아이디어"
      ];
      
      const randomKeyword = evergreenKeywords[Math.floor(Math.random() * evergreenKeywords.length)];
      console.log('🎯 선택된 평생 키워드:', randomKeyword);
      
      saveAppState({ keyword: randomKeyword });

      toast({ title: "2단계: 관련 주제 생성 중...", description: `"${randomKeyword}" 관련 주제를 생성하고 있습니다.` });
      
      const topics = await generateTopics(randomKeyword);
      
      if (!topics || topics.length === 0) {
        throw new Error('주제를 생성할 수 없습니다.');
      }

      console.log('📋 생성된 주제들:', topics);

      const selectedTopic = topics[0];
      console.log('🎯 자동 선택된 주제:', selectedTopic);

      toast({ title: "3단계: 블로그 글 생성 중...", description: `"${selectedTopic}" 주제로 글을 작성하고 있습니다.` });
      
      selectTopic(selectedTopic);
      
      const result = await generateArticle({ 
        topic: selectedTopic, 
        keyword: randomKeyword 
      });

      if (result) {
        toast({
          title: "평생 키워드 원클릭 생성 완료! 🎉",
          description: `"${randomKeyword}" 키워드로 평생 키워드 블로그 글이 완성되었습니다.`,
        });
        console.log('✅ 평생 키워드 원클릭 생성 완료');
      } else {
        throw new Error('글 생성에 실패했습니다.');
      }

    } catch (error) {
      console.error('❌ 평생 키워드 원클릭 생성 오류:', error);
      
      let errorMessage = "평생 키워드 원클릭 생성 중 오류가 발생했습니다.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "평생 키워드 원클릭 생성 실패",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsOneClickGenerating(false);
    }
  };

  const handleStopOneClick = () => {
    console.log('🛑 원클릭 생성 중단 요청');
    setIsOneClickGenerating(false);
    toast({
      title: "원클릭 생성 중단됨",
      description: "사용자 요청에 따라 원클릭 생성을 중단했습니다.",
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
