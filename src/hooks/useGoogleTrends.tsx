
import { useToast } from '@/hooks/use-toast';

export const useGoogleTrends = () => {
  const { toast } = useToast();

  const getTrendingKeywords = async (): Promise<string[]> => {
    try {
      // Google Trends API는 공식적으로 무료 제공되지 않으므로 
      // 대안으로 SerpAPI의 Google Trends 엔드포인트를 사용
      const response = await fetch(`https://serpapi.com/search.json?engine=google_trends&q=trending&geo=KR&api_key=${process.env.SERPAPI_KEY || 'demo'}`);
      
      if (!response.ok) {
        throw new Error('트렌드 데이터 가져오기 실패');
      }

      const data = await response.json();
      
      // 실제 API 응답에서 트렌딩 키워드 추출
      const trendingTerms = data.interest_over_time?.timeline_data?.map((item: any) => 
        item.values?.[0]?.extracted_value || ''
      ).filter(Boolean) || [];

      if (trendingTerms.length === 0) {
        // API 실패 시 백업 키워드 목록
        return [
          '2025년 정부지원금',
          '기초연금 인상',
          '청년도약계좌',
          '국민취업지원제도',
          '에너지바우처',
          '근로장려금',
          '자녀장려금',
          '신혼부부 대출',
          '청년 월세지원',
          '임신출산진료비'
        ];
      }

      return trendingTerms.slice(0, 10);
    } catch (error) {
      console.error('Google Trends API 오류:', error);
      
      // 네트워크 오류 시 한국 맞춤 백업 키워드
      return [
        '2025년 새해 정책',
        '경제적 지원제도',
        '청년 혜택 프로그램',
        '건강보험 혜택',
        '부동산 정책 변화',
        '교육비 지원',
        '창업 지원금',
        '취업 지원 서비스',
        '노인복지 확대',
        '디지털 전환 지원'
      ];
    }
  };

  const getRelatedKeywords = async (baseKeyword: string): Promise<string[]> => {
    try {
      const response = await fetch(`https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(baseKeyword)}&geo=KR&api_key=${process.env.SERPAPI_KEY || 'demo'}`);
      
      if (!response.ok) {
        throw new Error('관련 키워드 가져오기 실패');
      }

      const data = await response.json();
      const relatedQueries = data.related_queries?.rising?.map((item: any) => item.query) || [];
      
      return relatedQueries.slice(0, 5);
    } catch (error) {
      console.error('Related keywords API 오류:', error);
      return [];
    }
  };

  return { getTrendingKeywords, getRelatedKeywords };
};
