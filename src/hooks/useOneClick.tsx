
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useKeywordGenerator } from './useKeywordGenerator';

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
  const { generateLatestKeyword, generateEvergreenKeyword } = useKeywordGenerator(appState);

  const isKeywordUsed = async (keyword: string, userId: string): Promise<boolean> => {
    const { data: keywordData, error: keywordError } = await supabase
        .from('keywords')
        .select('id')
        .eq('keyword_text', keyword)
        .maybeSingle();
    
    if (keywordError) {
        console.error("Error checking for existing keyword:", keywordError);
        return false;
    }

    if (!keywordData) return false;

    const { data: usageData, error: usageError } = await supabase
        .from('user_used_keywords')
        .select('id')
        .eq('user_id', userId)
        .eq('keyword_id', keywordData.id)
        .maybeSingle();

    if (usageError) {
        console.error("Error checking keyword usage:", usageError);
        return false;
    }

    return !!usageData;
  };
  
  const recordKeywordUsage = async (keyword: string, userId: string, type: 'latest' | 'evergreen'): Promise<void> => {
    let { data: keywordData, error: findError } = await supabase
        .from('keywords')
        .select('id')
        .eq('keyword_text', keyword)
        .maybeSingle();

    if (findError) throw new Error(`키워드 조회 오류: ${findError.message}`);

    let keywordId;
    if (keywordData) {
        keywordId = keywordData.id;
    } else {
        const { data: newKeywordData, error: insertKeywordError } = await supabase
            .from('keywords')
            .insert({ keyword_text: keyword, type: type })
            .select('id')
            .single();
        
        if (insertKeywordError) throw new Error(`새로운 키워드 저장 오류: ${insertKeywordError.message}`);
        keywordId = newKeywordData.id;
    }
    
    const { data: existingUsage, error: checkUsageError } = await supabase
        .from('user_used_keywords')
        .select('id')
        .eq('user_id', userId)
        .eq('keyword_id', keywordId)
        .maybeSingle();
        
    if (checkUsageError) throw new Error(`키워드 사용 이력 확인 오류: ${checkUsageError.message}`);

    if (!existingUsage) {
        const { error: insertUsageError } = await supabase
            .from('user_used_keywords')
            .insert({ user_id: userId, keyword_id: keywordId });
        
        if (insertUsageError) throw new Error(`키워드 사용 이력 저장 오류: ${insertUsageError.message}`);
    }
  };

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
      
      let keyword: string | null = null;
      const keywordType = keywordSource === 'latest' ? '최신 트렌드' : '틈새';

      if (keywordSource === 'latest') {
        toast({ title: `1단계: AI ${keywordType} 키워드 생성`, description: `Gemini AI가 키워드를 생성합니다...` });
        let attempt = 0;
        const maxAttempts = 3;
        while(attempt < maxAttempts && !keyword) {
            if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
            const generatedKeyword = await generateLatestKeyword();
            if (generatedKeyword) {
                const used = preventDuplicates ? await isKeywordUsed(generatedKeyword, userId) : false;
                if (!used) {
                    keyword = generatedKeyword;
                } else {
                    toast({ title: "중복 키워드 발생", description: `'${generatedKeyword}' (은)는 이미 사용된 키워드입니다. 새로운 키워드를 다시 생성합니다. (시도 ${attempt + 1}/${maxAttempts})`});
                    await sleep(500);
                }
            } else {
                await sleep(500);
            }
            attempt++;
        }
        if (!keyword) throw new Error("AI가 고유한 최신 트렌드 키워드를 생성하는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
      
      } else {
        toast({ title: `1단계: AI ${keywordType} 키워드 생성`, description: `Gemini AI가 키워드를 생성합니다...` });
        let attempt = 0;
        const maxAttempts = 2;
        while(attempt < maxAttempts && !keyword) {
            if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
            const generatedKeyword = await generateEvergreenKeyword();
            if (generatedKeyword) {
                const used = preventDuplicates ? await isKeywordUsed(generatedKeyword, userId) : false;
                if (!used) {
                    keyword = generatedKeyword;
                } else {
                    toast({ title: "중복 키워드 발생", description: `AI가 생성한 '${generatedKeyword}' (은)는 이미 사용된 키워드입니다. (시도 ${attempt + 1}/${maxAttempts})`});
                    await sleep(500);
                }
            } else {
                await sleep(500);
            }
            attempt++;
        }

        if (!keyword) {
            toast({ title: "AI 키워드 중복/실패", description: "대체 옵션으로 데이터베이스에서 평생 키워드를 가져옵니다." });
            if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

            const { data: usedKeywordsData, error: usedKeywordsError } = await supabase
                .from('user_used_keywords')
                .select('keyword_id')
                .eq('user_id', userId);

            if (usedKeywordsError) throw new Error(`사용한 키워드 목록 조회 오류: ${usedKeywordsError.message}`);
            const usedKeywordIds = usedKeywordsData.map(row => row.keyword_id);

            let keywordQuery = supabase
                .from('keywords')
                .select('keyword_text, id')
                .eq('type', 'evergreen');

            if (usedKeywordIds.length > 0 && preventDuplicates) {
                 keywordQuery = keywordQuery.not('id', 'in', `(${usedKeywordIds.join(',')})`);
            }

            let { data: availableKeywords, error: keywordsError } = await keywordQuery;
            if (keywordsError) throw new Error(`DB 키워드 조회 오류: ${keywordsError.message}`);
            
            if (!availableKeywords || availableKeywords.length === 0) {
                 toast({ title: "키워드 목록 초기화", description: `모든 '평생' 키워드를 사용했습니다. 목록을 초기화합니다.` });
                 const { data: allKeywordsOfType, error: allKeywordsError } = await supabase
                    .from('keywords')
                    .select('id')
                    .eq('type', 'evergreen');

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
                const { data: refetchedKeywords, error: refetchedError } = await supabase.from('keywords').select('keyword_text, id').eq('type', 'evergreen');
                if (refetchedError) throw new Error(`초기화 후 키워드 조회 오류: ${refetchedError.message}`);
                availableKeywords = refetchedKeywords;
            }

            if (!availableKeywords || availableKeywords.length === 0) {
              throw new Error("데이터베이스에 사용 가능한 평생 키워드가 없습니다.");
            }
            
            const selectedKeyword = availableKeywords[Math.floor(Math.random() * availableKeywords.length)];
            keyword = selectedKeyword.keyword_text;
        }
      }

      if (!keyword) {
          throw new Error(`키워드를 생성하거나 선택하는데 실패했습니다.`);
      }
      
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
      
      if (preventDuplicates) {
        await recordKeywordUsage(keyword, userId, keywordSource);
      }

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
