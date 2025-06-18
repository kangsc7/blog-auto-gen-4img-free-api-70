
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { Profile } from '@/types';
import { RealTimeTrendCrawler } from '@/lib/realTimeTrendCrawler';

export const useOneClick = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void,
  generateTopics: () => Promise<string[] | null>,
  selectTopic: (topic: string) => void,
  generateArticle: (options?: { topic?: string; keyword?: string }) => Promise<string | null>,
  profile: Profile | null,
  preventDuplicates: boolean,
  hasAccess: boolean,
  isDuplicateTopic?: (topic: string) => boolean
) => {
  const { toast } = useToast();
  const [isOneClickGenerating, setIsOneClickGenerating] = useState(false);
  const [showTopicSelectionDialog, setShowTopicSelectionDialog] = useState(false);
  const [showDuplicateErrorDialog, setShowDuplicateErrorDialog] = useState(false);
  const [oneClickMode, setOneClickMode] = useState<'latest' | 'evergreen' | null>(null);

  const handleStopOneClick = () => {
    setIsOneClickGenerating(false);
    setOneClickMode(null);
    toast({ title: '원클릭 생성 중단', description: '원클릭 생성이 중단되었습니다.' });
  };

  // 향상된 평생 키워드 생성 함수
  const generateEvergreenKeyword = async (apiKey: string): Promise<string> => {
    const evergreenCategories = [
      // 재테크 관련 (20개)
      '주식투자 기초', '부동산 투자', '적금 이자율', '연금저축', '펀드 투자', 
      '보험 선택', '세금 절약', '대출 관리', '신용점수', '가계부 작성',
      '투자 포트폴리오', '배당주 투자', '청약 당첨', 'ISA 계좌', '절약 노하우',
      '암호화폐 기초', 'P2P 투자', '리츠 투자', '적금 상품', '통장 관리',
      
      // 건강 관리 (20개)
      '다이어트 방법', '홈트레이닝', '건강한 식단', '수면의 질', '스트레스 관리',
      '금연 성공법', '당뇨 관리', '혈압 관리', '관절 건강', '눈 건강',
      '면역력 강화', '갱년기 건강', '청소년 건강', '노인 건강', '정신건강',
      '비타민 섭취', '운동 루틴', '체중 관리', '건강검진', '생활습관',
      
      // 생활 정보 (20개)
      '전기요금 절약', '가스비 절약', '수도요금 절약', '인터넷 요금', '휴대폰 요금',
      '청소 노하우', '세탁 방법', '정리정돈', '에어컨 관리', '난방비 절약',
      '대중교통 할인', '렌탈 vs 구매', '중고거래', '생활용품 관리', '안전 관리',
      '보험 선택', '통신비 절약', '쇼핑 할인', '포인트 적립', '멤버십 활용',
      
      // 요리 레시피 (20개)
      '간단한 요리', '밑반찬 만들기', '도시락 메뉴', '아이 간식', '건강 요리',
      '다이어트 요리', '단백질 요리', '채소 요리', '국물 요리', '홈베이킹',
      '김치 담그기', '계란 요리', '면 요리', '찜 요리', '볶음 요리',
      '냉장고 정리', '식재료 보관', '밀키트 활용', '전자레인지 요리', '원팟 요리',
      
      // 자기계발 (20개)
      '독서 습관', '시간관리', '목표 달성', '집중력 향상', '기억력 개선',
      '창의력 기르기', '스트레스 해소', '자신감 키우기', '소통 능력', '리더십',
      '학습법', '노트 정리', '발표 기술', '면접 준비', '취업 준비',
      '자격증 공부', '온라인 강의', '독서법', '암기법', '어학 학습'
    ];

    try {
      // 랜덤으로 5개 카테고리 선택
      const shuffledCategories = evergreenCategories.sort(() => 0.5 - Math.random());
      const selectedCategories = shuffledCategories.slice(0, 5);
      
      console.log('✅ 선택된 평생 키워드 카테고리:', selectedCategories);

      const prompt = `다음 카테고리들 중에서 평생 도움이 되는 실용적인 키워드를 1개만 생성해주세요:

카테고리: ${selectedCategories.join(', ')}

**키워드 생성 규칙:**
- 10자 이내의 간결한 표현
- 시간이 지나도 변하지 않는 가치 있는 정보
- 실제 검색하고 싶은 구체적 내용
- 실행 가능한 실용적 주제

다른 설명 없이 키워드만 제공해주세요.`;

      console.log('🔄 평생 키워드 생성 API 호출 시작...');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.2,
            maxOutputTokens: 50,
          },
        }),
      });

      if (!response.ok) {
        console.error('❌ 평생 키워드 API 응답 실패:', response.status, response.statusText);
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      let keyword = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (!keyword) {
        console.error('❌ 평생 키워드 응답이 비어있음');
        throw new Error('유효한 키워드를 받지 못했습니다');
      }

      // 키워드 정제 - 불필요한 문구 제거
      keyword = keyword.replace(/^키워드:\s*/, '').replace(/^-\s*/, '').replace(/^\d+\.\s*/, '');
      keyword = keyword.split('\n')[0].trim(); // 첫 번째 줄만 사용
      
      console.log('✅ 생성된 평생 키워드:', keyword);
      return keyword;
    } catch (error) {
      console.error('❌ 평생 키워드 생성 오류:', error);
      // 백업 키워드 반환
      const backupKeywords = ['생활 절약 팁', '건강한 식단', '홈트레이닝', '재테크 기초', '요리 레시피'];
      const backupKeyword = backupKeywords[Math.floor(Math.random() * backupKeywords.length)];
      console.log('🔄 백업 키워드 사용:', backupKeyword);
      return backupKeyword;
    }
  };

  // 최신 이슈 키워드 생성 함수
  const generateLatestIssueKeyword = async (apiKey: string): Promise<string> => {
    try {
      console.log('🔍 최신 이슈 키워드 생성 시작...');
      
      // 실시간 트렌드 크롤링
      const latestTrends = await RealTimeTrendCrawler.getLatestTrends(apiKey);
      
      if (latestTrends && latestTrends.length > 0) {
        // 첫 번째 트렌드를 키워드로 사용
        const keyword = latestTrends[0];
        console.log('✅ 선택된 최신 이슈 키워드:', keyword);
        return keyword;
      } else {
        console.warn('⚠️ 크롤링된 트렌드가 없어 기본 키워드 사용');
        return '최신 뉴스';
      }
    } catch (error) {
      console.error('❌ 최신 이슈 키워드 생성 오류:', error);
      return '최신 뉴스';
    }
  };

  // 완전히 개선된 원클릭 생성 함수
  const handleOneClickStart = async (mode: 'latest' | 'evergreen') => {
    try {
      console.log(`🚀 ${mode === 'latest' ? '최신 이슈' : '평생 키워드'} 원클릭 생성 시작`);
      console.log('🔍 현재 앱 상태 검증:', { 
        isApiKeyValidated: appState.isApiKeyValidated, 
        apiKey: !!appState.apiKey,
        preventDuplicates,
        hasAccess 
      });
      
      // 1. API 키 검증 강화
      if (!appState.isApiKeyValidated || !appState.apiKey) {
        console.error('❌ API 키 검증 실패');
        toast({
          title: "API 키 검증 필요",
          description: "Gemini API 키를 설정하고 검증한 후 다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }

      // 2. 진행 상태 설정
      setIsOneClickGenerating(true);
      setOneClickMode(mode);

      let keyword: string;
      
      if (mode === 'latest') {
        // 최신 이슈 처리 - 개선된 버전
        toast({
          title: "최신 이슈 키워드 생성 중",
          description: "현재 시간대의 최신 이슈 키워드를 생성하고 있습니다...",
        });

        keyword = await generateLatestIssueKeyword(appState.apiKey);
      } else {
        // 평생 키워드 처리 - 완전히 개선된 버전
        toast({
          title: "평생 키워드 생성 중",
          description: "카테고리별 평생 키워드를 생성하고 있습니다...",
        });

        keyword = await generateEvergreenKeyword(appState.apiKey);
      }

      console.log('✅ 설정된 키워드:', keyword);
      
      // 3. 키워드를 앱 상태에 저장
      saveAppState({ keyword });
      
      toast({
        title: `${mode === 'latest' ? '최신 이슈' : '평생 키워드'} 주제 생성 시작`,
        description: `"${keyword}" 키워드로 주제를 생성하는 중입니다...`,
      });

      // 4. 키워드 저장 완료를 위한 대기
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('🔄 주제 생성 함수 호출 시작...');
      
      // 5. 주제 생성 - 강화된 에러 처리
      let topics: string[] | null = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (!topics && retryCount < maxRetries) {
        try {
          console.log(`🔄 주제 생성 시도 ${retryCount + 1}/${maxRetries}`);
          topics = await generateTopics();
          
          if (topics && topics.length > 0) {
            console.log('✅ 주제 생성 성공:', topics);
            break;
          } else {
            console.warn(`⚠️ 주제 생성 결과가 비어있음 (시도 ${retryCount + 1})`);
          }
        } catch (error) {
          console.error(`❌ 주제 생성 시도 ${retryCount + 1} 실패:`, error);
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`🔄 ${retryCount + 1}초 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
        }
      }
      
      if (!topics || topics.length === 0) {
        console.error('❌ 모든 주제 생성 시도 실패');
        throw new Error('주제 생성에 실패했습니다. API 상태를 확인해주세요.');
      }

      // 6. 첫 번째 주제 자동 선택 및 글 생성
      const selectedTopic = topics[0];
      console.log('✅ 자동 선택된 주제:', selectedTopic);
      
      // 주제 선택
      selectTopic(selectedTopic);
      
      toast({
        title: "블로그 글 생성 시작",
        description: `"${selectedTopic}" 주제로 블로그 글을 생성하고 있습니다...`,
      });
      
      // 주제 선택 완료를 위한 대기
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔄 글 생성 시작:', { topic: selectedTopic, keyword });
      
      // 7. 컨텐츠 생성 - 강화된 에러 처리
      const result = await generateArticle({ topic: selectedTopic, keyword });
      
      if (result) {
        toast({
          title: "원클릭 생성 완료! 🎉",
          description: `"${selectedTopic}" 주제로 블로그 글이 성공적으로 생성되었습니다.`,
        });
        console.log('✅ 원클릭 생성 완료');
      } else {
        throw new Error('글 생성에 실패했습니다');
      }
      
    } catch (error) {
      console.error("❌ 원클릭 생성 오류:", error);
      toast({
        title: "원클릭 생성 실패",
        description: `생성 과정에서 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        variant: "destructive",
      });
    } finally {
      setIsOneClickGenerating(false);
      setOneClickMode(null);
    }
  };

  // 주제가 선택되었을 때 처리 함수 (다이얼로그용)
  const handleTopicSelect = async (topic: string) => {
    try {
      setShowTopicSelectionDialog(false);
      selectTopic(topic);
      
      toast({
        title: "글 생성 시작",
        description: `"${topic}" 주제로 블로그 글을 생성하고 있습니다...`,
      });
      
      await generateArticle({ topic, keyword: appState.keyword });
      
      toast({
        title: "원클릭 생성 완료",
        description: `"${topic}" 주제로 글이 생성되었습니다.`,
      });
    } catch (error) {
      console.error("주제 선택 후 처리 오류:", error);
      toast({
        title: "글 생성 실패",
        description: "선택한 주제로 글을 생성하지 못했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsOneClickGenerating(false);
      setOneClickMode(null);
    }
  };

  // 주제 선택 취소 시
  const handleTopicSelectionCancel = () => {
    setShowTopicSelectionDialog(false);
    setIsOneClickGenerating(false);
    setOneClickMode(null);
    toast({
      title: "주제 선택 취소",
      description: "원클릭 생성이 취소되었습니다.",
    });
  };

  // 최신 이슈 원클릭 생성 함수
  const handleLatestIssueOneClick = async () => {
    console.log('🔥 최신 이슈 원클릭 버튼 클릭 - 접근 권한:', hasAccess);
    
    if (!hasAccess) {
      toast({
        title: "접근 제한",
        description: "해당 기능을 사용할 권한이 없습니다. 관리자에게 문의하세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (isOneClickGenerating) {
      toast({
        title: "이미 진행 중인 작업이 있습니다",
        description: "현재 진행 중인 작업이 완료된 후 다시 시도해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    await handleOneClickStart('latest');
  };

  // 평생 키워드 원클릭 생성 함수
  const handleEvergreenKeywordOneClick = async () => {
    console.log('🌱 평생 키워드 원클릭 버튼 클릭 - 접근 권한:', hasAccess);
    
    if (!hasAccess) {
      toast({
        title: "접근 제한", 
        description: "해당 기능을 사용할 권한이 없습니다. 관리자에게 문의하세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (isOneClickGenerating) {
      toast({
        title: "이미 진행 중인 작업이 있습니다",
        description: "현재 진행 중인 작업이 완료된 후 다시 시도해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    await handleOneClickStart('evergreen');
  };

  return {
    isOneClickGenerating,
    handleLatestIssueOneClick,
    handleEvergreenKeywordOneClick,
    handleStopOneClick,
    showTopicSelectionDialog,
    setShowTopicSelectionDialog,
    showDuplicateErrorDialog,
    setShowDuplicateErrorDialog,
    handleTopicSelect,
    handleTopicSelectionCancel,
    oneClickMode
  };
};
