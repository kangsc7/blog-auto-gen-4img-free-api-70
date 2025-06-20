
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, BarChart3, Target, Palette } from 'lucide-react';

interface StyleOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface StyleSelectionProps {
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
}

const StyleSelection: React.FC<StyleSelectionProps> = ({ selectedStyle, onStyleSelect }) => {
  const styleOptions: StyleOption[] = [
    {
      id: 'dashboard',
      name: '인터랙티브 대시보드',
      description: '탐색이 용이한 고정 메뉴 구조',
      icon: <Monitor className="h-6 w-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'presentation',
      name: '프레젠테이션형 인포그래픽',
      description: '시각적 스토리텔링을 극대화한 발표 자료',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'executive',
      name: 'C-Level 원페이지 리포트',
      description: 'CEO 보고용 컨설팅 스타일의 핵심 요약',
      icon: <Target className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <Card className="mb-8 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-gray-800">
          <Palette className="inline mr-2 h-6 w-6" />
          인포그래픽 스타일 선택
        </CardTitle>
        <p className="text-center text-gray-600">
          콘텐츠 특성에 맞는 최적의 스타일을 선택해주세요
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {styleOptions.map((style) => (
            <Card 
              key={style.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-2xl border-2 ${
                selectedStyle === style.id 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => onStyleSelect(style.id)}
            >
              <CardContent className="p-6 text-center">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${style.color} flex items-center justify-center text-white mb-4`}>
                  {style.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{style.name}</h3>
                <p className="text-sm text-gray-600">{style.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleSelection;
