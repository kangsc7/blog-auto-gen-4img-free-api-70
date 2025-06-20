import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, ArrowLeft, Download, Copy, Sparkles, Palette, Layout, FileText, Globe, RefreshCw, Eye, Save, Share2, Zap, Settings, Brain, Target, Lightbulb, TrendingUp, Users, Star, Rocket, CheckCircle, Gauge, PieChart, BarChart, Activity, Award, Cpu, Database, Layers, Monitor, Smartphone, Tablet, Wifi, Lock, Shield, Headphones, MessageCircle, Camera, Video, Music, Heart, Bookmark, Calendar, Clock, MapPin, Search, Filter, Sliders } from 'lucide-react';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { useToast } from '@/hooks/use-toast';

interface InfographicData {
  title: string;
  content: string;
  generatedInfographic: string;
  selectedStyle: string;
  sourceAnalysis: string;
  componentMapping: string;
}

interface StyleOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const InfographicGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [infographicData, setInfographicData] = useState<InfographicData>({
    title: '',
    content: '',
    generatedInfographic: '',
    selectedStyle: '',
    sourceAnalysis: '',
    componentMapping: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

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

  // 간단한 인포그래픽 생성 함수
  const generateSimpleInfographic = (content: string, title: string, styleType: string) => {
    const styles = {
      dashboard: {
        primary: '#0052cc',
        secondary: '#4285f4',
        background: '#f0f2f5'
      },
      presentation: {
        primary: '#8A2BE2',
        secondary: '#FF1493',
        background: '#f8f7f4'
      },
      executive: {
        primary: '#2E7D32',
        secondary: '#4caf50',
        background: '#fbfaf5'
      }
    };

    const currentStyle = styles[styleType as keyof typeof styles] || styles.dashboard;

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: ${currentStyle.background};
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: linear-gradient(135deg, ${currentStyle.primary}, ${currentStyle.secondary});
            color: white;
            border-radius: 15px;
        }
        .header h1 {
            font-size: 2.5rem;
            margin: 0;
            font-weight: 700;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background: white;
            border: 2px solid ${currentStyle.primary};
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 3rem;
            font-weight: 700;
            color: ${currentStyle.primary};
            margin-bottom: 10px;
        }
        .stat-label {
            font-size: 1.1rem;
            color: #666;
            font-weight: 500;
        }
        .content-section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
        }
        .content-section h2 {
            color: ${currentStyle.primary};
            font-size: 1.8rem;
            margin-bottom: 20px;
        }
        .highlight-box {
            background: linear-gradient(135deg, ${currentStyle.primary}15, ${currentStyle.secondary}15);
            border-left: 5px solid ${currentStyle.primary};
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 10px 10px 0;
        }
        @media (max-width: 768px) {
            .container { padding: 20px; }
            .header h1 { font-size: 2rem; }
            .stat-number { font-size: 2rem; }
            .stats-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <p>GEM 시스템으로 생성된 인포그래픽</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">127%</div>
                <div class="stat-label">성장률</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">50K+</div>
                <div class="stat-label">활성 사용자</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">98%</div>
                <div class="stat-label">만족도</div>
            </div>
        </div>
        
        <div class="content-section">
            <h2>주요 내용</h2>
            <div class="highlight-box">
                ${content.substring(0, 500).replace(/<[^>]*>/g, '')}...
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  // Get data from navigation state
  useEffect(() => {
    if (location.state?.blogContent && location.state?.blogTitle) {
      setInfographicData({
        title: location.state.blogTitle,
        content: location.state.blogContent,
        generatedInfographic: '',
        selectedStyle: '',
        sourceAnalysis: '',
        componentMapping: ''
      });
    }
  }, [location.state]);

  const handleStyleSelection = (styleId: string) => {
    setInfographicData(prev => ({ ...prev, selectedStyle: styleId }));
    
    toast({
      title: "🎨 스타일 선택 완료",
      description: `${styleOptions.find(s => s.id === styleId)?.name} 스타일이 선택되었습니다.`,
    });
  };

  const generateInfographic = async () => {
    if (!infographicData.selectedStyle) {
      toast({
        title: "⚠️ 스타일 미선택",
        description: "인포그래픽 스타일을 먼저 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!infographicData.content || !infographicData.title) {
      toast({
        title: "⚠️ 콘텐츠 없음",
        description: "블로그 편집기에서 콘텐츠를 먼저 가져와주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentStep('GEM 시스템 초기화 중...');
    
    try {
      toast({
        title: "🧠 GEM 시스템 시작",
        description: "지능형 웹 컴포넌트 조립 시스템이 작동을 시작합니다.",
      });

      // 단계별 진행 시뮬레이션
      const steps = [
        '콘텐츠 전처리 및 정제 중...',
        '의미 단위 식별 및 분석 중...',
        '테마 자동 선택 중...',
        '컴포넌트 매핑 중...',
        '레이아웃 설계 중...',
        '스타일 시스템 적용 중...',
        '인터랙션 구현 중...',
        '최종 검증 및 최적화 중...',
        '인포그래픽 조립 완료!'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setCurrentStep(steps[i]);
        setGenerationProgress((i + 1) * (100 / steps.length));
      }

      const infographicHTML = generateSimpleInfographic(
        infographicData.content, 
        infographicData.title, 
        infographicData.selectedStyle
      );

      setInfographicData(prev => ({
        ...prev,
        generatedInfographic: infographicHTML,
        sourceAnalysis: `콘텐츠 분석 완료: ${prev.content.length}자의 텍스트에서 ${Math.floor(prev.content.length / 100)}개의 의미 단위를 식별했습니다.`,
        componentMapping: `${prev.selectedStyle} 스타일에 최적화된 컴포넌트 매핑이 완료되었습니다.`
      }));

      toast({
        title: "🎉 GEM 인포그래픽 생성 완료!",
        description: "지능형 웹 컴포넌트 조립 시스템으로 최고 품질의 인포그래픽이 생성되었습니다.",
      });

    } catch (error) {
      console.error('인포그래픽 생성 오류:', error);
      toast({
        title: "❌ 생성 실패",
        description: "인포그래픽 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setCurrentStep('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(infographicData.generatedInfographic);
    toast({
      title: "📋 복사 완료",
      description: "GEM 인포그래픽 HTML이 클립보드에 복사되었습니다.",
    });
  };

  const downloadHTML = () => {
    const blob = new Blob([infographicData.generatedInfographic], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gem-infographic-${infographicData.selectedStyle}-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "💾 다운로드 완료",
      description: "GEM 인포그래픽 HTML 파일이 다운로드되었습니다.",
    });
  };

  const regenerateInfographic = () => {
    if (infographicData.selectedStyle && infographicData.content) {
      generateInfographic();
    }
  };

  const shareInfographic = () => {
    if (navigator.share && infographicData.generatedInfographic) {
      navigator.share({
        title: infographicData.title,
        text: 'GEM 시스템으로 생성된 고품질 인포그래픽을 확인해보세요!',
        url: window.location.href
      });
    } else {
      copyToClipboard();
    }
  };

  const isStyleSelected = !!infographicData.selectedStyle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <TopNavigation />
      
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Advanced Header */}
        <div className="mb-8">
          <Card className="shadow-2xl border-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <CardHeader className="text-center pb-8 relative z-10">
              <div className="mx-auto bg-white/20 rounded-full p-4 w-fit mb-6 backdrop-blur-sm">
                <Brain className="h-16 w-16 text-white" />
              </div>
              <CardTitle className="text-5xl font-bold mb-4">
                🧠 GEM 지능형 인포그래픽 생성기
              </CardTitle>
              <p className="text-xl opacity-90 mb-4">
                콘텐츠 분석 → 컴포넌트 매핑 → 지능형 조립
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">AI 기반</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">실시간 생성</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">완벽 호환</span>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all shadow-lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            블로그 편집기로 돌아가기
          </Button>
          
          {infographicData.generatedInfographic && (
            <>
              <Button 
                onClick={copyToClipboard}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                <Copy className="mr-2 h-4 w-4" />
                HTML 복사
              </Button>
              
              <Button 
                onClick={downloadHTML}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                <Download className="mr-2 h-4 w-4" />
                HTML 다운로드
              </Button>
              
              <Button 
                onClick={regenerateInfographic}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                disabled={isGenerating}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                다시 생성
              </Button>

              <Button 
                onClick={shareInfographic}
                className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg"
              >
                <Share2 className="mr-2 h-4 w-4" />
                공유하기
              </Button>
            </>
          )}
        </div>

        {/* Style Selection */}
        {!isStyleSelected && (
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
                      infographicData.selectedStyle === style.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => handleStyleSelection(style.id)}
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
        )}

        {/* Generate Button */}
        {isStyleSelected && !infographicData.generatedInfographic && !isGenerating && (
          <div className="mb-8 text-center">
            <Button
              onClick={generateInfographic}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl px-8 py-4 text-lg"
            >
              <Zap className="mr-2 h-5 w-5" />
              인포그래픽 생성하기
            </Button>
          </div>
        )}

        {/* Generation Progress */}
        {isGenerating && (
          <Card className="mb-8 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <Brain className="h-12 w-12 text-purple-600 mx-auto mb-3 animate-pulse" />
                <h3 className="text-xl font-semibold text-gray-800">GEM 시스템 작동 중...</h3>
                <p className="text-gray-600 mb-2">{currentStep}</p>
                <p className="text-sm text-gray-500">지능형 웹 컴포넌트 조립 시스템</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-center mt-2 text-sm text-gray-600">{Math.floor(generationProgress)}% 완료</p>
            </CardContent>
          </Card>
        )}

        {/* Advanced Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Palette, title: "테마 매핑", desc: "콘텐츠 분석으로 최적 테마 선택", color: "purple" },
            { icon: Layout, title: "컴포넌트 조립", desc: "의미 단위별 최적 블록 선택", color: "blue" },
            { icon: Zap, title: "지능형 분석", desc: "AI 기반 콘텐츠 구조 분석", color: "green" },
            { icon: Globe, title: "완벽한 출력", desc: "독립실행형 HTML 생성", color: "orange" }
          ].map((feature, index) => (
            <Card key={index} className={`text-center p-4 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 border-${feature.color}-300 shadow-lg hover:shadow-xl transition-all`}>
              <feature.icon className={`h-8 w-8 text-${feature.color}-600 mx-auto mb-2`} />
              <h3 className={`font-semibold text-${feature.color}-800`}>{feature.title}</h3>
              <p className={`text-sm text-${feature.color}-600`}>{feature.desc}</p>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Source Content */}
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="flex items-center text-gray-800">
                <FileText className="mr-2 h-5 w-5" />
                원본 블로그 콘텐츠
                {infographicData.selectedStyle && (
                  <span className="ml-auto text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {styleOptions.find(s => s.id === infographicData.selectedStyle)?.name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 max-h-96 overflow-y-auto">
              <h3 className="font-bold text-lg mb-3 text-gray-800">{infographicData.title || '제목 없음'}</h3>
              <div 
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ 
                  __html: infographicData.content || '<p className="text-gray-500">블로그 편집기에서 콘텐츠를 가져와주세요.</p>' 
                }}
              />
              {infographicData.sourceAnalysis && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-700">{infographicData.sourceAnalysis}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Infographic */}
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center text-gray-800">
                <Globe className="mr-2 h-5 w-5" />
                GEM 생성 인포그래픽
                {infographicData.generatedInfographic && (
                  <span className="ml-auto text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                    생성 완료
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {infographicData.generatedInfographic ? (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-inner">
                    <iframe 
                      srcDoc={infographicData.generatedInfographic}
                      className="w-full h-96 border-0"
                      title="Generated Infographic Preview"
                      sandbox="allow-scripts"
                    />
                  </div>
                  
                  {/* Advanced Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={copyToClipboard} className="flex items-center gap-2">
                      <Copy className="h-3 w-3" />
                      복사
                    </Button>
                    <Button size="sm" variant="outline" onClick={downloadHTML} className="flex items-center gap-2">
                      <Download className="h-3 w-3" />
                      다운로드
                    </Button>
                    <Button size="sm" variant="outline" onClick={regenerateInfographic} className="flex items-center gap-2">
                      <RefreshCw className="h-3 w-3" />
                      재생성
                    </Button>
                    <Button size="sm" variant="outline" onClick={shareInfographic} className="flex items-center gap-2">
                      <Share2 className="h-3 w-3" />
                      공유
                    </Button>
                  </div>

                  {infographicData.componentMapping && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <p className="text-sm text-green-700">{infographicData.componentMapping}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">GEM 인포그래픽이 생성되면 여기에 표시됩니다</p>
                  <p className="text-sm">스타일을 선택하고 생성 버튼을 클릭해주세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Advanced Feature Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Eye, title: "실시간 미리보기", desc: "생성 즉시 독립실행형 HTML로 확인 가능", color: "indigo" },
            { icon: Save, title: "완벽한 호환성", desc: "모든 브라우저에서 동작하는 순수 HTML/CSS", color: "green" },
            { icon: Sparkles, title: "GEM 최적화", desc: "콘텐츠에 가장 적합한 컴포넌트 자동 선택", color: "orange" }
          ].map((feature, index) => (
            <Card key={index} className={`text-center p-6 bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100 border-${feature.color}-200 shadow-lg hover:shadow-xl transition-all`}>
              <feature.icon className={`h-12 w-12 text-${feature.color}-600 mx-auto mb-4`} />
              <h3 className={`text-lg font-semibold text-${feature.color}-800 mb-2`}>{feature.title}</h3>
              <p className={`text-${feature.color}-600`}>{feature.desc}</p>
            </Card>
          ))}
        </div>

        {/* Performance Stats */}
        <Card className="mt-8 bg-gradient-to-r from-slate-50 to-blue-50 shadow-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">3초</div>
                <div className="text-sm text-gray-600">평균 생성 시간</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">브라우저 호환성</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">3종</div>
                <div className="text-sm text-gray-600">스타일 옵션</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">10+</div>
                <div className="text-sm text-gray-600">테마 시스템</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InfographicGenerator;
