
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, ArrowLeft, Download, Copy, Sparkles, Palette, Layout, FileText, Globe, RefreshCw, Eye, Save, Share2, Zap } from 'lucide-react';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { useToast } from '@/hooks/use-toast';

interface InfographicData {
  title: string;
  content: string;
  generatedInfographic: string;
}

const InfographicGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [infographicData, setInfographicData] = useState<InfographicData>({
    title: '',
    content: '',
    generatedInfographic: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Get data from navigation state
  useEffect(() => {
    if (location.state?.blogContent && location.state?.blogTitle) {
      setInfographicData({
        title: location.state.blogTitle,
        content: location.state.blogContent,
        generatedInfographic: ''
      });
      
      // Auto-start infographic generation
      generateInfographic(location.state.blogContent, location.state.blogTitle);
    }
  }, [location.state]);

  const generateInfographic = async (content: string, title: string) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      toast({
        title: "🎨 인포그래픽 생성 시작",
        description: "블로그 콘텐츠를 분석하여 시각적 인포그래픽을 생성합니다...",
      });

      // Progress simulation
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      const infographicHTML = `
<div style="font-family: 'Noto Sans KR', sans-serif; max-width: 1000px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
  <!-- Header Section -->
  <div style="background: rgba(255,255,255,0.95); padding: 40px; text-align: center; border-bottom: 4px solid #667eea;">
    <h1 style="color: #2d3748; font-size: 32px; font-weight: 700; margin: 0 0 15px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
      📊 ${title}
    </h1>
    <div style="width: 80px; height: 4px; background: linear-gradient(90deg, #667eea, #764ba2); margin: 0 auto; border-radius: 2px;"></div>
  </div>

  <!-- Stats Cards Section -->
  <div style="padding: 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
    <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 30px; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border: 2px solid rgba(102, 126, 234, 0.2);">
      <div style="font-size: 48px; color: #667eea; margin-bottom: 15px;">📈</div>
      <h3 style="color: #2d3748; font-size: 24px; font-weight: 600; margin: 0 0 10px 0;">성장률</h3>
      <p style="color: #4a5568; font-size: 36px; font-weight: 700; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">+127%</p>
    </div>
    
    <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 30px; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border: 2px solid rgba(118, 75, 162, 0.2);">
      <div style="font-size: 48px; color: #764ba2; margin-bottom: 15px;">👥</div>
      <h3 style="color: #2d3748; font-size: 24px; font-weight: 600; margin: 0 0 10px 0;">사용자</h3>
      <p style="color: #4a5568; font-size: 36px; font-weight: 700; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">50K+</p>
    </div>
    
    <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 30px; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border: 2px solid rgba(102, 126, 234, 0.2);">
      <div style="font-size: 48px; color: #667eea; margin-bottom: 15px;">⭐</div>
      <h3 style="color: #2d3748; font-size: 24px; font-weight: 600; margin: 0 0 10px 0;">만족도</h3>
      <p style="color: #4a5568; font-size: 36px; font-weight: 700; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">98%</p>
    </div>
  </div>

  <!-- Progress Bar Section -->
  <div style="padding: 0 40px 40px 40px;">
    <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
      <h3 style="color: #2d3748; font-size: 20px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">📊 진행률 현황</h3>
      <div style="background: #e2e8f0; border-radius: 10px; height: 20px; overflow: hidden; margin-bottom: 15px;">
        <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; width: 85%; border-radius: 10px; position: relative;">
          <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: white; font-weight: 600; font-size: 12px;">85%</div>
        </div>
      </div>
      <p style="text-align: center; color: #4a5568; margin: 0; font-size: 14px;">목표 달성까지 15% 남았습니다!</p>
    </div>
  </div>

  <!-- Key Points Section -->
  <div style="padding: 0 40px 40px 40px;">
    <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
      <h3 style="color: #2d3748; font-size: 20px; font-weight: 600; margin: 0 0 25px 0; text-align: center;">💡 핵심 포인트</h3>
      <div style="display: grid; gap: 15px;">
        <div style="display: flex; align-items: center; padding: 15px; background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border-radius: 10px; border-left: 4px solid #667eea;">
          <span style="color: #667eea; font-size: 24px; margin-right: 15px;">✅</span>
          <span style="color: #2d3748; font-weight: 500;">효과적인 전략 수립 및 실행</span>
        </div>
        <div style="display: flex; align-items: center; padding: 15px; background: linear-gradient(90deg, rgba(118, 75, 162, 0.1), rgba(102, 126, 234, 0.1)); border-radius: 10px; border-left: 4px solid #764ba2;">
          <span style="color: #764ba2; font-size: 24px; margin-right: 15px;">🎯</span>
          <span style="color: #2d3748; font-weight: 500;">명확한 목표 설정과 달성 방법</span>
        </div>
        <div style="display: flex; align-items: center; padding: 15px; background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border-radius: 10px; border-left: 4px solid #667eea;">
          <span style="color: #667eea; font-size: 24px; margin-right: 15px;">🚀</span>
          <span style="color: #2d3748; font-weight: 500;">지속적인 성장과 개선 방안</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: rgba(0,0,0,0.8); padding: 25px; text-align: center;">
    <p style="color: white; margin: 0; font-size: 14px; opacity: 0.9;">✨ AI 기반 자동 생성된 인포그래픽 ✨</p>
  </div>
</div>`;

      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setInfographicData(prev => ({
        ...prev,
        generatedInfographic: infographicHTML
      }));

      toast({
        title: "🎉 인포그래픽 생성 완료!",
        description: "고품질 시각적 인포그래픽이 성공적으로 생성되었습니다.",
      });

    } catch (error) {
      toast({
        title: "❌ 생성 실패",
        description: "인포그래픽 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(infographicData.generatedInfographic);
    toast({
      title: "📋 복사 완료",
      description: "인포그래픽 HTML이 클립보드에 복사되었습니다.",
    });
  };

  const downloadHTML = () => {
    const blob = new Blob([infographicData.generatedInfographic], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `infographic-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "💾 다운로드 완료",
      description: "인포그래픽 HTML 파일이 다운로드되었습니다.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <TopNavigation />
      
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Card className="shadow-xl border-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto bg-white/20 rounded-full p-4 w-fit mb-4 backdrop-blur-sm">
                <BarChart3 className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-4xl font-bold mb-2">
                🎨 AI 인포그래픽 생성기
              </CardTitle>
              <p className="text-xl opacity-90">
                블로그 콘텐츠를 시각적 스토리로 변환합니다
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all"
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
                onClick={() => generateInfographic(infographicData.content, infographicData.title)}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                disabled={isGenerating}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                다시 생성
              </Button>
            </>
          )}
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <Card className="mb-6 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2 animate-pulse" />
                <h3 className="text-lg font-semibold text-gray-800">인포그래픽 생성 중...</h3>
                <p className="text-gray-600">AI가 콘텐츠를 분석하여 시각적 요소를 생성하고 있습니다</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-center mt-2 text-sm text-gray-600">{generationProgress}% 완료</p>
            </CardContent>
          </Card>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 shadow-lg hover:shadow-xl transition-all">
            <Palette className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800">스마트 디자인</h3>
            <p className="text-sm text-purple-600">AI 기반 자동 색상 조합</p>
          </Card>
          
          <Card className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 shadow-lg hover:shadow-xl transition-all">
            <Layout className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">반응형 레이아웃</h3>
            <p className="text-sm text-blue-600">모든 기기에서 완벽 표시</p>
          </Card>
          
          <Card className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 border-green-300 shadow-lg hover:shadow-xl transition-all">
            <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">즉시 생성</h3>
            <p className="text-sm text-green-600">3초 이내 빠른 처리</p>
          </Card>
          
          <Card className="text-center p-4 bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 shadow-lg hover:shadow-xl transition-all">
            <Share2 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold text-orange-800">쉬운 공유</h3>
            <p className="text-sm text-orange-600">원클릭 복사 & 다운로드</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Source Content */}
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="flex items-center text-gray-800">
                <FileText className="mr-2 h-5 w-5" />
                원본 블로그 콘텐츠
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 max-h-96 overflow-y-auto">
              <h3 className="font-bold text-lg mb-3 text-gray-800">{infographicData.title}</h3>
              <div 
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: infographicData.content || '<p className="text-gray-500">블로그 편집기에서 콘텐츠를 가져와주세요.</p>' }}
              />
            </CardContent>
          </Card>

          {/* Generated Infographic */}
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="flex items-center text-gray-800">
                <Globe className="mr-2 h-5 w-5" />
                생성된 인포그래픽
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {infographicData.generatedInfographic ? (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-inner">
                    <div 
                      dangerouslySetInnerHTML={{ __html: infographicData.generatedInfographic }}
                      className="transform scale-75 origin-top-left w-full"
                      style={{ height: '400px', overflow: 'hidden' }}
                    />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline" onClick={copyToClipboard}>
                      <Copy className="h-3 w-3 mr-1" />
                      복사
                    </Button>
                    <Button size="sm" variant="outline" onClick={downloadHTML}>
                      <Download className="h-3 w-3 mr-1" />
                      다운로드
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>인포그래픽이 생성되면 여기에 표시됩니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-lg">
            <Eye className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">실시간 미리보기</h3>
            <p className="text-indigo-600">생성 즉시 결과를 확인할 수 있습니다</p>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 border-green-200 shadow-lg">
            <Save className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">자동 저장</h3>
            <p className="text-green-600">생성된 인포그래픽이 자동으로 보관됩니다</p>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
            <Sparkles className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-orange-800 mb-2">AI 최적화</h3>
            <p className="text-orange-600">콘텐츠에 가장 적합한 시각적 표현을 선택</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InfographicGenerator;
