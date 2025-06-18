
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useKeywordGenerator } from './useKeywordGenerator';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type GenerateTopicsFunc = (keyword: string) => Promise<string[] | null>;
type GenerateArticleFunc = (options?: { topic?: string; keyword?: string; }) => Promise<string | null>;

// 에러 타입 정의
type OneClickError = 
  | 'ACCESS_DENIED'
  | 'NO_PROFILE'
  | 'API_KEY_MISSING'
  | 'KEYWORD_GENERATION_FAILED'
  | 'KEYWORD_DUPLICATE_EXHAUSTED'
  | 'TOPIC_GENERATION_FAILED'
  | 'TOPIC_DUPLICATE_EXHAUSTED'
  | 'ARTICLE_GENERATION_FAILED'
  | 'DATABASE_ERROR'
  | 'USER_CANCELLED';

interface OneClickDetailedError {
  type: OneClickError;
  message: string;
  details?: string;
}

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

  const createOneClickError = (type: OneClickError, message: string, details?: string): OneClickDetailedError => {
    return { type, message, details };
  };

  const getOneClickErrorMessage = (error: OneClickDetailedError): { title: string; description: string } => {
    switch (error.type) {
      case 'ACCESS_DENIED':
        return {
          title: '🚫 접근 제한',
          description: '이 기능을 사용할 권한이 없습니다. 관리자에게 문의하세요.'
        };
      case 'NO_PROFILE':
        return {
          title: '👤 프로필 오류',
          description: '사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.'
        };
      case 'API_KEY_MISSING':
        return {
          title: '🔑 API 키 필요',
          description: 'API 키를 입력하고 검증해주세요.'
        };
      case 'KEYWORD_GENERATION_FAILED':
        return {
          title: '🔍 키워드 생성 실패',
          description: '키워드 생성에 실패했습니다. 잠시 후 다시 시도해주세요.'
        };
      case 'KEYWORD_DUPLICATE_EXHAUSTED':
        return {
          title: '🔄 키워드 중복 초과',
          description: '사용 가능한 새 키워드가 없습니다. 중복 허용 모드로 변경하거나 잠시 후 시도해주세요.'
        };
      case 'TOPIC_GENERATION_FAILED':
        return {
          title: '📝 주제 생성 실패',
          description: '주제 생성에 실패했습니다. 키워드를 변경하거나 잠시 후 다시 시도해주세요.'
        };
      case 'TOPIC_DUPLICATE_EXHAUSTED':
        return {
          title: '🔄 주제 중복으로 중단',
          description: '생성된 모든 주제가 이미 사용되었습니다. 중복 허용 모드로 변경하거나 다른 키워드를 시도해주세요.'
        };
      case 'ARTICLE_GENERATION_FAILED':
        return {
          title: '📄 글 생성 실패',
          description: '블로그 글 생성에 실패했습니다. API 상태를 확인하고 다시 시도해주세요.'
        };
      case 'DATABASE_ERROR':
        return {
          title: '💾 데이터베이스 오류',
          description: '데이터베이스 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.'
        };
      case 'USER_CANCELLED':
        return {
          title: '⏹️ 사용자 중단',
          description: '사용자 요청에 따라 생성을 중단했습니다.'
        };
      default:
        return {
          title: '❓ 알 수 없는 오류',
          description: '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.'
        };
    }
  };

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
        throw createOneClickError('DATABASE_ERROR', '키워드 조회 실패', error.message);
      }

      return usedKeywordsData?.map((item: any) => item.keywords?.keyword_text).filter(Boolean) || [];
    } catch (error: any) {
      console.error('키워드 조회 중 오류:', error);
      if (error.type) throw error;
      throw createOneClickError('DATABASE_ERROR', '키워드 데이터 조회 실패', error.message);
    }
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

      if (findError) {
        throw createOneClickError('DATABASE_ERROR', '키워드 조회 실패', findError.message);
      }

      let keywordId;
      if (keywordData) {
          keywordId = keywordData.id;
      } else {
          const { data: newKeywordData, error: insertKeywordError } = await supabase
              .from('keywords')
              .insert({ keyword_text: keyword, type: type })
              .select('id')
              .single();
          
          if (insertKeywordError) {
            throw createOneClickError('DATABASE_ERROR', '새 키워드 저장 실패', insertKeywordError.message);
          }
          keywordId = newKeywordData.id;
      }
      
      const { data: existingUsage, error: checkUsageError } = await supabase
          .from('user_used_keywords')
          .select('id')
          .eq('user_id', userId)
          .eq('keyword_id', keywordId)
          .maybeSingle();
          
      if (checkUsageError) {
        throw createOneClickError('DATABASE_ERROR', '키워드 사용 이력 확인 실패', checkUsageError.message);
      }

      if (!existingUsage) {
          const { error: insertUsageError } = await supabase
              .from('user_used_keywords')
              .insert({ user_id: userId, keyword_id: keywordId });
          
          if (insertUsageError) {
            throw createOneClickError('DATABASE_ERROR', '키워드 사용 이력 저장 실패', insertUsageError.message);
          }
      }
    } catch (error: any) {
      console.error('키워드 사용 기록 중 오류:', error);
      if (error.type) throw error;
      throw createOneClickError('DATABASE_ERROR', '키워드 기록 처리 실패', error.message);
    }
  };

  const runOneClickFlow = async (keywordSource: 'latest' | 'evergreen') => {
    if (!canUseFeatures) {
      const error = createOneClickError('ACCESS_DENIED', '접근 권한 없음');
      const errorMsg = getOneClickErrorMessage(error);
      toast({
        title: errorMsg.title,
        description: errorMsg.description,
        variant: "destructive"
      });
      return;
    }

    if (isOneClickGenerating) return;
    
    if (!profile) {
      const error = createOneClickError('NO_PROFILE', '프로필 정보 없음');
      const errorMsg = getOneClickErrorMessage(error);
      toast({
        title: errorMsg.title,
        description: errorMsg.description,
        variant: "destructive"
      });
      return;
    }

    setIsOneClickGenerating(true);
    cancelGeneration.current = false;
    const userId = profile.id;

    try {
      if (cancelGeneration.current) {
        throw createOneClickError('USER_CANCELLED', '사용자 중단');
      }
      
      if (!appState.isApiKeyValidated) {
        throw createOneClickError('API_KEY_MISSING', 'API 키 검증 필요');
      }
      
      let keyword: string | null = null;
      const keywordType = keywordSource === 'latest' ? '최신 트렌드' : '틈새';

      console.log(`${keywordType} 키워드 생성 시작 - 중복 방지 설정:`, preventDuplicates);

      // 사용자가 이미 사용한 키워드 목록 가져오기 (중복 금지일 때만)
      const usedKeywords = await getUserUsedKeywords(userId);
      console.log(`${keywordType} 키워드 생성 - 사용된 키워드:`, usedKeywords);

      // 키워드 생성 시도
      if (keywordSource === 'latest') {
        toast({ title: `1단계: 실시간 ${keywordType} 키워드 생성`, description: `Google Trends 데이터를 분석합니다...` });
        let attempt = 0;
        const maxAttempts = preventDuplicates ? 3 : 1;
        
        while(attempt < maxAttempts && !keyword) {
            if (cancelGeneration.current) {
              throw createOneClickError('USER_CANCELLED', '사용자 중단');
            }
            
            const generatedKeyword = await generateLatestKeyword();
            if (generatedKeyword) {
                const used = preventDuplicates ? usedKeywords.includes(generatedKeyword) : false;
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
            throw createOneClickError('KEYWORD_DUPLICATE_EXHAUSTED', '트렌드 키워드 중복 초과');
          }
        }
      
      } else {
        toast({ title: `1단계: 검증된 ${keywordType} 키워드 선택`, description: `데이터베이스에서 최적 키워드를 선택합니다...` });
        let attempt = 0;
        const maxAttempts = preventDuplicates ? 3 : 1;
        
        while(attempt < maxAttempts && !keyword) {
            if (cancelGeneration.current) {
              throw createOneClickError('USER_CANCELLED', '사용자 중단');
            }
            
            const generatedKeyword = await generateEvergreenKeyword();
            if (generatedKeyword) {
                const used = preventDuplicates ? usedKeywords.includes(generatedKeyword) : false;
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
            if (cancelGeneration.current) {
              throw createOneClickError('USER_CANCELLED', '사용자 중단');
            }

            const { data: usedKeywordsData, error: usedKeywordsError } = await supabase
                .from('user_used_keywords')
                .select('keyword_id')
                .eq('user_id', userId);

            if (usedKeywordsError) {
              throw createOneClickError('DATABASE_ERROR', '사용 키워드 조회 실패', usedKeywordsError.message);
            }
            
            const usedKeywordIds = usedKeywordsData.map(row => row.keyword_id);

            let keywordQuery = supabase
                .from('keywords')
                .select('keyword_text, id')
                .eq('type', 'evergreen');

            if (usedKeywordIds.length > 0) {
                 keywordQuery = keywordQuery.not('id', 'in', `(${usedKeywordIds.join(',')})`);
            }

            let { data: availableKeywords, error: keywordsError } = await keywordQuery;
            if (keywordsError) {
              throw createOneClickError('DATABASE_ERROR', 'DB 키워드 조회 실패', keywordsError.message);
            }
            
            if (!availableKeywords || availableKeywords.length === 0) {
                 toast({ title: "키워드 목록 초기화", description: `모든 '평생' 키워드를 사용했습니다. 목록을 초기화합니다.` });
                 const { data: allKeywordsOfType, error: allKeywordsError } = await supabase
                    .from('keywords')
                    .select('id')
                    .eq('type', 'evergreen');

                if (allKeywordsError) {
                  throw createOneClickError('DATABASE_ERROR', '키워드 목록 초기화 실패', allKeywordsError.message);
                }
                
                if (allKeywordsOfType.length > 0) {
                    const keywordIdsToDelete = allKeywordsOfType.map(k => k.id);
                    const { error: deleteError } = await supabase
                        .from('user_used_keywords')
                        .delete()
                        .eq('user_id', userId)
                        .in('keyword_id', keywordIdsToDelete);
                    if (deleteError) {
                      throw createOneClickError('DATABASE_ERROR', '키워드 이력 초기화 실패', deleteError.message);
                    }
                }
                const { data: refetchedKeywords, error: refetchedError } = await supabase.from('keywords').select('keyword_text, id').eq('type', 'evergreen');
                if (refetchedError) {
                  throw createOneClickError('DATABASE_ERROR', '초기화 후 키워드 조회 실패', refetchedError.message);
                }
                availableKeywords = refetchedKeywords;
            }

            if (!availableKeywords || availableKeywords.length === 0) {
              throw createOneClickError('KEYWORD_DUPLICATE_EXHAUSTED', '사용 가능한 평생 키워드 없음');
            }
            
            const selectedKeyword = availableKeywords[Math.floor(Math.random() * availableKeywords.length)];
            keyword = selectedKeyword.keyword_text;
        } else if (!keyword) {
          const retryKeyword = await generateEvergreenKeyword();
          keyword = retryKeyword || '생활 절약 꿀팁';
        }
      }

      if (!keyword) {
        throw createOneClickError('KEYWORD_GENERATION_FAILED', `${keywordType} 키워드 생성 실패`);
      }
      
      if (cancelGeneration.current) {
        throw createOneClickError('USER_CANCELLED', '사용자 중단');
      }
      
      await recordKeywordUsage(keyword, userId, keywordSource);

      console.log('키워드 설정:', keyword);
      saveAppState({ keyword });
      toast({ title: "키워드 자동 입력 완료", description: `'${keyword}' (으)로 주제 생성을 시작합니다.` });
      
      await sleep(1500);
      if (cancelGeneration.current) {
        throw createOneClickError('USER_CANCELLED', '사용자 중단');
      }

      toast({ title: "2단계: AI 주제 생성 시작", description: "선택된 키워드로 블로그 주제를 생성합니다..." });
      console.log('주제 생성 호출 - 키워드:', keyword);
      const newTopics = await generateTopics(keyword);
      console.log('생성된 주제들:', newTopics);
      
      if (cancelGeneration.current) {
        throw createOneClickError('USER_CANCELLED', '사용자 중단');
      }
      
      if (!newTopics || newTopics.length === 0) {
        throw createOneClickError('TOPIC_GENERATION_FAILED', '주제 생성 실패');
      }

      await sleep(2000);
      if (cancelGeneration.current) {
        throw createOneClickError('USER_CANCELLED', '사용자 중단');
      }

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
          throw createOneClickError('TOPIC_DUPLICATE_EXHAUSTED', '모든 주제 중복');
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
      if (cancelGeneration.current) {
        throw createOneClickError('USER_CANCELLED', '사용자 중단');
      }

      toast({ title: "4단계: AI 글 생성 시작", description: "선택된 주제로 블로그 본문을 생성합니다..." });
      const articleGenerated = await generateArticle({ topic: selectedTopic, keyword });
      
      if (cancelGeneration.current) {
        throw createOneClickError('USER_CANCELLED', '사용자 중단');
      }
      
      if (!articleGenerated) {
        throw createOneClickError('ARTICLE_GENERATION_FAILED', '글 생성 실패');
      }

      toast({ 
        title: "✅ 원클릭 생성 완료!", 
        description: `${keywordType} 키워드 기반 모든 과정이 성공적으로 완료되었습니다.` 
      });

    } catch (error: any) {
      console.error('원클릭 생성 오류:', error);
      
      let errorMsg;
      if (error.type && error.message) {
        errorMsg = getOneClickErrorMessage(error as OneClickDetailedError);
        if (error.details) {
          console.error('오류 상세:', error.details);
        }
      } else {
        const unknownError = createOneClickError('DATABASE_ERROR', '예상치 못한 오류', error.message);
        errorMsg = getOneClickErrorMessage(unknownError);
      }
      
      toast({
        title: errorMsg.title,
        description: errorMsg.description,
        variant: error.type === 'USER_CANCELLED' ? "default" : "destructive"
      });
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
