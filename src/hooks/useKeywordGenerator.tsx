
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { RealTimeTrendCrawler } from '@/lib/realTimeTrendCrawler';
import { ExpandedEvergreenService } from '@/lib/expandedEvergreenKeywords';

export const useKeywordGenerator = (appState: AppState) => {
    const { toast } = useToast();

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

    const generateEvergreenKeyword = async (): Promise<string | null> => {
        if (!appState.isApiKeyValidated || !appState.apiKey) {
            toast({
                title: "API 키 검증 필요",
                description: "Gemini API 키를 먼저 검증해주세요.",
                variant: "destructive"
            });
            return null;
        }

        try {
            toast({ 
                title: "AI 평생 키워드 동적 생성 중...", 
                description: "다양한 카테고리에서 새로운 평생 키워드를 생성합니다." 
            });

            // 현재 저장된 사용 키워드들
            const usedKeywordsKey = 'recent_evergreen_keywords';
            const recentUsed = JSON.parse(localStorage.getItem(usedKeywordsKey) || '[]');
            
            const result = await ExpandedEvergreenService.generateDynamicEvergreenKeyword(appState.apiKey, recentUsed);
            
            if (result) {
                // 사용한 키워드 저장 (최근 100개만 유지)
                const updatedUsed = [result, ...recentUsed.filter((k: string) => k !== result)].slice(0, 100);
                localStorage.setItem(usedKeywordsKey, JSON.stringify(updatedUsed));
                
                console.log('동적 평생 키워드 생성 성공:', result);
                toast({ 
                    title: "🌟 평생 키워드 동적 생성 완료", 
                    description: `"${result}" - AI가 새롭게 창조한 평생 가치 키워드` 
                });
                return result;
            }

            throw new Error('동적 평생 키워드 생성 실패');

        } catch (error) {
            console.error('평생 키워드 생성 오류:', error);
            
            // 백업: 확장된 평생 키워드 DB에서 선택
            const usedKeywordsKey = 'recent_evergreen_keywords';
            const recentUsed = JSON.parse(localStorage.getItem(usedKeywordsKey) || '[]');
            const backupKeyword = ExpandedEvergreenService.getRandomFromDatabase?.(recentUsed) || '생활 효율 개선법';
            
            toast({ 
                title: "백업 평생 키워드 선택", 
                description: `"${backupKeyword}" - 검증된 평생 가치 키워드` 
            });
            
            return backupKeyword;
        }
    };

    return { generateLatestKeyword, generateEvergreenKeyword };
};
