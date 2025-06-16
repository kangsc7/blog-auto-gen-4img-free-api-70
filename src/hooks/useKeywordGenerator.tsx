
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { useGoogleTrends } from './useGoogleTrends';
import { useEvergreenKeywords } from './useEvergreenKeywords';

export const useKeywordGenerator = (appState: AppState) => {
    const { toast } = useToast();
    const { getTrendingKeywords } = useGoogleTrends();
    const { getRandomEvergreenKeyword } = useEvergreenKeywords();

    const callGeminiForKeyword = async (prompt: string): Promise<string | null> => {
        if (!appState.isApiKeyValidated || !appState.apiKey) {
            toast({
                title: "API 키 검증 필요",
                description: "Gemini API 키를 먼저 검증해주세요.",
                variant: "destructive"
            });
            return null;
        }

        try {
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 1.2, // 더 다양한 결과를 위해 온도 상승
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Gemini API 요청 실패');
            }

            const data = await response.json();
            const keyword = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (!keyword) {
                throw new Error('Gemini로부터 유효한 키워드를 받지 못했습니다.');
            }

            return keyword.replace(/["'*]/g, '').replace(/\.$/, '');

        } catch (error) {
            console.error('키워드 생성 오류:', error);
            toast({
                title: "AI 키워드 생성 실패",
                description: error instanceof Error ? error.message : "AI 키워드 생성 중 오류가 발생했습니다.",
                variant: "destructive"
            });
            return null;
        }
    };

    const generateLatestKeyword = async (): Promise<string | null> => {
        toast({ title: "AI 최신 트렌드 분석 중...", description: "실시간 트렌드 데이터를 분석하여 키워드를 생성합니다." });
        
        try {
            // 1단계: Google Trends에서 실제 트렌딩 키워드 가져오기
            const trendingKeywords = await getTrendingKeywords();
            const randomTrendKeyword = trendingKeywords[Math.floor(Math.random() * trendingKeywords.length)];
            
            console.log('현재 트렌딩 키워드:', trendingKeywords);
            console.log('선택된 트렌드 키워드:', randomTrendKeyword);
            
            // 2단계: 트렌딩 키워드를 기반으로 한국적 맥락의 블로그 키워드 생성
            const currentYear = 2025; // 2025년으로 고정
            const currentMonth = new Date().getMonth() + 1;
            
            const diversePrompts = [
                `현재 "${randomTrendKeyword}"가 트렌딩 중입니다. 이와 관련된 ${currentYear}년 ${currentMonth}월 한국의 정부 정책이나 지원 제도 키워드를 1개만 생성해주세요.`,
                `"${randomTrendKeyword}" 트렌드를 바탕으로 한국 사람들이 관심 가질만한 경제적 혜택 관련 키워드를 1개만 만들어주세요.`,
                `현재 인기인 "${randomTrendKeyword}"와 연결하여 ${currentYear}년 새로운 사회 제도나 서비스 키워드를 1개만 제안해주세요.`,
                `"${randomTrendKeyword}" 이슈와 관련하여 일반인이 놓치기 쉬운 혜택이나 정보 키워드를 1개만 생성해주세요.`
            ];
            
            const randomPrompt = diversePrompts[Math.floor(Math.random() * diversePrompts.length)];
            const finalPrompt = `${randomPrompt} 다른 설명 없이 키워드만 텍스트로 제공해주세요.`;
            
            return await callGeminiForKeyword(finalPrompt);
            
        } catch (error) {
            console.error('최신 키워드 생성 오류:', error);
            // 백업 로직: Gemini만으로 생성
            const currentYear = 2025; // 2025년으로 고정
            const backupPrompt = `${currentYear}년 현재 한국에서 가장 핫한 이슈 중 하나의 키워드를 1개만 생성해주세요. 정부 정책, 경제 혜택, 사회 제도 관련으로 부탁드립니다. 다른 설명 없이 키워드만 제공해주세요.`;
            return await callGeminiForKeyword(backupPrompt);
        }
    };

    const generateEvergreenKeyword = async (): Promise<string | null> => {
        toast({ title: "AI 틈새 키워드 분석 중...", description: "검증된 데이터베이스에서 틈새 키워드를 선택합니다." });
        
        try {
            // 1단계: 검증된 평생 키워드 데이터베이스에서 선택
            const selectedKeyword = await getRandomEvergreenKeyword();
            
            if (!selectedKeyword) {
                throw new Error('평생 키워드 선택 실패');
            }
            
            console.log('선택된 평생 키워드:', selectedKeyword);
            
            // 2단계: 선택된 키워드를 현재 년도에 맞게 업데이트
            const currentYear = 2025; // 2025년으로 고정
            const enhancementPrompts = [
                `"${selectedKeyword}"를 ${currentYear}년 상황에 맞게 더 구체적으로 만들어주세요.`,
                `"${selectedKeyword}" 관련해서 ${currentYear}년 새로운 정보나 변화사항을 포함한 키워드로 업그레이드해주세요.`,
                `"${selectedKeyword}"에 년도나 구체적인 수치를 추가해서 더 매력적인 키워드로 만들어주세요.`
            ];
            
            const randomEnhancement = enhancementPrompts[Math.floor(Math.random() * enhancementPrompts.length)];
            const finalPrompt = `${randomEnhancement} 다른 설명 없이 키워드만 텍스트로 제공해주세요.`;
            
            const enhancedKeyword = await callGeminiForKeyword(finalPrompt);
            
            // Gemini 실패 시 원본 키워드 반환
            return enhancedKeyword || selectedKeyword;
            
        } catch (error) {
            console.error('평생 키워드 생성 오류:', error);
            toast({
                title: "평생 키워드 선택 실패",
                description: "백업 키워드를 사용합니다.",
                variant: "destructive"
            });
            return '생활 절약 꿀팁';
        }
    };

    return { generateLatestKeyword, generateEvergreenKeyword };
};
