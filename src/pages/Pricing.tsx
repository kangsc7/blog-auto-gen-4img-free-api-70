import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { useAuth } from '@/hooks/useAuth';

const Pricing = () => {
  const navigate = useNavigate();
  const { session, handleLogout } = useAuth();

  if (!session) {
    navigate('/login');
    return null;
  }

  const plans = [
    {
      name: '무료',
      price: '0원',
      features: ['기본 기능', '제한된 사용량'],
      action: '현재 플랜',
      isCurrent: true,
    },
    {
      name: '프리미엄',
      price: '9,900원',
      features: ['모든 기능', '무제한 사용량', '우선 지원'],
      action: '업그레이드',
      isCurrent: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader currentUser={session?.user?.email || 'Guest'} handleLogout={handleLogout} />
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold text-center mb-8">요금제</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <Card key={index} className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold mb-4">{plan.price}</div>
                <ul className="mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-700 mb-2">
                      {plan.isCurrent ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mr-2 text-red-500" />
                      )}
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button disabled={plan.isCurrent} className="w-full">
                  {plan.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
