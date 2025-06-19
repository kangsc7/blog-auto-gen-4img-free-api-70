import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { RealTimeTrendCrawler } from '@/lib/realTimeTrendCrawler';
import { ExpandedEvergreenService } from '@/lib/expandedEvergreenKeywords';
import { useEvergreenKeywords } from '@/hooks/use-evergreen-keywords';

export const useKeywordGenerator = (appState: AppState) => {
    const { toast } = useToast();
    const { getRandomEvergreenKeyword } = useEvergreenKeywords();
    const { generateDynamicEvergreenKeyword } = ExpandedEvergreenService;

    const generateLatestKeyword = async (): Promise<string | null> => {
        if (!appState.isApiKeyValidated || !appState.apiKey) {
            toast({
                title: "API 키 검증 필요",
                description: "Gemini API 키를 먼저 검증해주세요.",
                variant: "destructive"
            });
            return null;
        }

        try {
            const now = new Date();
            const exactTime = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours()}시 ${now.getMinutes()}분`;
            
            toast({ 
                title: `🔴 실시간 트렌드 수집 중... (${exactTime})`, 
                description: "다양한 소스에서 최신 트렌드를 실시간으로 수집합니다." 
            });

            // 현재 저장된 사용 키워드들 (간단한 로컬 캐시)
            const usedKeywordsKey = 'recent_trend_keywords';
            const recentUsed = JSON.parse(localStorage.getItem(usedKeywordsKey) || '[]');
            
            const result = await RealTimeTrendCrawler.getRandomLatestKeyword(appState.apiKey, recentUsed);
            
            if (result) {
                // 사용한 키워드 저장 (최근 50개만 유지)
                const updatedUsed = [result, ...recentUsed.filter((k: string) => k !== result)].slice(0, 50);
                localStorage.setItem(usedKeywordsKey, JSON.stringify(updatedUsed));
                
                console.log(`실시간 트렌드 키워드 생성 성공 (${exactTime}):`, result);
                toast({ 
                    title: "🔥 실시간 트렌드 키워드 완성", 
                    description: `"${result}" - ${exactTime} 기준 최신 트렌드 반영` 
                });
                return result;
            }

            throw new Error('실시간 트렌드 수집 실패');

        } catch (error) {
            console.error('최신 트렌드 키워드 생성 오류:', error);
            
            // 백업: 시간대별 안전한 키워드
            const hour = new Date().getHours();
            const timeBasedKeywords = [
                '아침 건강 루틴', '점심시간 효율 관리', '저녁 요리 레시피', '주말 생활 팁',
                '월요병 극복법', '스트레스 해소법', '수면의 질 개선', '집중력 향상법'
            ];
            
            const backupKeyword = timeBasedKeywords[hour % timeBasedKeywords.length];
            
            toast({ 
                title: "백업 키워드 생성", 
                description: `"${backupKeyword}" - 시간대 맞춤 키워드` 
            });
            
            return backupKeyword;
        }
    };

    // 새로운 Gemini 기반 연관검색어 키워드 생성 함수
    const generateGeminiBasedEvergreenKeyword = async (): Promise<string | null> => {
        if (!appState.apiKey || !appState.isApiKeyValidated) {
          console.error('API 키가 없습니다.');
          return null;
        }

        try {
          // 1단계: 핵심 키워드 선택 (평생 가치가 있는 주제들)
          const coreKeywords = [
            '건강관리', '재테크', '요리', '육아', '자기계발', 
            '생활정보', '절약', '운동', '학습', '인간관계',
            '취업', '부동산', '투자', '보험', '세금',
            '영어공부', '컴퓨터', '스마트폰', '청소', '정리정돈'
          ];

          const randomCoreKeyword = coreKeywords[Math.floor(Math.random() * coreKeywords.length)];
          console.log('선택된 핵심 키워드:', randomCoreKeyword);

          // 2단계: Gemini에게 연관검색어 분석 요청
          const prompt = `"${randomCoreKeyword}"와 관련해서 사람들이 실제로 자주 검색하는 연관검색어 중에서 평생 활용할 수 있는 실용적인 키워드 1개를 생성해주세요.

🎯 생성 조건:
- 15자 이내의 간결한 표현
- 실제 사용자들이 검색할 만한 구체적 내용
- 시간이 지나도 변하지 않는 평생 가치
- SEO 관점에서 상위 노출 가능성이 높은 키워드
- 너무 경쟁이 치열하지 않은 틈새 키워드 우선

🔍 연관검색어 분석 기준:
1. "${randomCoreKeyword}" 관련 실제 검색어 패턴 분석
2. 사용자 의도와 니즈 파악
3. 롱테일 키워드 우선 고려
4. 정보성 검색어 중심으로 선별

예시 형태:
- "${randomCoreKeyword} 초보자 가이드"
- "${randomCoreKeyword} 비용 절약법"
- "${randomCoreKeyword} 실수 방지법"

다른 설명 없이 키워드만 제공해주세요.`;

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.8, // 적절한 창의성
                maxOutputTokens: 100,
                topP: 0.9,
              },
            }),
          });

          if (!response.ok) throw new Error('Gemini 연관검색어 분석 실패');

          const data = await response.json();
          const keyword = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          
          if (!keyword) {
            console.log('Gemini 연관검색어 생성 실패, 백업 키워드 사용');
            return `${randomCoreKeyword} 실용 팁`;
          }

          // 키워드 정제 (불필요한 따옴표나 기호 제거)
          const cleanedKeyword = keyword
            .replace(/^["'`]|["'`]$/g, '') // 앞뒤 따옴표 제거
            .replace(/^\d+\.\s*/, '') // 앞의 번호 제거
            .replace(/^-\s*/, '') // 앞의 하이픈 제거
            .trim();

          console.log('Gemini 기반 연관검색어 키워드 생성 완료:', cleanedKeyword);
          return cleanedKeyword;

        } catch (error) {
          console.error('Gemini 연관검색어 생성 오류:', error);
          // 백업으로 기존 방식 사용
          return getRandomEvergreenKeyword();
        }
      };

      // 기존 generateEvergreenKeyword 함수를 Gemini 기반으로 교체
      const generateEvergreenKeyword = async (): Promise<string | null> => {
        console.log('평생키워드 생성 방식: Gemini 연관검색어 분석');
        
        // 1차 시도: Gemini 기반 연관검색어 생성
        let keyword = await generateGeminiBasedEvergreenKeyword();
        
        if (!keyword) {
          console.log('Gemini 방식 실패, 확장된 동적 생성 시도');
          // 2차 시도: 기존 확장된 동적 생성
          keyword = await generateDynamicEvergreenKeyword(appState.apiKey, []);
        }
        
        if (!keyword) {
          console.log('동적 생성 실패, 데이터베이스에서 선택');
          // 3차 시도: 데이터베이스에서 랜덤 선택
          keyword = await getRandomEvergreenKeyword();
        }

        if (!keyword) {
          console.log('모든 방식 실패, 기본 키워드 사용');
          // 최종 백업: 기본 키워드
          keyword = '생활 실용 정보';
        }

        console.log('최종 평생키워드:', keyword);
        return keyword;
      };

    return { generateLatestKeyword, generateEvergreenKeyword };
};
