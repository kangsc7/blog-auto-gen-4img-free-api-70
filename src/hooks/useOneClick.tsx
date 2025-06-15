
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type GenerateTopicsFunc = (keyword: string) => Promise<string[] | null>;
type GenerateArticleFunc = (options?: { topic?: string; keyword?: string; }) => Promise<string | null>;

export const useOneClick = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void,
  generateTopics: GenerateTopicsFunc,
  selectTopic: (topic: string) => void,
  generateArticle: GenerateArticleFunc,
  profile: { id: string; } | null,
  preventDuplicates: boolean
) => {
  const { toast } = useToast();
  const [isOneClickGenerating, setIsOneClickGenerating] = useState(false);
  const cancelGeneration = useRef(false);

  const runOneClickFlow = async (keywordSource: 'latest' | 'evergreen') => {
    if (isOneClickGenerating) return;
    if (!profile) {
        toast({ title: "오류", description: "사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.", variant: "destructive" });
        return;
    }

    setIsOneClickGenerating(true);
    cancelGeneration.current = false;
    const userId = profile.id;

    try {
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
      if (!appState.isApiKeyValidated) {
        toast({ title: "API 키 검증 필요", description: "먼저 API 키를 입력하고 검증해주세요.", variant: "destructive" });
        return;
      }

      const keywordType = keywordSource === 'latest' ? '최신 트렌드' : '평생';
      let availableKeywords: { id: number; keyword_text: string; }[] | null = [];
      
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

      if (preventDuplicates) {
        toast({ title: `1단계: ${keywordType} 키워드 추출 (중복 제외)`, description: `데이터베이스에서 사용하지 않은 키워드를 가져옵니다...` });
        
        // Get used keyword IDs for the current user
        const { data: usedKeywordsData, error: usedKeywordsError } = await supabase
          .from('user_used_keywords')
          .select('keyword_id')
          .eq('user_id', userId);

        if (usedKeywordsError) throw new Error(`사용한 키워드 목록 조회 오류: ${usedKeywordsError.message}`);
        
        const usedKeywordIds = usedKeywordsData.map(row => row.keyword_id);

        // Get available keywords of the specified type that the user hasn't used
        let keywordQuery = supabase
          .from('keywords')
          .select('id, keyword_text')
          .eq('type', keywordSource);

        if (usedKeywordIds.length > 0) {
          keywordQuery = keywordQuery.not('id', 'in', `(${usedKeywordIds.join(',')})`);
        }

        let { data: fetchedKeywords, error: keywordsError } = await keywordQuery;
        if (keywordsError) throw new Error(`키워드 조회 오류: ${keywordsError.message}`);

        // If no keywords are available, reset the user's history for this type and try again
        if (fetchedKeywords.length === 0) {
          toast({ title: "키워드 목록 초기화", description: `모든 '${keywordType}' 키워드를 사용했습니다. 목록을 초기화합니다.` });
          
          const { data: allKeywordsOfType, error: allKeywordsError } = await supabase
              .from('keywords')
              .select('id')
              .eq('type', keywordSource);

          if (allKeywordsError) throw new Error(`키워드 목록 초기화 실패: ${allKeywordsError.message}`);

          if (allKeywordsOfType.length > 0) {
              const keywordIdsToDelete = allKeywordsOfType.map(k => k.id);
              const { error: deleteError } = await supabase
                  .from('user_used_keywords')
                  .delete()
                  .eq('user_id', userId)
                  .in('keyword_id', keywordIdsToDelete);

              if (deleteError) throw new Error(`키워드 사용 이력 초기화 실패: ${deleteError.message}`);
          }
          
          const { data: refetchedKeywords, error: refetchedError } = await supabase
              .from('keywords')
              .select('id, keyword_text')
              .eq('type', keywordSource);
          
          if (refetchedError) throw new Error(`초기화 후 키워드 조회 오류: ${refetchedError.message}`);
          availableKeywords = refetchedKeywords;
        } else {
          availableKeywords = fetchedKeywords;
        }
      } else {
        toast({ title: `1단계: ${keywordType} 키워드 추출`, description: `데이터베이스에서 키워드를 가져옵니다...` });
        const { data: allKeywords, error: keywordsError } = await supabase
          .from('keywords')
          .select('id, keyword_text')
          .eq('type', keywordSource);
        
        if (keywordsError) throw new Error(`키워드 조회 오류: ${keywordsError.message}`);
        availableKeywords = allKeywords;
      }
      
      if (!availableKeywords || availableKeywords.length === 0) {
        throw new Error(`데이터베이스에 '${keywordType}' 키워드가 없습니다. 관리자에게 문의하세요.`);
      }
      
      const selectedKeyword = availableKeywords[Math.floor(Math.random() * availableKeywords.length)];

      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
      
      // Record the usage in the database only if preventing duplicates
      if (preventDuplicates) {
        const { error: insertError } = await supabase
          .from('user_used_keywords')
          .insert({ user_id: userId, keyword_id: selectedKeyword.id });

        if (insertError) {
          console.error('키워드 사용 이력 저장 오류:', insertError);
          throw new Error('키워드 사용 이력을 저장하는데 실패했습니다. 다시 시도해주세요.');
        }
      }

      const keyword = selectedKeyword.keyword_text;
      saveAppState({ keyword });
      toast({ title: "키워드 자동 입력 완료", description: `'${keyword}' (으)로 주제 생성을 시작합니다.` });
      
      await sleep(1000);
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

      toast({ title: "2단계: AI 주제 생성 시작", description: "선택된 키워드로 블로그 주제를 생성합니다..." });
      const newTopics = await generateTopics(keyword);
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
      if (!newTopics || newTopics.length === 0) {
        throw new Error("주제 생성에 실패하여 중단합니다.");
      }

      await sleep(1000);
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

      toast({ title: "3단계: 주제 랜덤 선택", description: "생성된 주제 중 하나를 자동으로 선택합니다..." });
      const randomTopic = newTopics[Math.floor(Math.random() * newTopics.length)];
      selectTopic(randomTopic);

      await sleep(1000);
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

      toast({ title: "4단계: AI 글 생성 시작", description: "선택된 주제로 블로그 본문을 생성합니다..." });
      const articleGenerated = await generateArticle({ topic: randomTopic, keyword });
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
      if (!articleGenerated) {
        throw new Error("글 생성에 실패하여 중단합니다.");
      }

      toast({ title: "원클릭 생성 완료!", description: "모든 과정이 성공적으로 완료되었습니다." });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "자동 생성 중 알 수 없는 오류가 발생했습니다.";
      
      if (errorMessage === "사용자에 의해 중단되었습니다.") {
        toast({
          title: "원클릭 생성 중단됨",
          description: "사용자 요청에 따라 생성을 중단했습니다.",
          variant: "default",
        });
      } else {
        toast({
          title: "원클릭 생성 오류",
          description: errorMessage,
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
