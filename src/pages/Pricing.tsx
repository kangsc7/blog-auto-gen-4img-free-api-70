
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ArrowLeft, Check } from 'lucide-react';
import { TopNavigation } from '@/components/layout/TopNavigation';

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: '기본 플랜',
      price: '무료',
      features: ['월 10개 글 생성', '기본 템플릿', '이메일 지원']
    },
    {
      name: '프로 플랜',
      price: '₩29,000/월',
      features: ['무제한 글 생성', '프리미엄 템플릿', '우선 지원', 'API 접근']
    },
    {
      name: '비즈니스 플랜',
      price: '₩99,000/월',
      features: ['팀 협업 기능', '커스텀 브랜딩', '전담 매니저', '고급 분석']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <TopNavigation />
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">가격 플랜</h1>
          <p className="text-xl text-gray-600">당신에게 맞는 플랜을 선택하세요</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
          {plans.map((plan, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <p className="text-3xl font-bold text-blue-600">{plan.price}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full">플랜 선택</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-2xl mx-auto text-center shadow-lg">
          <CardContent className="py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-700 font-semibold text-xl">
                🚀 업데이트 예정~
              </p>
              <p className="text-yellow-600 mt-2">
                더 나은 가격 정책을 위해 열심히 개발 중입니다!
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

export default Pricing;
