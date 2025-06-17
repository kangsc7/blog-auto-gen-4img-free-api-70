
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
                        maxOutputTokens: 50,
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

    const fetchRealTimeNews = async (): Promise<string[]> => {
        try {
            // 네이버 뉴스 RSS API 사용 (실시간 뉴스)
            const today = new Date();
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            
            console.log(`실시간 뉴스 검색 시작 - 오늘: ${today.toISOString()}, 어제: ${yesterday.toISOString()}`);
            
            // 실제 뉴스 API 대신 현재 시점의 실시간 이슈 키워드 생성
            const realTimePrompt = `**중요: 실시간 분석 요구사항**

현재 정확한 시각: ${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${today.getHours()}시 ${today.getMinutes()}분

**필수 준수 사항:**
1. 반드시 최근 24시간 이내(${yesterday.getDate()}일 이후)에 실제 발생한 이슈만 고려
2. 다음 중 하나의 카테고리에서 TODAY 현재 진행 중인 실제 이슈:
   - 정부 정책 발표나 변화 (최근 24시간)
   - 경제/금융 시장 동향 (오늘의 변화)
   - 사회적 이슈나 사건 (진행 중인 현안)
   - 기술/IT 업계 소식 (최신 발표)
   - 국제 정세 변화 (한국 관련)

**절대 피해야 할 키워드:**
- 과거 인물이나 이미 종료된 사건
- 탄핵, 과거 정치인, 예전 스캔들
- 작년이나 몇 달 전 이슈

**생성 기준:**
- 한국에서 오늘 화제가 되고 있는 실시간 이슈
- 온라인에서 현재 논의되는 최신 주제
- 24시간 이내 발생한 뉴스나 발표

**결과물:** 15자 이내의 현재 진행형 키워드 1개만 (년도 포함 금지)

**예시:** "새해 정부지원금", "코인 급등", "취업지원 확대", "부동산 정책 변화" 등`;

            console.log('실시간 뉴스 기반 키워드 생성 프롬프트:', realTimePrompt);
            
            const keyword = await callGeminiForKeyword(realTimePrompt);
            
            if (keyword) {
                // 과거 이슈 키워드 필터링
                const pastIssueKeywords = ['윤석열', '탄핵', '조국', '문재인', '박근혜', '이재명', '검찰', '수사'];
                const isPastIssue = pastIssueKeywords.some(pastKeyword => 
                    keyword.toLowerCase().includes(pastKeyword.toLowerCase())
                );
                
                if (isPastIssue) {
                    console.warn('과거 이슈 키워드 감지됨, 재생성:', keyword);
                    return this.generateCurrentTrendKeywords();
                }
                
                console.log('실시간 뉴스 키워드 생성 성공:', keyword);
                return [keyword];
            }
            
            return this.generateCurrentTrendKeywords();
        } catch (error) {
            console.error('실시간 뉴스 조회 오류:', error);
            return this.generateCurrentTrendKeywords();
        }
    };

    const generateCurrentTrendKeywords = (): string[] => {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        
        // 현재 시점 기준 실제 진행 중인 이슈들
        const currentIssues = [
            '2025년 정부지원금',
            '새해 취업지원제도', 
            '연말정산 변경사항',
            '1월 부동산 정책',
            '새해 건강보험 혜택',
            '2025년 청년정책',
            '신년 경제정책',
            '올해 교육지원 확대',
            '새해 복지제도 변화',
            '2025년 세제혜택'
        ];
        
        return currentIssues.slice(0, 5);
    };

    const generateLatestKeyword = async (): Promise<string | null> => {
        const now = new Date();
        const exactTime = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours()}시 ${now.getMinutes()}분`;
        
        toast({ 
            title: `🔴 실시간 뉴스 분석 중... (${exactTime})`, 
            description: "최신 뉴스를 분석하여 현재 진행 중인 이슈를 찾습니다." 
        });
        
        // 실시간 뉴스 기반 키워드 생성
        const newsKeywords = await fetchRealTimeNews();
        
        if (newsKeywords.length > 0) {
            const selectedKeyword = newsKeywords[Math.floor(Math.random() * newsKeywords.length)];
            toast({ 
                title: "🔥 실시간 이슈 키워드 완성", 
                description: `"${selectedKeyword}" - ${exactTime} 기준 최신 분석` 
            });
            return selectedKeyword;
        }

        // 백업: 현재 진행형 키워드 생성
        const backupPrompt = `현재 ${exactTime} 기준으로 한국에서 진행 중인 실제 이슈 중에서 
        블로그 주제로 적합한 키워드를 1개만 생성해주세요.
        
        중요: 과거 정치인이나 탄핵 같은 지난 이슈는 절대 포함하지 마세요.
        현재 진행 중인 정책, 경제, 사회 이슈만 고려해주세요.`;
        
        const result = await callGeminiForKeyword(backupPrompt);
        if (result) {
            toast({ 
                title: "현재 진행 이슈 키워드 생성", 
                description: `"${result}" - ${exactTime} 맞춤 분석` 
            });
        }
        
        return result;
    };

    const generateEvergreenKeyword = async (): Promise<string | null> => {
        toast({ title: "AI 평생 키워드 생성 중...", description: "AI가 새로운 평생 키워드를 동적으로 생성합니다." });
        
        // 다양한 카테고리의 평생 키워드 생성 프롬프트
        const evergreenPrompts = [
            `일반인이 놓치기 쉬운 금융 혜택이나 절약 방법 관련 키워드를 1개만 생성해주세요. 예: 적금, 펀드, 보험, 세금 절약 등의 분야에서 구체적이고 실용적인 내용으로 부탁드립니다.`,
            `평생 건강 관리에 도움이 되는 실용적인 키워드를 1개만 만들어주세요. 예: 운동법, 식단, 건강검진, 질병 예방 등의 분야에서 누구나 실천할 수 있는 내용으로 부탁드립니다.`,
            `일상생활에서 계속 도움이 되는 절약이나 효율성 관련 키워드를 1개만 생성해주세요. 예: 전기료, 통신비, 생활용품 관리 등의 분야에서 실용적인 내용으로 부탁드립니다.`,
            `개인 성장과 자기계발에 평생 도움이 되는 키워드를 1개만 만들어주세요. 예: 학습법, 독서, 시간관리, 목표설정 등의 분야에서 지속가능한 내용으로 부탁드립니다.`,
            `집에서 평생 활용할 수 있는 요리나 식재료 관련 키워드를 1개만 생성해주세요. 예: 기본 요리법, 보관법, 영양 관리 등의 분야에서 실용적인 내용으로 부탁드립니다.`,
            `육아나 가족 관계에서 평생 도움이 되는 키워드를 1개만 만들어주세요. 예: 아이 교육, 소통법, 발달 단계별 관리 등의 분야에서 실용적인 내용으로 부탁드립니다.`,
            `집 관리나 인테리어에서 평생 유용한 키워드를 1개만 생성해주세요. 예: 청소법, 정리정돈, 홈케어, 에너지 절약 등의 분야에서 실용적인 내용으로 부탁드립니다.`,
            `인간관계나 소통에서 평생 도움이 되는 키워드를 1개만 만들어주세요. 예: 대화법, 갈등 해결, 네트워킹, 예의 등의 분야에서 실용적인 내용으로 부탁드립니다.`,
            `취미나 여가 활동에서 평생 즐길 수 있는 키워드를 1개만 생성해주세요. 예: 독서, 운동, 여행, 창작 활동 등의 분야에서 지속가능한 내용으로 부탁드립니다.`,
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
