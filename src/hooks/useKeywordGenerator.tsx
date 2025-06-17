
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
                        temperature: 1.2,
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
        toast({ title: "AI 최신 트렌드 분석 중...", description: "실시간 트렌드를 AI로 분석하여 키워드를 생성합니다." });
        
        const currentYear = 2025;
        const currentMonth = new Date().getMonth() + 1;
        const currentDay = new Date().getDate();
        
        // 다양한 최신 트렌드 생성 프롬프트
        const trendPrompts = [
            `${currentYear}년 ${currentMonth}월 현재 한국에서 가장 주목받고 있는 정부 정책이나 지원제도 키워드를 1개만 생성해주세요. 실제 시행되고 있거나 곧 시행될 정책 위주로 부탁드립니다.`,
            
            `${currentYear}년 ${currentMonth}월 기준 한국 사회에서 화제가 되고 있는 경제 혜택이나 지원금 관련 키워드를 1개만 만들어주세요. 청년, 중장년, 노인층이 관심 가질만한 내용으로 부탁드립니다.`,
            
            `현재 ${currentYear}년 ${currentMonth}월에 한국에서 새롭게 시작되거나 변경된 제도, 서비스 관련 키워드를 1개만 제안해주세요. 일반인이 놓치기 쉬운 중요한 정보를 우선으로 부탁드립니다.`,
            
            `${currentYear}년 ${currentMonth}월 현재 한국의 디지털 정부 서비스나 온라인 신청 가능한 혜택 중에서 키워드를 1개만 생성해주세요. 편리하면서도 많은 사람들이 모르는 서비스 위주로 부탁드립니다.`,
            
            `지금 ${currentYear}년 ${currentMonth}월에 한국에서 부동산, 주택 관련해서 새로 생긴 정책이나 지원제도 키워드를 1개만 만들어주세요. 실제 도움이 되는 실용적인 내용으로 부탁드립니다.`,
            
            `현재 ${currentYear}년 ${currentMonth}월 한국의 건강보험, 의료 혜택 분야에서 새롭거나 개선된 제도 키워드를 1개만 생성해주세요. 국민건강보험공단 서비스나 정부 의료 지원 위주로 부탁드립니다.`,
            
            `${currentYear}년 ${currentMonth}월 기준 한국의 교육비 지원, 학습 지원 관련 정부 정책 키워드를 1개만 만들어주세요. 평생교육, 직업교육, 자격증 지원 등을 포함해서 부탁드립니다.`,
            
            `지금 ${currentYear}년 ${currentMonth}월에 한국에서 창업 지원, 소상공인 지원 관련 새로운 정책이나 프로그램 키워드를 1개만 생성해주세요. 실제 창업가들이 활용할 수 있는 내용으로 부탁드립니다.`
        ];
        
        const randomPrompt = trendPrompts[Math.floor(Math.random() * trendPrompts.length)];
        const finalPrompt = `${randomPrompt} 다른 설명 없이 키워드만 텍스트로 제공해주세요.`;
        
        console.log('최신 트렌드 생성 프롬프트:', finalPrompt);
        
        const result = await callGeminiForKeyword(finalPrompt);
        if (result) {
            console.log('생성된 최신 트렌드 키워드:', result);
            toast({ title: "AI 최신 트렌드 키워드 생성 완료", description: `"${result}" - AI 추론으로 생성된 실시간 트렌드` });
        }
        
        return result;
    };

    const generateEvergreenKeyword = async (): Promise<string | null> => {
        toast({ title: "AI 평생 키워드 생성 중...", description: "AI가 새로운 평생 키워드를 동적으로 생성합니다." });
        
        // 다양한 카테고리의 평생 키워드 생성 프롬프트
        const evergreenPrompts = [
            // 재테크 카테고리
            `일반인이 놓치기 쉬운 금융 혜택이나 절약 방법 관련 키워드를 1개만 생성해주세요. 예: 적금, 펀드, 보험, 세금 절약 등의 분야에서 구체적이고 실용적인 내용으로 부탁드립니다.`,
            
            // 건강 카테고리  
            `평생 건강 관리에 도움이 되는 실용적인 키워드를 1개만 만들어주세요. 예: 운동법, 식단, 건강검진, 질병 예방 등의 분야에서 누구나 실천할 수 있는 내용으로 부탁드립니다.`,
            
            // 생활정보 카테고리
            `일상생활에서 계속 도움이 되는 절약이나 효율성 관련 키워드를 1개만 생성해주세요. 예: 전기료, 통신비, 생활용품 관리 등의 분야에서 실용적인 내용으로 부탁드립니다.`,
            
            // 자기계발 카테고리
            `개인 성장과 자기계발에 평생 도움이 되는 키워드를 1개만 만들어주세요. 예: 학습법, 독서, 시간관리, 목표설정 등의 분야에서 지속가능한 내용으로 부탁드립니다.`,
            
            // 요리 카테고리
            `집에서 평생 활용할 수 있는 요리나 식재료 관련 키워드를 1개만 생성해주세요. 예: 기본 요리법, 보관법, 영양 관리 등의 분야에서 실용적인 내용으로 부탁드립니다.`,
            
            // 육아 카테고리
            `육아나 가족 관계에서 평생 도움이 되는 키워드를 1개만 만들어주세요. 예: 아이 교육, 소통법, 발달 단계별 관리 등의 분야에서 실용적인 내용으로 부탁드립니다.`,
            
            // 주거 관리 카테고리
            `집 관리나 인테리어에서 평생 유용한 키워드를 1개만 생성해주세요. 예: 청소법, 정리정돈, 홈케어, 에너지 절약 등의 분야에서 실용적인 내용으로 부탁드립니다.`,
            
            // 인간관계 카테고리
            `인간관계나 소통에서 평생 도움이 되는 키워드를 1개만 만들어주세요. 예: 대화법, 갈등 해결, 네트워킹, 예의 등의 분야에서 실용적인 내용으로 부탁드립니다.`,
            
            // 취미/여가 카테고리
            `취미나 여가 활동에서 평생 즐길 수 있는 키워드를 1개만 생성해주세요. 예: 독서, 운동, 여행, 창작 활동 등의 분야에서 지속가능한 내용으로 부탁드립니다.`,
            
            // 디지털 활용 카테고리
            `디지털 기기나 온라인 서비스 활용에서 평생 유용한 키워드를 1개만 만들어주세요. 예: 스마트폰 활용, 온라인 쇼핑, 디지털 정리 등의 분야에서 실용적인 내용으로 부탁드립니다.`
        ];
        
        const randomPrompt = evergreenPrompts[Math.floor(Math.random() * evergreenPrompts.length)];
        const finalPrompt = `${randomPrompt} 년도는 포함하지 말고, 다른 설명 없이 키워드만 텍스트로 제공해주세요.`;
        
        console.log('평생 키워드 생성 프롬프트:', finalPrompt);
        
        const result = await callGeminiForKeyword(finalPrompt);
        if (result) {
            console.log('생성된 평생 키워드:', result);
            toast({ title: "AI 평생 키워드 생성 완료", description: `"${result}" - AI가 동적으로 생성한 새로운 평생 키워드` });
        }
        
        return result;
    };

    return { generateLatestKeyword, generateEvergreenKeyword };
};
