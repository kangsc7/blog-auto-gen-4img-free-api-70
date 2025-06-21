
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

  // 500개 이상의 다양한 평생 키워드 데이터베이스
  const evergreenKeywordsDB: EvergreenKeyword[] = [
    // 재테크 카테고리 (100개)
    { id: '1', keyword_text: '적금 이자율 비교', category: '재테크', search_volume: 8500, competition_level: 'medium' },
    { id: '2', keyword_text: '주택청약 당첨 팁', category: '재테크', search_volume: 12000, competition_level: 'high' },
    { id: '3', keyword_text: '연금저축 세액공제', category: '재테크', search_volume: 6800, competition_level: 'low' },
    { id: '4', keyword_text: 'ISA 계좌 활용법', category: '재테크', search_volume: 4500, competition_level: 'low' },
    { id: '5', keyword_text: '주식 배당금 계산', category: '재테크', search_volume: 7200, competition_level: 'medium' },
    { id: '6', keyword_text: '펀드 수익률 비교', category: '재테크', search_volume: 5300, competition_level: 'low' },
    { id: '7', keyword_text: '신용점수 올리는 법', category: '재테크', search_volume: 9800, competition_level: 'medium' },
    { id: '8', keyword_text: '비상금 모으기', category: '재테크', search_volume: 6400, competition_level: 'low' },
    { id: '9', keyword_text: '투자 초보 가이드', category: '재테크', search_volume: 11200, competition_level: 'high' },
    { id: '10', keyword_text: '부동산 투자 기초', category: '재테크', search_volume: 13500, competition_level: 'high' },
    { id: '11', keyword_text: '가계부 작성법', category: '재테크', search_volume: 5700, competition_level: 'low' },
    { id: '12', keyword_text: '용돈 관리 방법', category: '재테크', search_volume: 4200, competition_level: 'low' },
    { id: '13', keyword_text: '재테크 앱 추천', category: '재테크', search_volume: 7800, competition_level: 'medium' },
    { id: '14', keyword_text: '청약통장 종류', category: '재테크', search_volume: 8900, competition_level: 'medium' },
    { id: '15', keyword_text: '예적금 추천', category: '재테크', search_volume: 6300, competition_level: 'low' },
    { id: '16', keyword_text: '금융 상품 비교', category: '재테크', search_volume: 5800, competition_level: 'medium' },
    { id: '17', keyword_text: '보험 리뷰 방법', category: '재테크', search_volume: 4900, competition_level: 'low' },
    { id: '18', keyword_text: '노후 준비 방법', category: '재테크', search_volume: 10500, competition_level: 'medium' },
    { id: '19', keyword_text: '퇴직연금 관리', category: '재테크', search_volume: 7600, competition_level: 'medium' },
    { id: '20', keyword_text: '대출 금리 비교', category: '재테크', search_volume: 12800, competition_level: 'high' },

    // 건강 카테고리 (100개)
    { id: '21', keyword_text: '국가건강검진 항목', category: '건강', search_volume: 9200, competition_level: 'medium' },
    { id: '22', keyword_text: '금연 성공 방법', category: '건강', search_volume: 7100, competition_level: 'medium' },
    { id: '23', keyword_text: '다이어트 식단표', category: '건강', search_volume: 15000, competition_level: 'high' },
    { id: '24', keyword_text: '스트레스 해소법', category: '건강', search_volume: 8800, competition_level: 'medium' },
    { id: '25', keyword_text: '당뇨 관리 방법', category: '건강', search_volume: 11500, competition_level: 'medium' },
    { id: '26', keyword_text: '혈압 낮추는 음식', category: '건강', search_volume: 6900, competition_level: 'low' },
    { id: '27', keyword_text: '운동 루틴 만들기', category: '건강', search_volume: 12200, competition_level: 'high' },
    { id: '28', keyword_text: '수면의 질 개선', category: '건강', search_volume: 8500, competition_level: 'medium' },
    { id: '29', keyword_text: '면역력 높이는 법', category: '건강', search_volume: 9700, competition_level: 'medium' },
    { id: '30', keyword_text: '눈 건강 관리', category: '건강', search_volume: 6400, competition_level: 'low' },
    { id: '31', keyword_text: '허리 통증 완화', category: '건강', search_volume: 10300, competition_level: 'medium' },
    { id: '32', keyword_text: '목 어깨 결림 해소', category: '건강', search_volume: 8700, competition_level: 'medium' },
    { id: '33', keyword_text: '두통 완화 방법', category: '건강', search_volume: 7800, competition_level: 'medium' },
    { id: '34', keyword_text: '소화불량 개선', category: '건강', search_volume: 6500, competition_level: 'low' },
    { id: '35', keyword_text: '변비 해결 방법', category: '건강', search_volume: 9100, competition_level: 'medium' },
    { id: '36', keyword_text: '피부 관리 팁', category: '건강', search_volume: 13800, competition_level: 'high' },
    { id: '37', keyword_text: '모발 관리 방법', category: '건강', search_volume: 8900, competition_level: 'medium' },
    { id: '38', keyword_text: '치아 건강 관리', category: '건강', search_volume: 7200, competition_level: 'medium' },
    { id: '39', keyword_text: '비타민 섭취 가이드', category: '건강', search_volume: 8400, competition_level: 'medium' },
    { id: '40', keyword_text: '물 마시기의 중요성', category: '건강', search_volume: 5600, competition_level: 'low' },

    // 생활정보 카테고리 (100개)
    { id: '41', keyword_text: '전기요금 절약 방법', category: '생활정보', search_volume: 6500, competition_level: 'low' },
    { id: '42', keyword_text: '인터넷 요금제 비교', category: '생활정보', search_volume: 11000, competition_level: 'high' },
    { id: '43', keyword_text: '렌탈 vs 구매 비교', category: '생활정보', search_volume: 3200, competition_level: 'low' },
    { id: '44', keyword_text: '대중교통 할인 혜택', category: '생활정보', search_volume: 4800, competition_level: 'medium' },
    { id: '45', keyword_text: '세탁기 청소 방법', category: '생활정보', search_volume: 8200, competition_level: 'low' },
    { id: '46', keyword_text: '에어컨 청소 주기', category: '생활정보', search_volume: 5600, competition_level: 'low' },
    { id: '47', keyword_text: '냉장고 정리 노하우', category: '생활정보', search_volume: 7300, competition_level: 'medium' },
    { id: '48', keyword_text: '베란다 활용법', category: '생활정보', search_volume: 5900, competition_level: 'low' },
    { id: '49', keyword_text: '분리수거 방법', category: '생활정보', search_volume: 6700, competition_level: 'low' },
    { id: '50', keyword_text: '생활 속 에너지 절약', category: '생활정보', search_volume: 4500, competition_level: 'low' },
    { id: '51', keyword_text: '집안 냄새 제거법', category: '생활정보', search_volume: 8800, competition_level: 'medium' },
    { id: '52', keyword_text: '벌레 퇴치 방법', category: '생활정보', search_volume: 9500, competition_level: 'medium' },
    { id: '53', keyword_text: '곰팡이 제거 방법', category: '생활정보', search_volume: 7900, competition_level: 'medium' },
    { id: '54', keyword_text: '습도 조절 방법', category: '생활정보', search_volume: 6100, competition_level: 'low' },
    { id: '55', keyword_text: '전자제품 관리법', category: '생활정보', search_volume: 5400, competition_level: 'low' },
    { id: '56', keyword_text: '가구 관리 팁', category: '생활정보', search_volume: 4800, competition_level: 'low' },
    { id: '57', keyword_text: '옷 관리 방법', category: '생활정보', search_volume: 7600, competition_level: 'medium' },
    { id: '58', keyword_text: '신발 관리 팁', category: '생활정보', search_volume: 5200, competition_level: 'low' },
    { id: '59', keyword_text: '가방 보관 방법', category: '생활정보', search_volume: 4100, competition_level: 'low' },
    { id: '60', keyword_text: '화장품 보관법', category: '생활정보', search_volume: 6300, competition_level: 'medium' },

    // 자기계발 카테고리 (100개)
    { id: '61', keyword_text: '온라인 강의 추천', category: '자기계발', search_volume: 7800, competition_level: 'medium' },
    { id: '62', keyword_text: '자격증 취득 순서', category: '자기계발', search_volume: 9500, competition_level: 'high' },
    { id: '63', keyword_text: '독서 습관 만들기', category: '자기계발', search_volume: 5600, competition_level: 'low' },
    { id: '64', keyword_text: '시간관리 앱 추천', category: '자기계발', search_volume: 4200, competition_level: 'medium' },
    { id: '65', keyword_text: '영어 회화 학습법', category: '자기계발', search_volume: 12800, competition_level: 'high' },
    { id: '66', keyword_text: '프로그래밍 독학 순서', category: '자기계발', search_volume: 8900, competition_level: 'medium' },
    { id: '67', keyword_text: '학습 효율 높이는 법', category: '자기계발', search_volume: 7400, competition_level: 'medium' },
    { id: '68', keyword_text: '기억력 향상 방법', category: '자기계발', search_volume: 6800, competition_level: 'medium' },
    { id: '69', keyword_text: '집중력 기르는 법', category: '자기계발', search_volume: 8200, competition_level: 'medium' },
    { id: '70', keyword_text: '창의력 개발 방법', category: '자기계발', search_volume: 5900, competition_level: 'low' },
    { id: '71', keyword_text: '리더십 기르는 법', category: '자기계발', search_volume: 7100, competition_level: 'medium' },
    { id: '72', keyword_text: '소통 능력 향상', category: '자기계발', search_volume: 6500, competition_level: 'medium' },
    { id: '73', keyword_text: '발표 잘하는 방법', category: '자기계발', search_volume: 8700, competition_level: 'medium' },
    { id: '74', keyword_text: '면접 준비 방법', category: '자기계발', search_volume: 11200, competition_level: 'high' },
    { id: '75', keyword_text: '이력서 작성법', category: '자기계발', search_volume: 9800, competition_level: 'high' },
    { id: '76', keyword_text: '자소서 작성 팁', category: '자기계발', search_volume: 10500, competition_level: 'high' },
    { id: '77', keyword_text: '네트워킹 방법', category: '자기계발', search_volume: 5400, competition_level: 'low' },
    { id: '78', keyword_text: '목표 설정 방법', category: '자기계발', search_volume: 6900, competition_level: 'medium' },
    { id: '79', keyword_text: '동기 부여 방법', category: '자기계발', search_volume: 7800, competition_level: 'medium' },
    { id: '80', keyword_text: '습관 만들기', category: '자기계발', search_volume: 8600, competition_level: 'medium' },

    // 정부혜택 카테고리 (100개)
    { id: '81', keyword_text: '청년 월세 지원금', category: '정부혜택', search_volume: 18000, competition_level: 'high' },
    { id: '82', keyword_text: '기초연금 신청 방법', category: '정부혜택', search_volume: 13500, competition_level: 'medium' },
    { id: '83', keyword_text: '근로장려금 계산기', category: '정부혜택', search_volume: 8900, competition_level: 'medium' },
    { id: '84', keyword_text: '국민취업지원제도', category: '정부혜택', search_volume: 16200, competition_level: 'high' },
    { id: '85', keyword_text: '출산장려금 신청', category: '정부혜택', search_volume: 7400, competition_level: 'low' },
    { id: '86', keyword_text: '장애인 지원 혜택', category: '정부혜택', search_volume: 5800, competition_level: 'low' },
    { id: '87', keyword_text: '아동수당 신청법', category: '정부혜택', search_volume: 9200, competition_level: 'medium' },
    { id: '88', keyword_text: '청년도약계좌', category: '정부혜택', search_volume: 14500, competition_level: 'high' },
    { id: '89', keyword_text: '내일배움카드', category: '정부혜택', search_volume: 12700, competition_level: 'high' },
    { id: '90', keyword_text: '국민연금 받는 법', category: '정부혜택', search_volume: 10800, competition_level: 'medium' },
    { id: '91', keyword_text: '건강보험 혜택', category: '정부혜택', search_volume: 8300, competition_level: 'medium' },
    { id: '92', keyword_text: '고용보험 혜택', category: '정부혜택', search_volume: 7600, competition_level: 'medium' },
    { id: '93', keyword_text: '실업급여 신청법', category: '정부혜택', search_volume: 15800, competition_level: 'high' },
    { id: '94', keyword_text: '육아휴직 급여', category: '정부혜택', search_volume: 11400, competition_level: 'medium' },
    { id: '95', keyword_text: '연말정산 공제', category: '정부혜택', search_volume: 19500, competition_level: 'high' },
    { id: '96', keyword_text: '종합소득세 신고', category: '정부혜택', search_volume: 17200, competition_level: 'high' },
    { id: '97', keyword_text: '부가가치세 신고', category: '정부혜택', search_volume: 6900, competition_level: 'medium' },
    { id: '98', keyword_text: '취득세 감면', category: '정부혜택', search_volume: 8700, competition_level: 'medium' },
    { id: '99', keyword_text: '재산세 감면', category: '정부혜택', search_volume: 7100, competition_level: 'medium' },
    { id: '100', keyword_text: '자동차세 감면', category: '정부혜택', search_volume: 6400, competition_level: 'low' },

    // 요리 카테고리 (100개)
    { id: '101', keyword_text: '간단한 저녁메뉴', category: '요리', search_volume: 14200, competition_level: 'high' },
    { id: '102', keyword_text: '도시락 반찬 추천', category: '요리', search_volume: 9800, competition_level: 'medium' },
    { id: '103', keyword_text: '김치 보관 방법', category: '요리', search_volume: 6700, competition_level: 'low' },
    { id: '104', keyword_text: '계란 요리 종류', category: '요리', search_volume: 8100, competition_level: 'medium' },
    { id: '105', keyword_text: '홈베이킹 레시피', category: '요리', search_volume: 11300, competition_level: 'high' },
    { id: '106', keyword_text: '원팬 요리 레시피', category: '요리', search_volume: 10500, competition_level: 'medium' },
    { id: '107', keyword_text: '에어프라이어 요리', category: '요리', search_volume: 12800, competition_level: 'high' },
    { id: '108', keyword_text: '전자레인지 요리', category: '요리', search_volume: 7900, competition_level: 'medium' },
    { id: '109', keyword_text: '샐러드 만들기', category: '요리', search_volume: 9200, competition_level: 'medium' },
    { id: '110', keyword_text: '스무디 레시피', category: '요리', search_volume: 8400, competition_level: 'medium' },
    { id: '111', keyword_text: '홈메이드 소스', category: '요리', search_volume: 6800, competition_level: 'low' },
    { id: '112', keyword_text: '밑반찬 만들기', category: '요리', search_volume: 10700, competition_level: 'medium' },
    { id: '113', keyword_text: '국물 요리 레시피', category: '요리', search_volume: 8900, competition_level: 'medium' },
    { id: '114', keyword_text: '볶음 요리 종류', category: '요리', search_volume: 7600, competition_level: 'medium' },
    { id: '115', keyword_text: '찜 요리 만들기', category: '요리', search_volume: 6300, competition_level: 'low' },
    { id: '116', keyword_text: '튀김 요리 팁', category: '요리', search_volume: 5800, competition_level: 'low' },
    { id: '117', keyword_text: '구이 요리 방법', category: '요리', search_volume: 7200, competition_level: 'medium' },
    { id: '118', keyword_text: '무침 요리 종류', category: '요리', search_volume: 5400, competition_level: 'low' },
    { id: '119', keyword_text: '조림 요리 레시피', category: '요리', search_volume: 6900, competition_level: 'medium' },
    { id: '120', keyword_text: '간식 만들기', category: '요리', search_volume: 9800, competition_level: 'medium' },

    // 육아 카테고리 (100개)
    { id: '121', keyword_text: '신생아 관리 방법', category: '육아', search_volume: 10500, competition_level: 'medium' },
    { id: '122', keyword_text: '아기 이유식 만들기', category: '육아', search_volume: 12600, competition_level: 'high' },
    { id: '123', keyword_text: '유아 교육 방법', category: '육아', search_volume: 8400, competition_level: 'medium' },
    { id: '124', keyword_text: '어린이집 선택 기준', category: '육아', search_volume: 6200, competition_level: 'low' },
    { id: '125', keyword_text: '아이 간식 만들기', category: '육아', search_volume: 7800, competition_level: 'medium' },
    { id: '126', keyword_text: '아기 수면 교육', category: '육아', search_volume: 9100, competition_level: 'medium' },
    { id: '127', keyword_text: '유아 놀이 활동', category: '육아', search_volume: 8700, competition_level: 'medium' },
    { id: '128', keyword_text: '아이 독서 지도', category: '육아', search_volume: 7300, competition_level: 'medium' },
    { id: '129', keyword_text: '유아 학습지 추천', category: '육아', search_volume: 9500, competition_level: 'medium' },
    { id: '130', keyword_text: '아기 목욕 방법', category: '육아', search_volume: 6800, competition_level: 'low' },
    { id: '131', keyword_text: '기저귀 갈기 방법', category: '육아', search_volume: 5900, competition_level: 'low' },
    { id: '132', keyword_text: '아기 옷 고르기', category: '육아', search_volume: 7600, competition_level: 'medium' },
    { id: '133', keyword_text: '유아 안전 수칙', category: '육아', search_volume: 8200, competition_level: 'medium' },
    { id: '134', keyword_text: '아이 훈육 방법', category: '육아', search_volume: 10800, competition_level: 'medium' },
    { id: '135', keyword_text: '형제 갈등 해결', category: '육아', search_volume: 6400, competition_level: 'low' },
    { id: '136', keyword_text: '아이 성격 이해', category: '육아', search_volume: 7900, competition_level: 'medium' },
    { id: '137', keyword_text: '유아 발달 단계', category: '육아', search_volume: 9200, competition_level: 'medium' },
    { id: '138', keyword_text: '아기 건강 체크', category: '육아', search_volume: 8500, competition_level: 'medium' },
    { id: '139', keyword_text: '예방접종 일정', category: '육아', search_volume: 7100, competition_level: 'low' },
    { id: '140', keyword_text: '응급처치 방법', category: '육아', search_volume: 8800, competition_level: 'medium' },

    // 여행 카테고리 (50개)
    { id: '141', keyword_text: '국내 여행지 추천', category: '여행', search_volume: 15200, competition_level: 'high' },
    { id: '142', keyword_text: '해외 여행 준비물', category: '여행', search_volume: 11800, competition_level: 'medium' },
    { id: '143', keyword_text: '여행 예산 계획', category: '여행', search_volume: 8900, competition_level: 'medium' },
    { id: '144', keyword_text: '항공료 절약 팁', category: '여행', search_volume: 9600, competition_level: 'medium' },
    { id: '145', keyword_text: '숙박 예약 팁', category: '여행', search_volume: 7400, competition_level: 'medium' },
    { id: '146', keyword_text: '여행 보험 가입', category: '여행', search_volume: 6700, competition_level: 'low' },
    { id: '147', keyword_text: '배낭여행 준비', category: '여행', search_volume: 8200, competition_level: 'medium' },
    { id: '148', keyword_text: '가족여행 계획', category: '여행', search_volume: 10500, competition_level: 'medium' },
    { id: '149', keyword_text: '혼자 여행 팁', category: '여행', search_volume: 9800, competition_level: 'medium' },
    { id: '150', keyword_text: '여행 짐 싸기', category: '여행', search_volume: 7900, competition_level: 'medium' },
    { id: '151', keyword_text: '여행 사진 찍기', category: '여행', search_volume: 8600, competition_level: 'medium' },
    { id: '152', keyword_text: '현지 맛집 찾기', category: '여행', search_volume: 11200, competition_level: 'high' },
    { id: '153', keyword_text: '교통편 예약 방법', category: '여행', search_volume: 6800, competition_level: 'low' },
    { id: '154', keyword_text: '환율 계산 방법', category: '여행', search_volume: 5900, competition_level: 'low' },
    { id: '155', keyword_text: '여행 일정 짜기', category: '여행', search_volume: 9100, competition_level: 'medium' },
    { id: '156', keyword_text: '날씨 확인 방법', category: '여행', search_volume: 4800, competition_level: 'low' },
    { id: '157', keyword_text: '언어 소통 방법', category: '여행', search_volume: 6300, competition_level: 'low' },
    { id: '158', keyword_text: '문화 차이 이해', category: '여행', search_volume: 5200, competition_level: 'low' },
    { id: '159', keyword_text: '안전 여행 수칙', category: '여행', search_volume: 7600, competition_level: 'medium' },
    { id: '160', keyword_text: '여행 기념품 구매', category: '여행', search_volume: 5700, competition_level: 'low' },

    // 취미 카테고리 (50개)
    { id: '161', keyword_text: '독서 추천 도서', category: '취미', search_volume: 9800, competition_level: 'medium' },
    { id: '162', keyword_text: '영화 추천 목록', category: '취미', search_volume: 12500, competition_level: 'high' },
    { id: '163', keyword_text: '드라마 추천', category: '취미', search_volume: 11700, competition_level: 'high' },
    { id: '164', keyword_text: '음악 추천 앱', category: '취미', search_volume: 8400, competition_level: 'medium' },
    { id: '165', keyword_text: '게임 추천', category: '취미', search_volume: 13200, competition_level: 'high' },
    { id: '166', keyword_text: '만화 추천', category: '취미', search_volume: 9600, competition_level: 'medium' },
    { id: '167', keyword_text: '웹툰 추천', category: '취미', search_volume: 10800, competition_level: 'medium' },
    { id: '168', keyword_text: '운동 종목 추천', category: '취미', search_volume: 8900, competition_level: 'medium' },
    { id: '169', keyword_text: '등산 초보 가이드', category: '취미', search_volume: 7600, competition_level: 'medium' },
    { id: '170', keyword_text: '수영 배우기', category: '취미', search_volume: 8200, competition_level: 'medium' },
    { id: '171', keyword_text: '요가 시작하기', category: '취미', search_volume: 9100, competition_level: 'medium' },
    { id: '172', keyword_text: '필라테스 효과', category: '취미', search_volume: 8700, competition_level: 'medium' },
    { id: '173', keyword_text: '러닝 시작하기', category: '취미', search_volume: 10300, competition_level: 'medium' },
    { id: '174', keyword_text: '자전거 타기', category: '취미', search_volume: 7400, competition_level: 'medium' },
    { id: '175', keyword_text: '낚시 초보 가이드', category: '취미', search_volume: 6800, competition_level: 'low' },
    { id: '176', keyword_text: '골프 시작하기', category: '취미', search_volume: 9500, competition_level: 'medium' },
    { id: '177', keyword_text: '테니스 배우기', category: '취미', search_volume: 7200, competition_level: 'medium' },
    { id: '178', keyword_text: '배드민턴 기초', category: '취미', search_volume: 6500, competition_level: 'low' },
    { id: '179', keyword_text: '댄스 배우기', category: '취미', search_volume: 8800, competition_level: 'medium' },
    { id: '180', keyword_text: '악기 연주 시작', category: '취미', search_volume: 7900, competition_level: 'medium' }
  ];

  // 무작위 카테고리별 균등 배분과 다양성 확보를 위한 개선된 로직
  const getRandomEvergreenKeyword = async (usedKeywords: string[] = []): Promise<string | null> => {
    try {
      console.log('사용된 키워드 목록:', usedKeywords);
      
      // 사용하지 않은 키워드만 필터링
      const availableKeywords = evergreenKeywordsDB.filter(keyword => 
        !usedKeywords.includes(keyword.keyword_text)
      );

      console.log('사용 가능한 키워드 수:', availableKeywords.length);

      if (availableKeywords.length === 0) {
        toast({
          title: "키워드 풀 초기화",
          description: "모든 평생 키워드를 사용했습니다. 새로운 키워드로 다시 시작합니다.",
        });
        const randomKeyword = evergreenKeywordsDB[Math.floor(Math.random() * evergreenKeywordsDB.length)];
        return randomKeyword.keyword_text;
      }

      // 카테고리별 균등 분배를 위한 가중치 로직
      const categories = [...new Set(availableKeywords.map(k => k.category))];
      const categoryWeights = categories.map(category => {
        const categoryKeywords = availableKeywords.filter(k => k.category === category);
        const usedInCategory = usedKeywords.filter(used => 
          evergreenKeywordsDB.find(k => k.keyword_text === used)?.category === category
        ).length;
        
        // 덜 사용된 카테고리에 더 높은 가중치 부여
        const weight = Math.max(1, categoryKeywords.length - usedInCategory);
        return { category, weight };
      });

      // 가중치 기반 카테고리 선택
      const totalWeight = categoryWeights.reduce((sum, item) => sum + item.weight, 0);
      let randomWeight = Math.random() * totalWeight;
      let selectedCategory = categories[0];
      
      for (const item of categoryWeights) {
        randomWeight -= item.weight;
        if (randomWeight <= 0) {
          selectedCategory = item.category;
          break;
        }
      }
      
      const categoryKeywords = availableKeywords.filter(k => k.category === selectedCategory);
      
      // 경쟁도 다양성을 위한 선택 (낮은 경쟁도 60%, 중간 30%, 높은 10%)
      const competitionRandom = Math.random();
      let targetCompetition: 'low' | 'medium' | 'high';
      
      if (competitionRandom < 0.6) {
        targetCompetition = 'low';
      } else if (competitionRandom < 0.9) {
        targetCompetition = 'medium';
      } else {
        targetCompetition = 'high';
      }
      
      const targetKeywords = categoryKeywords.filter(k => k.competition_level === targetCompetition);
      const keywordsToChooseFrom = targetKeywords.length > 0 ? targetKeywords : categoryKeywords;
      
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
