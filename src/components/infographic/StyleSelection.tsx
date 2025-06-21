
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, BarChart3, Target, Palette, ArrowDown, MousePointer2 } from 'lucide-react';

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
    <Card className="mb-8 shadow-xl bg-white/80 backdrop-blur-sm relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-pink-100/20 to-blue-100/20 animate-pulse"></div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-center text-2xl font-bold text-gray-800">
          <Palette className="inline mr-2 h-6 w-6" />
          인포그래픽 스타일 선택
        </CardTitle>
        <p className="text-center text-gray-600 mb-4">
          콘텐츠 특성에 맞는 최적의 스타일을 선택해주세요
        </p>
        
        {/* Call-to-action indicator */}
        {!selectedStyle && (
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full animate-bounce shadow-lg">
              <MousePointer2 className="h-4 w-4" />
              <span className="font-semibold">여기를 클릭하여 시작하세요!</span>
            </div>
            <div className="mt-2">
              <ArrowDown className="h-6 w-6 mx-auto text-orange-500 animate-bounce" />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {styleOptions.map((style) => (
            <Card 
              key={style.id}
              className={`cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 relative overflow-hidden group ${
                selectedStyle === style.id 
                  ? 'border-purple-500 bg-purple-50 scale-105 shadow-2xl' 
                  : 'border-gray-200 hover:border-purple-300 hover:scale-105'
              }`}
              onClick={() => onStyleSelect(style.id)}
            >
              {/* Animated border effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${style.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Glowing border animation */}
              {!selectedStyle && (
                <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-pulse opacity-30"></div>
              )}
              
              {/* Click indicator */}
              {!selectedStyle && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
              )}
              
              <CardContent className="p-6 text-center relative z-10">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${style.color} flex items-center justify-center text-white mb-4 transition-transform duration-300 group-hover:scale-110 ${
                  selectedStyle === style.id ? 'animate-pulse' : ''
                }`}>
                  {style.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 transition-colors duration-300 group-hover:text-purple-600">
                  {style.name}
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                  {style.description}
                </p>
                
                {/* Selection indicator */}
                {selectedStyle === style.id && (
                  <div className="mt-3 inline-flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-fade-in">
                    ✓ 선택됨
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Additional call-to-action for empty selection */}
        {!selectedStyle && (
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-orange-300 rounded-lg p-4 inline-block">
              <p className="text-orange-800 font-semibold mb-2">👆 위의 3가지 스타일 중 하나를 선택해주세요</p>
              <p className="text-orange-600 text-sm">선택하시면 인포그래픽 생성이 시작됩니다</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StyleSelection;
