
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { TopNavigation } from '@/components/layout/TopNavigation';

const InfographicGenerator = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <TopNavigation />
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto text-center shadow-lg">
          <CardHeader className="pb-6">
            <div className="mx-auto bg-green-100 rounded-full p-4 w-fit mb-4">
              <BarChart3 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">
              인포그래픽 생성
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 text-lg leading-relaxed">
              복잡한 정보를 시각적으로 이해하기 쉬운 
              인포그래픽으로 자동 변환해주는 서비스입니다.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-700 font-semibold text-xl">
                🚀 업데이트 예정~
              </p>
              <p className="text-yellow-600 mt-2">
                더 나은 서비스를 위해 열심히 개발 중입니다!
              </p>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="mt-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InfographicGenerator;
