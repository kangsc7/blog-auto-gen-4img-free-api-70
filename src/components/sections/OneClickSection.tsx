
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Target, StopCircle } from 'lucide-react';

interface OneClickSectionProps {
  isOneClickGenerating: boolean;
  handleLatestIssueOneClick: () => void;
  handleEvergreenKeywordOneClick: () => void;
  handleStopOneClick: () => void;
}

export const OneClickSection: React.FC<OneClickSectionProps> = ({
  isOneClickGenerating,
  handleLatestIssueOneClick,
  handleEvergreenKeywordOneClick,
  handleStopOneClick,
}) => {
  return (
    <Card className="shadow-md bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-700">
          <Zap className="h-5 w-5 mr-2" />
          원클릭 콘텐츠 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isOneClickGenerating ? (
          <div className="space-y-3">
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                <span className="text-orange-700 font-medium">콘텐츠 생성 중...</span>
              </div>
              <p className="text-orange-600 text-sm mt-2">키워드 → 주제 → 콘텐츠 → 이미지 순서로 진행됩니다</p>
            </div>
            <Button 
              onClick={handleStopOneClick}
              variant="destructive"
              className="w-full"
            >
              <StopCircle className="h-4 w-4 mr-2" />
              생성 중단
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={handleLatestIssueOneClick}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3 h-auto flex-col"
            >
              <div className="flex items-center justify-center w-full">
                <TrendingUp className="h-5 w-5 mr-2" />
                <span className="font-bold">최신 이슈 원클릭 생성</span>
              </div>
              <span className="text-xs mt-1 opacity-90">실시간 트렌드 키워드로 즉시 블로그 글 생성</span>
            </Button>
            
            <Button 
              onClick={handleEvergreenKeywordOneClick}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 h-auto flex-col"
            >
              <div className="flex items-center justify-center w-full">
                <Target className="h-5 w-5 mr-2" />
                <span className="font-bold">평생 키워드 원클릭 생성</span>
              </div>
              <span className="text-xs mt-1 opacity-90">장기간 검색되는 평생 키워드로 블로그 글 생성</span>
            </Button>
          </div>
        )}
        
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <strong>📝 원클릭 생성 과정:</strong>
          <br />
          1️⃣ AI가 트렌드/평생 키워드 자동 선정
          <br />
          2️⃣ 키워드 기반 주제 5개 생성
          <br />
          3️⃣ 첫 번째 주제로 블로그 글 작성
          <br />
          4️⃣ 이미지 프롬프트 생성 및 이미지 생성
        </div>
      </CardContent>
    </Card>
  );
};
