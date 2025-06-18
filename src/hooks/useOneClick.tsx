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
  preventDuplicates: boolean,
  canUseFeatures: boolean
) => {
  const { toast } = useToast();
  const [isOneClickGenerating, setIsOneClickGenerating] = useState(false);
  const cancelGeneration = useRef(false);
  const { generateLatestKeyword, generateEvergreenKeyword } = useKeywordGenerator(appState);

  const getUserUsedKeywords = async (userId: string): Promise<string[]> => {
    if (!preventDuplicates) {
      console.log('중복 허용 모드: 사용한 키워드 체크 건너뛰기');
      return [];
    }
    
    try {
      const { data: usedKeywordsData, error } = await supabase
        .from('user_used_keywords')
        .select(`
          keywords (
            keyword_text
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('사용한 키워드 조회 오류:', error);
        return [];
      }

      return usedKeywordsData?.map((item: any) => item.keywords?.keyword_text).filter(Boolean) || [];
    } catch (error) {
      console.error('키워드 조회 중 오류:', error);
      return [];
    }
  };

  const isKeywordUsed = async (keyword: string, userId: string): Promise<boolean> => {
    if (!preventDuplicates) {
      console.log('중복 허용 모드: 키워드 중복 체크 건너뛰기');
      return false;
    }

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

  const isTopicUsed = async (topic: string, userId: string): Promise<boolean> => {
    if (!preventDuplicates) {
      console.log('중복 허용 모드: 주제 중복 체크 건너뛰기');
      return false;
    }
    
    const userTopicsKey = `blog_user_topics_${userId}`;
    const savedTopics = localStorage.getItem(userTopicsKey);
    
    if (savedTopics) {
      const topicsList = JSON.parse(savedTopics);
      const normalizedTopic = topic.replace(/\s/g, '').toLowerCase();
      return topicsList.some((savedTopic: string) => 
        savedTopic.replace(/\s/g, '').toLowerCase() === normalizedTopic
      );
    }
    
    return false;
  };

  const recordTopicUsage = async (topic: string, userId: string): Promise<void> => {
    if (!preventDuplicates) {
      console.log('중복 허용 모드: 주제 사용 기록 건너뛰기');
      return;
    }
    
    const userTopicsKey = `blog_user_topics_${userId}`;
    const savedTopics = localStorage.getItem(userTopicsKey);
    let topicsList = savedTopics ? JSON.parse(savedTopics) : [];
    
    if (!topicsList.includes(topic)) {
      topicsList.push(topic);
      if (topicsList.length > 1000) {
        topicsList = topicsList.slice(-1000);
      }
      localStorage.setItem(userTopicsKey, JSON.stringify(topicsList));
    }
  };
  
  const recordKeywordUsage = async (keyword: string, userId: string, type: 'latest' | 'evergreen'): Promise<void> => {
    if (!preventDuplicates) {
      console.log('중복 허용 모드: 키워드 사용 기록 건너뛰기');
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('키워드 사용 기록 중 오류:', error);
    }
  };

  const runOneClickFlow = async (keywordSource: 'latest' | 'evergreen') => {
    if (!canUseFeatures) {
      toast({
        title: "접근 제한",
        description: "이 기능을 사용할 권한이 없습니다.",
        variant: "destructive"
      });
      return;
    }

    if (isOneClickGenerating) return;
    if (!profile) {
        toast({ title: "오류", description: "사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.", variant: "destructive" });
        return;
    }

    setIsOneClickGenerating(true);
    cancelGeneration.current = false;
    const userId = profile.id;
    let retryCount = 0;
    const maxRetries = 1; // 한 번 더 재시도

    const attemptGeneration = async (): Promise<boolean> => {
      try {
        if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
        if (!appState.isApiKeyValidated) {
          toast({ title: "API 키 검증 필요", description: "먼저 API 키를 입력하고 검증해주세요.", variant: "destructive" });
          return false;
        }
        
        let keyword: string | null = null;
        const keywordType = keywordSource === 'latest' ? '최신 트렌드' : '틈새';

        console.log(`${keywordType} 키워드 생성 시작 - 중복 방지 설정:`, preventDuplicates);

        // 사용자가 이미 사용한 키워드 목록 가져오기 (중복 금지일 때만)
        const usedKeywords = await getUserUsedKeywords(userId);
        console.log(`${keywordType} 키워드 생성 - 사용된 키워드:`, usedKeywords);

        if (keywordSource === 'latest') {
          toast({ title: `1단계: 실시간 ${keywordType} 키워드 생성`, description: `Google Trends 데이터를 분석합니다...` });
          let attempt = 0;
          const maxAttempts = preventDuplicates ? 3 : 1;
          
          while(attempt < maxAttempts && !keyword) {
              if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
              const generatedKeyword = await generateLatestKeyword();
              if (generatedKeyword) {
                  const used = preventDuplicates ? await isKeywordUsed(generatedKeyword, userId) : false;
                  if (!used) {
                      keyword = generatedKeyword;
                      toast({ title: "트렌드 키워드 생성 완료", description: `"${keyword}" - 실시간 트렌드 반영됨` });
                  } else {
                      toast({ title: "중복 키워드 발생", description: `'${generatedKeyword}' 재생성 중... (${attempt + 1}/${maxAttempts})`});
                      await sleep(500);
                  }
              } else {
                  await sleep(500);
              }
              attempt++;
          }
          
          if (!keyword) {
            if (!preventDuplicates) {
              const retryKeyword = await generateLatestKeyword();
              keyword = retryKeyword || '2025년 생활 꿀팁';
            } else {
              throw new Error("실시간 트렌드 키워드 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
          }
        
        } else {
          toast({ title: `1단계: 검증된 ${keywordType} 키워드 선택`, description: `데이터베이스에서 최적 키워드를 선택합니다...` });
          let attempt = 0;
          const maxAttempts = preventDuplicates ? 3 : 1;
          
          while(attempt < maxAttempts && !keyword) {
              if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
              const generatedKeyword = await generateEvergreenKeyword();
              if (generatedKeyword) {
                  const used = preventDuplicates ? await isKeywordUsed(generatedKeyword, userId) : false;
                  if (!used) {
                      keyword = generatedKeyword;
                      toast({ title: "틈새 키워드 선택 완료", description: `"${keyword}" - 검증된 평생 키워드` });
                  } else {
                      toast({ title: "중복 키워드 발생", description: `'${generatedKeyword}' 다른 키워드 선택 중... (${attempt + 1}/${maxAttempts})`});
                      await sleep(500);
                  }
              } else {
                  await sleep(500);
              }
              attempt++;
          }

          if (!keyword && preventDuplicates) {
            toast({ title: "AI 키워드 중복/실패", description: "데이터베이스에서 직접 선택합니다." });
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

            if (usedKeywordIds.length > 0) {
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
          } else if (!keyword) {
            // 중복 허용일 때는 간단히 재시도하거나 기본값 사용
            const retryKeyword = await generateEvergreenKeyword();
            keyword = retryKeyword || '생활 절약 꿀팁';
          }
        }

        if (!keyword) {
            throw new Error(`${keywordType} 키워드를 생성하거나 선택하는데 실패했습니다.`);
        }
        
        if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
        
        await recordKeywordUsage(keyword, userId, keywordSource);

        console.log('키워드 설정:', keyword);
        saveAppState({ keyword });
        toast({ title: "키워드 자동 입력 완료", description: `'${keyword}' (으)로 주제 생성을 시작합니다.` });
        
        await sleep(1500);
        if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

        toast({ title: "2단계: AI 주제 생성 시작", description: "선택된 키워드로 블로그 주제를 생성합니다..." });
        console.log('주제 생성 호출 - 키워드:', keyword);
        const newTopics = await generateTopics(keyword);
        console.log('생성된 주제들:', newTopics);
        if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
        if (!newTopics || newTopics.length === 0) {
          throw new Error("주제 생성에 실패하여 중단합니다.");
        }

        await sleep(2000);
        if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

        let selectedTopic: string | null = null;
        if (preventDuplicates) {
          const availableTopics = [];
          for (const topic of newTopics) {
            const isUsed = await isTopicUsed(topic, userId);
            if (!isUsed) {
              availableTopics.push(topic);
            }
          }
          
          if (availableTopics.length === 0) {
            toast({ title: "주제 중복 경고", description: "생성된 모든 주제가 이미 사용되었습니다. 첫 번째 주제를 선택합니다." });
            selectedTopic = newTopics[0];
          } else {
            selectedTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
          }
        } else {
          selectedTopic = newTopics[Math.floor(Math.random() * newTopics.length)];
        }

        console.log('선택된 주제:', selectedTopic);
        toast({ title: "3단계: 주제 선택", description: `"${selectedTopic}"을(를) 자동으로 선택했습니다.` });
        selectTopic(selectedTopic);

        if (preventDuplicates) {
          await recordTopicUsage(selectedTopic, userId);
        }

        await sleep(2000);
        if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

        toast({ title: "4단계: AI 글 생성 시작", description: "선택된 주제로 블로그 본문을 생성합니다..." });
        const articleGenerated = await generateArticle({ topic: selectedTopic, keyword });
        if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
        if (!articleGenerated) {
          throw new Error("글 생성에 실패하여 중단합니다.");
        }

        toast({ title: "원클릭 생성 완료!", description: `${keywordType} 키워드 기반 모든 과정이 성공적으로 완료되었습니다.` });
        return true;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "자동 생성 중 알 수 없는 오류가 발생했습니다.";
        
        if (errorMessage === "사용자에 의해 중단되었습니다.") {
          toast({
            title: "원클릭 생성 중단됨",
            description: "사용자 요청에 따라 생성을 중단했습니다.",
            variant: "default",
          });
          return false;
        }

        // 주제 중복이나 글 생성 실패시 재시도
        if ((errorMessage.includes("주제") || errorMessage.includes("글 생성")) && retryCount < maxRetries) {
          retryCount++;
          toast({
            title: "자동 재시도 중",
            description: `생성에 실패했습니다. 자동으로 다시 시도합니다... (${retryCount}/${maxRetries + 1})`,
            variant: "default"
          });
          await sleep(2000);
          return await attemptGeneration();
        }

        toast({
          title: "원클릭 생성 오류",
          description: errorMessage,
          variant: "destructive"
        });
        return false;
      }
    };

    try {
      await attemptGeneration();
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
