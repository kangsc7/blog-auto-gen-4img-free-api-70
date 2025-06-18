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
  const [showTopicSelectionDialog, setShowTopicSelectionDialog] = useState(false);
  const [showDuplicateErrorDialog, setShowDuplicateErrorDialog] = useState(false);
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

  const runLatestIssueFlow = async () => {
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

    try {
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
      if (!appState.isApiKeyValidated) {
        toast({ title: "API 키 검증 필요", description: "먼저 API 키를 입력하고 검증해주세요.", variant: "destructive" });
        return;
      }
      
      let keyword: string | null = null;
      let allKeywordsUsed = false;

      console.log(`최신 트렌드 키워드 생성 시작 - 중복 방지 설정:`, preventDuplicates);

      // 1단계: 키워드 생성 (재시도 로직 강화)
      toast({ title: `1단계: 최신 트렌드 키워드 생성`, description: `다양한 소스에서 최신 트렌드 키워드를 생성합니다...` });
      
      let keywordAttempts = 0;
      const maxKeywordAttempts = 8;
      
      while (keywordAttempts < maxKeywordAttempts && !keyword) {
        if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
        
        try {
          keyword = await generateLatestKeyword();
          
          if (keyword && preventDuplicates) {
            const isUsed = await isKeywordUsed(keyword, userId);
            if (isUsed) {
              console.log(`키워드 중복 감지: ${keyword}, 재생성 중... (${keywordAttempts + 1}/${maxKeywordAttempts})`);
              keyword = null;
              toast({ 
                title: "키워드 중복 감지", 
                description: `다른 최신 트렌드 키워드를 생성합니다... (${keywordAttempts + 1}/${maxKeywordAttempts})` 
              });
            }
          }
          
          keywordAttempts++;
          if (!keyword && keywordAttempts < maxKeywordAttempts) {
            await sleep(3000); // 3초 딜레이 추가
          }
        } catch (error) {
          console.error(`키워드 생성 시도 ${keywordAttempts + 1} 실패:`, error);
          keywordAttempts++;
          if (keywordAttempts < maxKeywordAttempts) {
            await sleep(3000); // 3초 딜레이 추가
          }
        }
      }

      if (!keyword && keywordAttempts >= maxKeywordAttempts && preventDuplicates) {
        allKeywordsUsed = true;
      }

      // 백업 키워드 로직 강화
      if (!keyword) {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const backupKeywords = [
          `${currentYear}년 ${currentMonth}월 생활 트렌드`,
          `${currentYear}년 디지털 생활 팁`,
          `${currentYear}년 건강한 라이프스타일`,
          `${currentMonth}월 실용 정보`,
          `최신 생활 개선 방법`,
          `현재 주목받는 생활 정보`
        ];
        keyword = backupKeywords[Math.floor(Math.random() * backupKeywords.length)];
        toast({ 
          title: "백업 키워드 사용", 
          description: `"${keyword}" - 안전한 최신 트렌드 키워드로 진행합니다.` 
        });
      }

      // 키워드 사용 기록
      if (preventDuplicates) {
        await recordKeywordUsage(keyword, userId, 'latest');
      }

      console.log('최종 선택된 키워드:', keyword);
      saveAppState({ keyword });
      toast({ title: "키워드 설정 완료", description: `'${keyword}' 키워드로 주제 생성을 시작합니다.` });
      
      await sleep(2000);
      if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

      // 2단계: 주제 생성 (재시도 로직 강화)
      toast({ title: "2단계: AI 주제 생성", description: "선택된 키워드로 다양한 블로그 주제를 생성합니다..." });
      
      let topics: string[] | null = null;
      let topicAttempts = 0;
      const maxTopicAttempts = 5;
      let allTopicsDuplicated = false;
      
      while (topicAttempts < maxTopicAttempts && (!topics || topics.length === 0)) {
        if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
        
        try {
          console.log(`주제 생성 시도 ${topicAttempts + 1} - 키워드:`, keyword);
          
          // 중복 방지 설정을 일시적으로 비활성화하여 주제 생성 시도
          if (topicAttempts >= 2 && preventDuplicates) {
            console.log('주제 생성 실패로 인해 일시적으로 중복 검사 완화');
            const originalPreventDuplicates = appState.preventDuplicates;
            saveAppState({ preventDuplicates: false });
            topics = await generateTopics(keyword);
            saveAppState({ preventDuplicates: originalPreventDuplicates });
          } else {
            topics = await generateTopics(keyword);
          }
          
          console.log(`생성된 주제들 (시도 ${topicAttempts + 1}):`, topics);
          
          // 중복 검사 실시
          if (topics && topics.length > 0 && preventDuplicates) {
            const originalLength = topics.length;
            const filteredTopics = [];
            
            for (const topic of topics) {
              const isUsed = await isTopicUsed(topic, userId);
              if (!isUsed) {
                filteredTopics.push(topic);
              }
            }
            
            if (filteredTopics.length === 0 && originalLength > 0) {
              allTopicsDuplicated = true;
              console.log('모든 주제가 중복됨 - 중복 검사 실패');
              break;
            }
            
            topics = filteredTopics;
          }
          
          if (!topics || topics.length === 0) {
            toast({ 
              title: "주제 생성 재시도", 
              description: `주제 생성을 다시 시도합니다... (${topicAttempts + 1}/${maxTopicAttempts})` 
            });
          }
          
          topicAttempts++;
          if ((!topics || topics.length === 0) && topicAttempts < maxTopicAttempts) {
            await sleep(3000); // 3초 딜레이 추가
          }
        } catch (error) {
          console.error(`주제 생성 시도 ${topicAttempts + 1} 실패:`, error);
          topicAttempts++;
          if (topicAttempts < maxTopicAttempts) {
            await sleep(3000); // 3초 딜레이 추가
          }
        }
      }

      // 중복으로 인한 실패 감지
      if ((allKeywordsUsed || allTopicsDuplicated || (!topics || topics.length === 0)) && preventDuplicates) {
        setShowDuplicateErrorDialog(true);
        return;
      }

      if (!topics || topics.length === 0) {
        throw new Error(`${maxTopicAttempts}번 시도했지만 주제 생성에 실패했습니다. 다른 키워드로 시도하거나 잠시 후 다시 시도해주세요.`);
      }

      // 주제 생성 완료 후 팝업 표시
      setShowTopicSelectionDialog(true);
      
      toast({ 
        title: "주제 생성 완료!", 
        description: `${topics.length}개의 주제가 생성되었습니다. 원하는 주제를 선택해주세요.`
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "자동 생성 중 알 수 없는 오류가 발생했습니다.";
      
      if (errorMessage === "사용자에 의해 중단되었습니다.") {
        toast({
          title: "최신 이슈 생성 중단됨",
          description: "사용자 요청에 따라 생성을 중단했습니다.",
          variant: "default",
        });
      } else {
        console.error('최신 이슈 생성 상세 오류:', error);
        toast({
          title: "최신 이슈 생성 실패",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsOneClickGenerating(false);
    }
  };

  const runEvergreenFlow = async () => {
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
    const maxRetries = 3;

    const attemptGeneration = async (): Promise<boolean> => {
      try {
        if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
        if (!appState.isApiKeyValidated) {
          toast({ title: "API 키 검증 필요", description: "먼저 API 키를 입력하고 검증해주세요.", variant: "destructive" });
          return false;
        }
        
        let keyword: string | null = null;

        console.log(`평생 가치 키워드 생성 시작 - 중복 방지 설정:`, preventDuplicates);

        // 1단계: 키워드 생성
        toast({ title: `1단계: 평생 가치 키워드 생성`, description: `다양한 소스에서 평생 가치 키워드를 생성합니다...` });
        
        let keywordAttempts = 0;
        const maxKeywordAttempts = 5;
        
        while (keywordAttempts < maxKeywordAttempts && !keyword) {
          if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
          
          try {
            keyword = await generateEvergreenKeyword();
            
            if (keyword && preventDuplicates) {
              const isUsed = await isKeywordUsed(keyword, userId);
              if (isUsed) {
                console.log(`키워드 중복 감지: ${keyword}, 재생성 중... (${keywordAttempts + 1}/${maxKeywordAttempts})`);
                keyword = null;
                toast({ 
                  title: "키워드 중복 감지", 
                  description: `다른 평생 가치 키워드를 생성합니다... (${keywordAttempts + 1}/${maxKeywordAttempts})` 
                });
              }
            }
            
            keywordAttempts++;
            if (!keyword && keywordAttempts < maxKeywordAttempts) {
              await sleep(3000); // 3초 딜레이 추가
            }
          } catch (error) {
            console.error(`키워드 생성 시도 ${keywordAttempts + 1} 실패:`, error);
            keywordAttempts++;
            if (keywordAttempts < maxKeywordAttempts) {
              await sleep(3000); // 3초 딜레이 추가
            }
          }
        }

        if (!keyword) {
          const backupKeywords = ['생활 효율 개선법', '기본 생활 관리법', '실용적 생활 정보'];
          keyword = backupKeywords[Math.floor(Math.random() * backupKeywords.length)];
          toast({ 
            title: "백업 키워드 사용", 
            description: `"${keyword}" - 안전한 평생 가치 키워드로 진행합니다.` 
          });
        }

        // 키워드 사용 기록
        if (preventDuplicates) {
          await recordKeywordUsage(keyword, userId, 'evergreen');
        }

        console.log('최종 선택된 키워드:', keyword);
        saveAppState({ keyword });
        toast({ title: "키워드 설정 완료", description: `'${keyword}' 키워드로 주제 생성을 시작합니다.` });
        
        await sleep(2000);
        if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

        // 2단계: 주제 생성
        toast({ title: "2단계: AI 주제 생성", description: "선택된 키워드로 다양한 블로그 주제를 생성합니다..." });
        
        let topics: string[] | null = null;
        let topicAttempts = 0;
        const maxTopicAttempts = 3;
        
        while (topicAttempts < maxTopicAttempts && (!topics || topics.length === 0)) {
          if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
          
          try {
            console.log(`주제 생성 시도 ${topicAttempts + 1} - 키워드:`, keyword);
            topics = await generateTopics(keyword);
            console.log(`생성된 주제들 (시도 ${topicAttempts + 1}):`, topics);
            
            if (!topics || topics.length === 0) {
              toast({ 
                title: "주제 생성 재시도", 
                description: `주제 생성을 다시 시도합니다... (${topicAttempts + 1}/${maxTopicAttempts})` 
              });
            }
            
            topicAttempts++;
            if ((!topics || topics.length === 0) && topicAttempts < maxTopicAttempts) {
              await sleep(3000); // 3초 딜레이 추가
            }
          } catch (error) {
            console.error(`주제 생성 시도 ${topicAttempts + 1} 실패:`, error);
            topicAttempts++;
            if (topicAttempts < maxTopicAttempts) {
              await sleep(3000); // 3초 딜레이 추가
            }
          }
        }

        if (!topics || topics.length === 0) {
          throw new Error("여러 번 시도했지만 주제 생성에 실패했습니다.");
        }

        await sleep(2000);
        if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

        // 3단계: 주제 자동 선택 (중요한 개선사항!)
        let selectedTopic: string | null = null;
        
        console.log('평생키워드 원클릭: 주제 자동 선택 로직 시작');
        toast({ title: "3단계: 최적 주제 자동 선택", description: "생성된 주제 중 가장 적합한 주제를 자동으로 선택합니다..." });
        
        if (preventDuplicates) {
          const availableTopics = [];
          for (const topic of topics) {
            const isUsed = await isTopicUsed(topic, userId);
            if (!isUsed) {
              availableTopics.push(topic);
            }
          }
          
          if (availableTopics.length === 0) {
            console.log('모든 주제가 중복됨 - 첫 번째 주제 강제 선택');
            toast({ 
              title: "주제 중복 감지", 
              description: "생성된 모든 주제가 이미 사용되었지만 첫 번째 주제로 진행합니다." 
            });
            selectedTopic = topics[0];
          } else {
            selectedTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
            console.log('중복되지 않은 주제 자동 선택:', selectedTopic);
          }
        } else {
          selectedTopic = topics[Math.floor(Math.random() * topics.length)];
          console.log('랜덤 주제 자동 선택:', selectedTopic);
        }

        console.log('평생키워드 원클릭: 최종 선택된 주제:', selectedTopic);
        toast({ title: "주제 자동 선택 완료", description: `"${selectedTopic}"을(를) 자동으로 선택했습니다.` });
        
        // 주제를 appState에 저장하고 UI에 반영
        saveAppState({ selectedTopic });
        
        // 주제 사용 기록
        if (preventDuplicates) {
          await recordTopicUsage(selectedTopic, userId);
        }

        await sleep(2000);
        if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");

        // 4단계: 글 생성 (주제가 확실히 선택된 상태에서 진행)
        toast({ title: "4단계: AI 블로그 글 생성", description: "자동 선택된 주제로 고품질 블로그 글을 생성합니다..." });
        
        let articleGenerated = false;
        let articleAttempts = 0;
        const maxArticleAttempts = 3;
        
        while (articleAttempts < maxArticleAttempts && !articleGenerated) {
          if (cancelGeneration.current) throw new Error("사용자에 의해 중단되었습니다.");
          
          try {
            console.log(`글 생성 시도 ${articleAttempts + 1} - 주제:`, selectedTopic, '키워드:', keyword);
            const result = await generateArticle({ topic: selectedTopic, keyword });
            
            if (result) {
              articleGenerated = true;
              console.log(`평생키워드 원클릭: 글 생성 성공 (시도 ${articleAttempts + 1})`);
              toast({ 
                title: "블로그 글 생성 완료!", 
                description: `"${selectedTopic}" 주제의 고품질 블로그 글이 완성되었습니다.` 
              });
            } else {
              console.log(`글 생성 실패 (시도 ${articleAttempts + 1}) - 재시도 중...`);
              toast({ 
                title: "글 생성 재시도", 
                description: `글 생성을 다시 시도합니다... (${articleAttempts + 1}/${maxArticleAttempts})` 
              });
            }
            
            articleAttempts++;
            if (!articleGenerated && articleAttempts < maxArticleAttempts) {
              await sleep(3000); // 3초 딜레이 추가
            }
          } catch (error) {
            console.error(`글 생성 시도 ${articleAttempts + 1} 실패:`, error);
            articleAttempts++;
            if (articleAttempts < maxArticleAttempts) {
              await sleep(3000); // 3초 딜레이 추가
            }
          }
        }

        if (!articleGenerated) {
          throw new Error("여러 번 시도했지만 글 생성에 실패했습니다.");
        }

        toast({ 
          title: "🎉 원클릭 생성 완료!", 
          description: `평생 가치 키워드 기반 모든 과정이 성공적으로 완료되었습니다.` 
        });
        
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

        // 재시도 로직
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`평생키워드 원클릭 재시도 ${retryCount}/${maxRetries} - 오류:`, errorMessage);
          toast({
            title: `자동 재시도 중 (${retryCount}/${maxRetries})`,
            description: `생성에 실패했습니다. 자동으로 다시 시도합니다...`,
            variant: "default"
          });
          await sleep(3000); // 3초 딜레이 추가
          return await attemptGeneration();
        }

        console.error('평생키워드 원클릭 최종 실패:', error);
        toast({
          title: "원클릭 생성 최종 실패",
          description: `${maxRetries}번 시도했지만 실패했습니다: ${errorMessage}`,
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
    toast({
      title: "생성 중단 요청",
      description: "현재 진행 중인 작업을 중단하고 있습니다...",
      variant: "default"
    });
  };

  return { 
    isOneClickGenerating, 
    handleLatestIssueOneClick: runLatestIssueFlow, 
    handleEvergreenKeywordOneClick: runEvergreenFlow, 
    handleStopOneClick,
    showTopicSelectionDialog,
    setShowTopicSelectionDialog,
    showDuplicateErrorDialog,
    setShowDuplicateErrorDialog
  };
};
