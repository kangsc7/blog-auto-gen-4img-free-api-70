import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

export const useKeywordGenerator = (appState: AppState) => {
    const { toast } = useToast();

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
                        temperature: 1.0,
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
        toast({ title: "AI 최신 트렌드 분석 중...", description: "현재 구글과 네이버의 상위 검색어를 분석하여 키워드를 생성합니다." });
        const currentYear = new Date().getFullYear();
        const prompt = `현재 ${currentYear}년 대한민국 시간 기준으로 구글과 네이버에서 가장 인기 있는 최신 트렌드 검색어 5개를 찾아줘. 그 중에서 블로그 포스팅에 가장 적합한 핵심 키워드 1개만 선정해서 알려줘. 다른 설명 없이 키워드만 텍스트로 제공해줘.`;
        return callGeminiForKeyword(prompt);
    };

    const generateEvergreenKeyword = async (): Promise<string | null> => {
        toast({ title: "AI 틈새 키워드 분석 중...", description: "구글과 네이버의 상위 키워드를 분석하여 새로운 틈새 키워드를 추론합니다." });
        const prompt = `대한민국의 구글과 네이버에서 꾸준히 인기 있는 '평생 키워드(evergreen keyword)' 분야(예: 건강, 재테크, 여행, 자기계발)를 분석해줘. 그 분석을 바탕으로, 아직 사람들에게 많이 알려지지 않았지만 검색 수요가 있을 만한 구체적인 '틈새 키워드' 1개를 추론해서 제안해줘. 예를 들어, '다이어트'가 인기 분야라면 '간헐적 단식 후 요요 현상 극복법' 같은 구체적인 틈새 키워드를 만드는 거야. 다른 설명 없이 키워드만 텍스트로 제공해줘.`;
        return callGeminiForKeyword(prompt);
    };

    return { generateLatestKeyword, generateEvergreenKeyword };
};
