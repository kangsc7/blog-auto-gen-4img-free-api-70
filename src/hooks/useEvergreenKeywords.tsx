
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EvergreenKeyword {
  id: string;
  keyword_text: string;
  category: string;
  search_volume: number;
  competition_level: 'low' | 'medium' | 'high';
}

export const useEvergreenKeywords = () => {
  const { toast } = useToast();

  // 검증된 평생 키워드 데이터베이스
  const evergreenKeywordsDB: EvergreenKeyword[] = [
    // 재테크 카테고리
    { id: '1', keyword_text: '적금 이자율 비교', category: '재테크', search_volume: 8500, competition_level: 'medium' },
    { id: '2', keyword_text: '주택청약 당첨 팁', category: '재테크', search_volume: 12000, competition_level: 'high' },
    { id: '3', keyword_text: '연금저축 세액공제', category: '재테크', search_volume: 6800, competition_level: 'low' },
    { id: '4', keyword_text: 'ISA 계좌 활용법', category: '재테크', search_volume: 4500, competition_level: 'low' },
    
    // 건강 카테고리
    { id: '5', keyword_text: '국가건강검진 항목', category: '건강', search_volume: 9200, competition_level: 'medium' },
    { id: '6', keyword_text: '금연 성공 방법', category: '건강', search_volume: 7100, competition_level: 'medium' },
    { id: '7', keyword_text: '다이어트 식단표', category: '건강', search_volume: 15000, competition_level: 'high' },
    { id: '8', keyword_text: '스트레스 해소법', category: '건강', search_volume: 8800, competition_level: 'medium' },
    
    // 생활정보 카테고리
    { id: '9', keyword_text: '전기요금 절약 방법', category: '생활정보', search_volume: 6500, competition_level: 'low' },
    { id: '10', keyword_text: '인터넷 요금제 비교', category: '생활정보', search_volume: 11000, competition_level: 'high' },
    { id: '11', keyword_text: '렌탈 vs 구매 비교', category: '생활정보', search_volume: 3200, competition_level: 'low' },
    { id: '12', keyword_text: '대중교통 할인 혜택', category: '생활정보', search_volume: 4800, competition_level: 'medium' },
    
    // 자기계발 카테고리
    { id: '13', keyword_text: '온라인 강의 추천', category: '자기계발', search_volume: 7800, competition_level: 'medium' },
    { id: '14', keyword_text: '자격증 취득 순서', category: '자기계발', search_volume: 9500, competition_level: 'high' },
    { id: '15', keyword_text: '독서 습관 만들기', category: '자기계발', search_volume: 5600, competition_level: 'low' },
    { id: '16', keyword_text: '시간관리 앱 추천', category: '자기계발', search_volume: 4200, competition_level: 'medium' },
    
    // 정부혜택 카테고리
    { id: '17', keyword_text: '청년 월세 지원금', category: '정부혜택', search_volume: 18000, competition_level: 'high' },
    { id: '18', keyword_text: '기초연금 신청 방법', category: '정부혜택', search_volume: 13500, competition_level: 'medium' },
    { id: '19', keyword_text: '근로장려금 계산기', category: '정부혜택', search_volume: 8900, competition_level: 'medium' },
    { id: '20', keyword_text: '국민취업지원제도', category: '정부혜택', search_volume: 16200, competition_level: 'high' },
  ];

  const getRandomEvergreenKeyword = async (usedKeywords: string[] = []): Promise<string | null> => {
    try {
      // 사용하지 않은 키워드만 필터링
      const availableKeywords = evergreenKeywordsDB.filter(keyword => 
        !usedKeywords.includes(keyword.keyword_text)
      );

      if (availableKeywords.length === 0) {
        toast({
          title: "키워드 풀 초기화",
          description: "모든 평생 키워드를 사용했습니다. 새로운 키워드로 다시 시작합니다.",
        });
        return evergreenKeywordsDB[Math.floor(Math.random() * evergreenKeywordsDB.length)].keyword_text;
      }

      // 카테고리별 균등 분배를 위한 로직
      const categories = [...new Set(availableKeywords.map(k => k.category))];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const categoryKeywords = availableKeywords.filter(k => k.category === randomCategory);
      
      // 경쟁도가 낮은 키워드 우선 선택 (틈새 키워드)
      const lowCompetitionKeywords = categoryKeywords.filter(k => k.competition_level === 'low');
      const keywordsToChooseFrom = lowCompetitionKeywords.length > 0 ? lowCompetitionKeywords : categoryKeywords;
      
      const selectedKeyword = keywordsToChooseFrom[Math.floor(Math.random() * keywordsToChooseFrom.length)];
      
      console.log(`선택된 평생 키워드: ${selectedKeyword.keyword_text} (카테고리: ${selectedKeyword.category}, 경쟁도: ${selectedKeyword.competition_level})`);
      
      return selectedKeyword.keyword_text;
    } catch (error) {
      console.error('평생 키워드 선택 오류:', error);
      toast({
        title: "키워드 선택 오류",
        description: "백업 키워드를 사용합니다.",
        variant: "destructive"
      });
      return '생활 절약 꿀팁';
    }
  };

  const getKeywordsByCategory = (category: string): EvergreenKeyword[] => {
    return evergreenKeywordsDB.filter(keyword => keyword.category === category);
  };

  const getAllCategories = (): string[] => {
    return [...new Set(evergreenKeywordsDB.map(k => k.category))];
  };

  return { 
    getRandomEvergreenKeyword, 
    getKeywordsByCategory, 
    getAllCategories,
    evergreenKeywordsDB 
  };
};
