
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

    const generateLatestKeyword = async (): Promise<string | null> => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // 정확한 현재 시간을 명시하여 최신성 강조
        const exactTime = `${currentYear}년 ${currentMonth}월 ${currentDay}일 ${currentHour}시 ${currentMinute}분`;
        
        toast({ 
            title: `🔴 실시간 분석 중... (${exactTime})`, 
            description: "지금 이 순간의 최신 트렌드를 AI로 분석합니다." 
        });
        
        // 강화된 실시간 트렌드 분석 프롬프트 - 과거 키워드 필터링 추가
        const realtimePrompt = `🚨 **중요: 정확한 현재 시점 분석 요구사항** 🚨

**현재 정확한 시각: ${exactTime}**

**필수 준수 사항:**
1. 반드시 오늘 ${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')} 날짜의 최신 이슈만 분석
2. 24시간 이내(어제 ${currentDay-1}일 이후)에 발생한 실제 이슈만 고려
3. 2023년, 2024년 이전 데이터는 절대 사용 금지
4. 한국 시각 기준 최신 뉴스, 트렌드, 사회적 이슈 분석

**과거 키워드 필터링 (절대 사용 금지):**
- 탄핵, 윤석열 탄핵, 이재명, 한동훈 등 정치인 관련
- 코로나, 팬데믹 등 과거 이슈
- 2024년 이전의 모든 정치적 사건

**생성 기준:**
- 현재 한국에서 화제가 되고 있는 실시간 이슈 (정치 제외)
- 온라인 커뮤니티에서 논의되는 최신 주제
- 경제 동향, 사회 현상, 기술 분야의 오늘 발생한 이슈
- 연예, 스포츠, IT 분야의 최신 발생 사항

다음 중복 방지를 위한 랜덤 카테고리에서 선택:
${Math.random() < 0.2 ? '경제/재테크' : Math.random() < 0.4 ? '기술/IT' : Math.random() < 0.6 ? '사회/문화' : Math.random() < 0.8 ? '생활/건강' : '연예/스포츠'}

**결과물:** 15자 이내의 검색 가능한 한국어 키워드 1개만 제공 (년도 포함 금지)

**예시 형태:** "○○○ 새로운 정책", "△△△ 혜택 확대", "□□□ 서비스 개선" 등`;

        console.log('실시간 트렌드 분석 프롬프트:', realtimePrompt);
        
        let result = await callGeminiForKeyword(realtimePrompt);
        
        if (result) {
            // 과거 키워드 필터링
            const bannedKeywords = ['탄핵', '윤석열', '이재명', '한동훈', '코로나', '팬데믹'];
            const hasBannedKeyword = bannedKeywords.some(banned => 
                result!.toLowerCase().includes(banned.toLowerCase())
            );
            
            if (hasBannedKeyword) {
                console.log('과거 키워드 감지됨, 백업 키워드 생성');
                result = await generateBackupKeyword();
            } else {
                console.log(`실시간 키워드 생성 성공 (${exactTime}):`, result);
                toast({ 
                    title: "🔥 실시간 트렌드 키워드 완성", 
                    description: `"${result}" - ${exactTime} 기준 최신 분석` 
                });
            }
            return result;
        }

        // 백업 시스템: 시간대별 맞춤 키워드 생성
        const timeBasedPrompt = `현재 시각 ${currentHour}시를 고려하여, 
        ${currentHour < 9 ? '아침 시간대' : currentHour < 18 ? '낮 시간대' : '저녁 시간대'}에 
        한국인들이 관심 가질만한 ${exactTime} 기준 최신 키워드를 1개만 생성해주세요.
        
        반드시 오늘 날짜 ${currentYear}-${currentMonth}-${currentDay}의 실제 이슈여야 하며,
        과거 데이터는 절대 사용하지 마세요.
        정치인 이름이나 탄핵 관련 키워드는 절대 사용하지 마세요.`;
        
        result = await callGeminiForKeyword(timeBasedPrompt);
        if (result) {
            toast({ 
                title: "시간대별 최신 키워드 생성", 
                description: `"${result}" - ${exactTime} 맞춤 분석` 
            });
        }
        
        return result;
    };

    const generateBackupKeyword = async (): Promise<string | null> => {
        const backupKeywords = [
            '2025년 신용카드 혜택',
            '새해 건강관리 방법',
            '겨울철 에너지 절약',
            '스마트폰 배터리 수명',
            '홈트레이닝 추천',
            '부동산 전망',
            '투자 포트폴리오',
            '온라인 쇼핑 혜택',
            '건강보험 혜택 확대',
            '전기차 충전소 확산'
        ];
        
        const randomKeyword = backupKeywords[Math.floor(Math.random() * backupKeywords.length)];
        toast({ 
            title: "백업 키워드 생성", 
            description: `"${randomKeyword}" - 안전한 현재 진행형 이슈` 
        });
        return randomKeyword;
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
