
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type GenerateTopicsFunc = (keyword: string) => Promise<string[] | null>;
type GenerateArticleFunc = (options?: { topic?: string; keyword?: string; }) => Promise<string | null>;

export const useOneClick = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void,
  generateTopics: GenerateTopicsFunc,
  selectTopic: (topic: string) => void,
  generateArticle: GenerateArticleFunc
) => {
  const { toast } = useToast();
  const [isOneClickGenerating, setIsOneClickGenerating] = useState(false);
  
  const [usedLatestKeywords, setUsedLatestKeywords] = useState<string[]>(() => {
    try {
      const item = window.localStorage.getItem('usedLatestKeywords');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading usedLatestKeywords from localStorage', error);
      return [];
    }
  });

  const [usedEvergreenKeywords, setUsedEvergreenKeywords] = useState<string[]>(() => {
    try {
      const item = window.localStorage.getItem('usedEvergreenKeywords');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading usedEvergreenKeywords from localStorage', error);
      return [];
    }
  });

  const cancelGeneration = useRef(false);

  useEffect(() => {
    try {
      window.localStorage.setItem('usedLatestKeywords', JSON.stringify(usedLatestKeywords));
    } catch (error) {
      console.error('Error saving usedLatestKeywords to localStorage', error);
    }
  }, [usedLatestKeywords]);

  useEffect(() => {
    try {
      window.localStorage.setItem('usedEvergreenKeywords', JSON.stringify(usedEvergreenKeywords));
    } catch (error) {
      console.error('Error saving usedEvergreenKeywords to localStorage', error);
    }
  }, [usedEvergreenKeywords]);

  const runOneClickFlow = async (keywordSource: 'latest' | 'evergreen') => {
    if (isOneClickGenerating) return;
    setIsOneClickGenerating(true);
    cancelGeneration.current = false;

    try {
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
      if (!appState.isApiKeyValidated) {
        toast({ title: "API 키 검증 필요", description: "먼저 API 키를 입력하고 검증해주세요.", variant: "destructive" });
        return;
      }

      const latestKeywords = ["국내 여행지 추천", "여름 휴가 계획", "맛집 탐방", "인공지능 최신 기술", "2025년 패션 트렌드"];
      const evergreenKeywords = ["초보자를 위한 투자 가이드", "건강한 아침 식단 아이디어", "스트레스 해소 방법", "코딩 독학 하는 법", "효과적인 시간 관리 기술"];
      
      const keywords = keywordSource === 'latest' ? latestKeywords : evergreenKeywords;
      const keywordType = keywordSource === 'latest' ? '최신 트렌드' : '평생';
      const usedKeywords = keywordSource === 'latest' ? usedLatestKeywords : usedEvergreenKeywords;
      const setUsedKeywords = keywordSource === 'latest' ? setUsedLatestKeywords : setUsedEvergreenKeywords;

      toast({ title: `1단계: ${keywordType} 키워드 추출`, description: `실시간 트렌드 키워드(예시)를 가져옵니다...` });
      await sleep(3000);
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");


      let availableKeywords = keywords.filter(k => !usedKeywords.includes(k));

      if (availableKeywords.length === 0) {
        toast({ title: "키워드 목록 초기화", description: "모든 키워드를 사용했습니다. 목록을 초기화합니다." });
        setUsedKeywords([]);
        availableKeywords = keywords;
      }
      
      const keyword = availableKeywords[Math.floor(Math.random() * availableKeywords.length)];
      setUsedKeywords(prevUsed => [...prevUsed, keyword]);

      saveAppState({ keyword });
      toast({ title: "키워드 자동 입력 완료", description: `'${keyword}' (으)로 주제 생성을 시작합니다.` });
      
      await sleep(3000);
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

      toast({ title: "2단계: AI 주제 생성 시작", description: "선택된 키워드로 블로그 주제를 생성합니다..." });
      const newTopics = await generateTopics(keyword);
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
      if (!newTopics || newTopics.length === 0) {
        throw new Error("주제 생성에 실패하여 중단합니다.");
      }

      await sleep(3000);
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

      toast({ title: "3단계: 주제 랜덤 선택", description: "생성된 주제 중 하나를 자동으로 선택합니다..." });
      const randomTopic = newTopics[Math.floor(Math.random() * newTopics.length)];
      selectTopic(randomTopic);

      await sleep(3000);
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

      toast({ title: "4단계: AI 글 생성 시작", description: "선택된 주제로 블로그 본문을 생성합니다..." });
      const articleGenerated = await generateArticle({ topic: randomTopic, keyword });
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
      if (!articleGenerated) {
        throw new Error("글 생성에 실패하여 중단합니다.");
      }

      toast({ title: "원클릭 생성 완료!", description: "모든 과정이 성공적으로 완료되었습니다." });

    } catch (error) {
      if (error instanceof Error && error.message === "사용자에 의해 중단되었습니다.") {
        toast({
          title: "원클릭 생성 중단됨",
          description: "사용자 요청에 따라 생성을 중단했습니다.",
          variant: "warning",
        });
      } else {
        toast({
          title: "원클릭 생성 중단",
          description: error instanceof Error ? error.message : "자동 생성 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    } finally {
      setIsOneClickGenerating(false);
    }
  };

  const handleStopOneClick = () => {
    cancelGeneration.current = true;
  };

  const handleLatestIssueOneClick = () => runOneClickFlow('latest');
  const handleEvergreenKeywordOneClick = () => runOneClickFlow('evergreen');

  return { isOneClickGenerating, handleLatestIssueOneClick, handleEvergreenKeywordOneClick, handleStopOneClick };
};
