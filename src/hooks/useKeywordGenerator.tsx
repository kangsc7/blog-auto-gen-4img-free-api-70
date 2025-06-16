
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
        toast({ title: "AI 최신 트렌드 분석 중...", description: "AI가 최신 트렌드를 분석하여 키워드를 추론합니다." });
        const currentYear = new Date().getFullYear();
        const prompt = `당신은 ${currentYear}년의 최신 트렌드를 분석하는 전문가입니다. 현재 대한민국에서 사람들이 가장 뜨겁게 반응하고 있거나, 곧 화제가 될 것으로 예상되는 사회, 문화, 기술, 라이프스타일 분야의 이슈를 예측해주세요. 

특히 다음을 고려하여 키워드를 생성해주세요:
- ${currentYear}년 정부 정책이나 제도 변화
- 경제적 혜택이나 지원 제도
- 사회적 이슈나 트렌드
- 기술 발전이나 새로운 서비스

그 예측을 바탕으로, 블로그 포스팅에 가장 매력적이고 구체적인 핵심 키워드 1개만 선정해서 알려주세요. 키워드는 년도, 금액, 제도명 등 구체적인 정보를 포함해야 합니다. 다른 부가적인 설명 없이, 오직 키워드 텍스트만 응답으로 제공해야 합니다.`;
        return callGeminiForKeyword(prompt);
    };

    const generateEvergreenKeyword = async (): Promise<string | null> => {
        toast({ title: "AI 틸새 키워드 분석 중...", description: "구글과 네이버의 상위 키워드를 분석하여 새로운 틈새 키워드를 추론합니다." });
        const currentYear = new Date().getFullYear();
        const prompt = `대한민국의 구글과 네이버에서 꾸준히 인기 있는 '평생 키워드(evergreen keyword)' 분야(예: 건강, 재테크, 여행, 자기계발)를 분석해줘. 

${currentYear}년 상황을 반영하여, 아직 사람들에게 많이 알려지지 않았지만 검색 수요가 있을 만한 구체적인 '틈새 키워드' 1개를 추론해서 제안해줘. 

키워드 생성 조건:
- 년도나 구체적인 숫자가 포함된 키워드 선호
- 정부 정책이나 제도와 관련된 키워드 고려
- 경제적 혜택이나 지원 관련 키워드 우선

예를 들어, '다이어트'가 인기 분야라면 '${currentYear}년 국민건강보험 다이어트 프로그램 지원금' 같은 구체적이고 시의성 있는 틈새 키워드를 만드는 거야. 다른 설명 없이 키워드만 텍스트로 제공해줘.`;
        return callGeminiForKeyword(prompt);
    };

    return { generateLatestKeyword, generateEvergreenKeyword };
};
