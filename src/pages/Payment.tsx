import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { useAuth } from '@/hooks/useAuth';

const tiers = [
  {
    name: '무료',
    id: 'free',
    href: '#',
    priceMonthly: '$0',
    description: '간단한 사용자를 위한 기본 기능.',
    features: ['최대 3개의 프로젝트', '커뮤니티 지원', '기본 보안 업데이트'],
    mostPopular: false,
  },
  {
    name: '프로',
    id: 'pro',
    href: '#',
    priceMonthly: '$15',
    description: '전문가를 위한 고급 기능.',
    features: [
      '무제한 프로젝트',
      '우선 지원',
      '고급 보안 업데이트',
      '팀 협업 도구',
    ],
    mostPopular: true,
  },
];

const Payment = () => {
  const navigate = useNavigate();
  const { session, handleLogout } = useAuth();

  if (!session) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader currentUser={session?.user?.email || 'Guest'} handleLogout={handleLogout} />
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              가격 계획
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              당신의 필요에 맞는 계획을 선택하세요
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              모든 계획에는 7일 무료 평가판이 제공됩니다. 언제든지 취소할 수 있습니다.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {tiers.map((tier) => (
                <div key={tier.id} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      {tier.mostPopular ? (
                        <Check className="h-6 w-6" aria-hidden="true" />
                      ) : (
                        <X className="h-6 w-6" aria-hidden="true" />
                      )}
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      {tier.name}
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    {tier.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
