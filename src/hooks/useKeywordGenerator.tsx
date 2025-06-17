
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
        
        // 1차: Gemini의 실시간 추론 능력 활용
        const realtimePrompt = `현재 ${currentYear}년 ${currentMonth}월 ${currentDay}일 기준으로, 한국에서 지금 가장 화제가 되고 있는 이슈나 트렌드를 분석해서 블로그 키워드 1개만 생성해주세요. 

다음 조건을 만족해야 합니다:
- 실제로 현재 시점에서 관심이 높은 주제
- 블로그로 작성하기 적합한 주제
- 일반인들이 검색할 만한 키워드
- 15자 이내의 간결한 키워드

년도는 포함하지 말고, 다른 설명 없이 키워드만 텍스트로 제공해주세요.`;

        console.log('1차 실시간 트렌드 생성 프롬프트:', realtimePrompt);
        
        let result = await callGeminiForKeyword(realtimePrompt);
        
        // 1차 결과가 있으면 반환
        if (result) {
            console.log('1차 실시간 트렌드 키워드 생성 성공:', result);
            toast({ title: "실시간 트렌드 키워드 생성 완료", description: `"${result}" - AI 실시간 추론으로 생성` });
            return result;
        }

        // 2차: 백업 - 카테고리별 동적 생성
        toast({ title: "백업 시스템 작동", description: "10개 카테고리에서 최신 트렌드 키워드를 동적 생성합니다." });
        
        const categoryTrendPrompts = [
            // 테크/IT 카테고리
            `${currentYear}년 ${currentMonth}월 현재 한국의 IT/테크 분야에서 가장 주목받는 트렌드나 기술 키워드를 1개만 생성해주세요. 예: AI 서비스, 새로운 앱, 디지털 혁신 등`,
            
            // 라이프스타일 카테고리
            `${currentYear}년 ${currentMonth}월 기준 한국인들 사이에서 인기 있는 라이프스타일 트렌드 키워드를 1개만 만들어주세요. 예: 건강 관리법, 취미 활동, 생활 패턴 등`,
            
            // 경제/재테크 카테고리
            `현재 ${currentYear}년 ${currentMonth}월에 한국에서 화제가 되는 경제/재테크 관련 키워드를 1개만 생성해주세요. 예: 투자 트렌드, 금융 상품, 절약 방법 등`,
            
            // 교육/자기계발 카테고리
            `${currentYear}년 ${currentMonth}월 현재 한국에서 인기 있는 교육이나 자기계발 관련 키워드를 1개만 만들어주세요. 예: 온라인 강의, 새로운 학습법, 자격증 등`,
            
            // 문화/엔터테인먼트 카테고리
            `지금 ${currentYear}년 ${currentMonth}월에 한국에서 화제가 되는 문화/엔터테인먼트 키워드를 1개만 생성해주세요. 예: 드라마, 음악, 예능, 문화 현상 등`,
            
            // 건강/의료 카테고리
            `현재 ${currentYear}년 ${currentMonth}월 기준 한국에서 관심이 높은 건강/의료 관련 키워드를 1개만 만들어주세요. 예: 새로운 건강법, 의료 서비스, 질병 예방 등`,
            
            // 부동산/주거 카테고리
            `${currentYear}년 ${currentMonth}월 현재 한국 부동산/주거 분야에서 주목받는 키워드를 1개만 생성해주세요. 예: 주택 정책, 임대차 제도, 주거 트렌드 등`,
            
            // 환경/지속가능성 카테고리
            `지금 ${currentYear}년 ${currentMonth}월에 한국에서 화제가 되는 환경이나 지속가능성 관련 키워드를 1개만 만들어주세요. 예: 친환경 제품, 재활용, 에너지 절약 등`,
            
            // 사회이슈 카테고리
            `현재 ${currentYear}년 ${currentMonth}월 기준 한국 사회에서 관심이 높은 사회 이슈 키워드를 1개만 생성해주세요. 예: 사회 제도, 복지 정책, 사회 현상 등`,
            
            // 푸드/요리 카테고리
            `${currentYear}년 ${currentMonth}월 현재 한국에서 인기 있는 음식/요리 트렌드 키워드를 1개만 만들어주세요. 예: 새로운 요리법, 인기 음식, 건강 식단 등`
        ];
        
        const randomPrompt = categoryTrendPrompts[Math.floor(Math.random() * categoryTrendPrompts.length)];
        const finalPrompt = `${randomPrompt} 년도는 포함하지 말고, 다른 설명 없이 키워드만 텍스트로 제공해주세요.`;
        
        console.log('2차 카테고리별 트렌드 생성 프롬프트:', finalPrompt);
        
        result = await callGeminiForKeyword(finalPrompt);
        if (result) {
            console.log('2차 카테고리별 트렌드 키워드 생성 성공:', result);
            toast({ title: "카테고리별 최신 키워드 생성 완료", description: `"${result}" - 10개 카테고리 중 동적 선택` });
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
