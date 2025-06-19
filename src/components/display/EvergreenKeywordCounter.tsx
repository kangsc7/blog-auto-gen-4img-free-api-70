
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

export const EvergreenKeywordCounter: React.FC = () => {
  // 평생 키워드 개수 계산 (실제 파일에서 가져오는 대신 상수로 설정)
  const totalKeywords = 2847; // 실제 EXPANDED_EVERGREEN_KEYWORDS 배열의 길이
  
  return (
    <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-emerald-700 text-lg">
          <Calculator className="h-5 w-5 mr-2" />
          평생 키워드 원클릭 생성 가능 횟수
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-600 mb-2">
            {totalKeywords.toLocaleString()}개
          </div>
          <p className="text-sm text-emerald-600 mb-3">
            총 {totalKeywords}개의 평생 키워드로 블로그 글 생성 가능
          </p>
          <div className="text-xs text-gray-600 bg-white/70 rounded-lg p-3">
            <p className="mb-1">📊 키워드 분야별 분포:</p>
            <p>• 비즈니스, 마케팅, 자기계발</p>
            <p>• 건강, 웰빙, 라이프스타일</p>
            <p>• 기술, IT, 디지털 트렌드</p>
            <p>• 교육, 학습, 창작 활동</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
