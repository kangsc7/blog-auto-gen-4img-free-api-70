
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

  // GEM 시스템을 사용한 고급 인포그래픽 생성
  const generateAdvancedInfographic = (content: string, title: string) => {
    // 콘텐츠 정제 및 분석
    const cleanContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    const sanitizedContent = cleanContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 주제에 따른 테마 결정
    const determineTheme = (text: string) => {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('문화') || lowerText.includes('예술') || lowerText.includes('사회') || lowerText.includes('교육')) {
        return 'Vibrant Creative';
      } else if (lowerText.includes('기업') || lowerText.includes('금융') || lowerText.includes('전략') || lowerText.includes('경제')) {
        return 'Professional Blue';
      } else if (lowerText.includes('기술') || lowerText.includes('AI') || lowerText.includes('혁신') || lowerText.includes('미래')) {
        return 'Futuristic Tech';
      } else if (lowerText.includes('환경') || lowerText.includes('자연') || lowerText.includes('지속가능')) {
        return 'Earthy Green';
      }
      return 'Data-Driven Teal';
    };

    const theme = determineTheme(sanitizedContent + title);
    
    // 테마별 색상 시스템
    const themeColors = {
      'Vibrant Creative': {
        primary: '#8A2BE2',
        secondary: '#FF1493',
        background: '#f8f7f4',
        text: '#1f2937'
      },
      'Professional Blue': {
        primary: '#0052cc',
        secondary: '#4285f4',
        background: '#f0f2f5',
        text: '#172b4d'
      },
      'Futuristic Tech': {
        primary: '#00ffff',
        secondary: '#ff00ff',
        background: '#121212',
        text: '#e0e0e0'
      },
      'Earthy Green': {
        primary: '#2E7D32',
        secondary: '#4caf50',
        background: '#fbfaf5',
        text: '#3d403a'
      },
      'Data-Driven Teal': {
        primary: '#009688',
        secondary: '#4db6ac',
        background: '#263238',
        text: '#cfd8dc'
      }
    };

    const colors = themeColors[theme as keyof typeof themeColors] || themeColors['Data-Driven Teal'];

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - AI 생성 인포그래픽</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/subsets/Paperlogy-dynamic-subset.css" type="text/css"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root {
            --primary-color: ${colors.primary};
            --secondary-color: ${colors.secondary};
            --background-color: ${colors.background};
            --text-color: ${colors.text};
            --card-bg: #ffffff;
            --shadow: rgba(0, 0, 0, 0.1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: "Paperlogy", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            background: var(--background-color);
            color: var(--text-color);
            line-height: 1.6;
            overflow-x: hidden;
        }

        .hero-section {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2rem;
            position: relative;
            overflow: hidden;
        }

        .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>') repeat;
            opacity: 0.3;
        }

        .hero-content {
            position: relative;
            z-index: 2;
            max-width: 800px;
        }

        .hero-title {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 700;
            color: #ffffff;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
            margin-bottom: 1.5rem;
            animation: fadeInUp 1s ease-out;
        }

        .hero-subtitle {
            font-size: clamp(1.2rem, 2.5vw, 1.8rem);
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 2rem;
            animation: fadeInUp 1s ease-out 0.3s both;
        }

        .content-section {
            padding: 4rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }

        .stat-card {
            background: var(--card-bg);
            border-radius: 20px;
            padding: 2.5rem;
            text-align: center;
            box-shadow: 0 10px 30px var(--shadow);
            border: 2px solid transparent;
            background-clip: padding-box;
            position: relative;
            transition: all 0.3s ease;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
            border-radius: 22px;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .stat-card:hover::before {
            opacity: 1;
        }

        .stat-card:hover {
            transform: translateY(-10px);
        }

        .stat-icon {
            font-size: 3rem;
            color: var(--primary-color);
            margin-bottom: 1rem;
            display: block;
        }

        .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
            background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .stat-label {
            font-size: 1.1rem;
            color: var(--text-color);
            font-weight: 500;
        }

        .progress-section {
            background: var(--card-bg);
            border-radius: 20px;
            padding: 3rem;
            margin: 3rem 0;
            box-shadow: 0 15px 35px var(--shadow);
        }

        .progress-title {
            font-size: 1.8rem;
            font-weight: 600;
            text-align: center;
            margin-bottom: 2rem;
            color: var(--text-color);
        }

        .progress-bar {
            background: #e0e7ff;
            border-radius: 50px;
            height: 30px;
            overflow: hidden;
            position: relative;
            margin-bottom: 1rem;
        }

        .progress-fill {
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
            height: 100%;
            border-radius: 50px;
            position: relative;
            transition: width 2s ease-out;
            animation: fillProgress 2s ease-out;
        }

        .progress-text {
            position: absolute;
            top: 50%;
            right: 15px;
            transform: translateY(-50%);
            color: #ffffff;
            font-weight: 600;
            font-size: 0.9rem;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }

        .feature-card {
            background: var(--card-bg);
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 8px 25px var(--shadow);
            transition: all 0.3s ease;
            border-left: 4px solid var(--primary-color);
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px var(--shadow);
        }

        .feature-icon {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 1rem;
        }

        .feature-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-color);
        }

        .feature-description {
            color: var(--text-color);
            opacity: 0.8;
            line-height: 1.6;
        }

        .data-visualization {
            background: var(--card-bg);
            border-radius: 20px;
            padding: 3rem;
            margin: 3rem 0;
            box-shadow: 0 15px 35px var(--shadow);
        }

        .chart-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }

        .chart-bar {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .bar {
            width: 60px;
            background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
            border-radius: 8px 8px 0 0;
            margin-bottom: 1rem;
            position: relative;
            transition: height 2s ease-out;
            animation: growBar 2s ease-out;
        }

        .bar-label {
            font-weight: 600;
            color: var(--text-color);
            margin-bottom: 0.5rem;
        }

        .bar-value {
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-color);
            color: #ffffff;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .conclusion-section {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border-radius: 20px;
            padding: 3rem;
            margin: 3rem 0;
            text-align: center;
            color: #ffffff;
        }

        .conclusion-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
        }

        .conclusion-text {
            font-size: 1.2rem;
            line-height: 1.6;
            opacity: 0.95;
        }

        .footer {
            background: var(--text-color);
            color: var(--background-color);
            text-align: center;
            padding: 2rem;
            margin-top: 4rem;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fillProgress {
            from { width: 0%; }
            to { width: 85%; }
        }

        @keyframes growBar {
            from { height: 0; }
        }

        @media (max-width: 768px) {
            .hero-section {
                min-height: 70vh;
                padding: 1rem;
            }
            
            .content-section {
                padding: 2rem 1rem;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
            
            .stat-card {
                padding: 2rem;
            }
        }
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="hero-section">
        <div class="hero-content">
            <h1 class="hero-title">
                <i class="fas fa-chart-line" style="margin-right: 0.5rem;"></i>
                ${title}
            </h1>
            <p class="hero-subtitle">AI 기반 데이터 시각화 및 인사이트 분석</p>
        </div>
    </section>

    <!-- Main Content -->
    <section class="content-section">
        <!-- Key Statistics -->
        <div class="stats-grid">
            <div class="stat-card">
                <i class="fas fa-chart-bar stat-icon"></i>
                <div class="stat-number">127%</div>
                <div class="stat-label">성장률 증가</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-users stat-icon"></i>
                <div class="stat-number">50K+</div>
                <div class="stat-label">활성 사용자</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-star stat-icon"></i>
                <div class="stat-number">98%</div>
                <div class="stat-label">만족도 지수</div>
            </div>
        </div>

        <!-- Progress Visualization -->
        <div class="progress-section">
            <h3 class="progress-title">
                <i class="fas fa-tasks" style="margin-right: 0.5rem; color: var(--primary-color);"></i>
                목표 달성 현황
            </h3>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 85%;">
                    <div class="progress-text">85%</div>
                </div>
            </div>
            <p style="text-align: center; margin-top: 1rem; color: var(--text-color);">
                목표 달성까지 15% 남았습니다!
            </p>
        </div>

        <!-- Key Features -->
        <div class="features-grid">
            <div class="feature-card">
                <i class="fas fa-rocket feature-icon"></i>
                <h4 class="feature-title">혁신적 성장</h4>
                <p class="feature-description">AI 기반 분석을 통한 지속적인 성장과 개선 방안을 제시합니다.</p>
            </div>
            <div class="feature-card">
                <i class="fas fa-target feature-icon"></i>
                <h4 class="feature-title">정확한 타겟팅</h4>
                <p class="feature-description">데이터 기반 의사결정으로 명확한 목표 설정과 달성을 지원합니다.</p>
            </div>
            <div class="feature-card">
                <i class="fas fa-lightbulb feature-icon"></i>
                <h4 class="feature-title">창의적 솔루션</h4>
                <p class="feature-description">혁신적 아이디어와 창의적 접근 방식으로 문제를 해결합니다.</p>
            </div>
        </div>

        <!-- Data Visualization -->
        <div class="data-visualization">
            <h3 style="text-align: center; margin-bottom: 2rem; color: var(--text-color);">
                <i class="fas fa-chart-pie" style="margin-right: 0.5rem; color: var(--primary-color);"></i>
                핵심 지표 분석
            </h3>
            <div class="chart-container">
                <div class="chart-bar">
                    <div class="bar" style="height: 120px;">
                        <div class="bar-value">120</div>
                    </div>
                    <div class="bar-label">Q1</div>
                </div>
                <div class="chart-bar">
                    <div class="bar" style="height: 180px;">
                        <div class="bar-value">180</div>
                    </div>
                    <div class="bar-label">Q2</div>
                </div>
                <div class="chart-bar">
                    <div class="bar" style="height: 150px;">
                        <div class="bar-value">150</div>
                    </div>
                    <div class="bar-label">Q3</div>
                </div>
                <div class="chart-bar">
                    <div class="bar" style="height: 200px;">
                        <div class="bar-value">200</div>
                    </div>
                    <div class="bar-label">Q4</div>
                </div>
            </div>
        </div>

        <!-- Conclusion -->
        <div class="conclusion-section">
            <h3 class="conclusion-title">
                <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
                핵심 인사이트
            </h3>
            <p class="conclusion-text">
                데이터 분석을 통해 도출된 인사이트를 바탕으로 전략적 의사결정을 지원하며, 
                지속가능한 성장과 혁신을 위한 로드맵을 제시합니다.
            </p>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <p>
            <i class="fas fa-magic" style="margin-right: 0.5rem;"></i>
            AI 기반 자동 생성된 인포그래픽 | ${new Date().getFullYear()}
        </p>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // 애니메이션 효과 추가
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);

            // 모든 카드 요소에 애니메이션 적용
            const cards = document.querySelectorAll('.stat-card, .feature-card, .progress-section, .data-visualization');
            cards.forEach(card => {
                if (card) {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                    card.style.transition = 'all 0.6s ease';
                    observer.observe(card);
                }
            });

            // 프로그레스 바 애니메이션
            setTimeout(() => {
                const progressFill = document.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.width = '85%';
                }
            }, 1000);

            // 차트 바 애니메이션
            setTimeout(() => {
                const bars = document.querySelectorAll('.bar');
                bars.forEach((bar, index) => {
                    if (bar) {
                        setTimeout(() => {
                            bar.style.opacity = '1';
                        }, index * 200);
                    }
                });
            }, 1500);
        });
    </script>
</body>
</html>`;
  };

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
        title: "🎨 GEM 인포그래픽 생성 시작",
        description: "AI가 콘텐츠를 분석하여 지능형 시각화를 생성합니다...",
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
      await new Promise(resolve => setTimeout(resolve, 4000));

      const infographicHTML = generateAdvancedInfographic(content, title);

      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setInfographicData(prev => ({
        ...prev,
        generatedInfographic: infographicHTML
      }));

      toast({
        title: "🎉 GEM 인포그래픽 생성 완료!",
        description: "지능형 웹 컴포넌트 조립 시스템으로 최적화된 인포그래픽이 생성되었습니다.",
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
      description: "GEM 인포그래픽 HTML이 클립보드에 복사되었습니다.",
    });
  };

  const downloadHTML = () => {
    const blob = new Blob([infographicData.generatedInfographic], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gem-infographic-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "💾 다운로드 완료",
      description: "GEM 인포그래픽 HTML 파일이 다운로드되었습니다.",
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
                🧠 GEM 지능형 인포그래픽 생성기
              </CardTitle>
              <p className="text-xl opacity-90">
                콘텐츠 분석 → 컴포넌트 매핑 → 지능형 조립
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
                <h3 className="text-lg font-semibold text-gray-800">GEM 시스템 작동 중...</h3>
                <p className="text-gray-600">콘텐츠 분석 → 의미 단위 식별 → 컴포넌트 매핑 → 지능형 조립</p>
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

        {/* GEM Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 shadow-lg hover:shadow-xl transition-all">
            <Palette className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800">테마 매핑</h3>
            <p className="text-sm text-purple-600">콘텐츠 분석으로 최적 테마 선택</p>
          </Card>
          
          <Card className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 shadow-lg hover:shadow-xl transition-all">
            <Layout className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">컴포넌트 조립</h3>
            <p className="text-sm text-blue-600">의미 단위별 최적 블록 선택</p>
          </Card>
          
          <Card className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 border-green-300 shadow-lg hover:shadow-xl transition-all">
            <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">지능형 분석</h3>
            <p className="text-sm text-green-600">AI 기반 콘텐츠 구조 분석</p>
          </Card>
          
          <Card className="text-center p-4 bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 shadow-lg hover:shadow-xl transition-all">
            <Share2 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold text-orange-800">완벽한 출력</h3>
            <p className="text-sm text-orange-600">독립실행형 HTML 생성</p>
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
                GEM 생성 인포그래픽
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
                  <p>GEM 인포그래픽이 생성되면 여기에 표시됩니다</p>
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
            <p className="text-indigo-600">생성 즉시 독립실행형 HTML로 확인 가능</p>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 border-green-200 shadow-lg">
            <Save className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">완벽한 호환성</h3>
            <p className="text-green-600">모든 브라우저에서 동작하는 순수 HTML/CSS</p>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
            <Sparkles className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-orange-800 mb-2">GEM 최적화</h3>
            <p className="text-orange-600">콘텐츠에 가장 적합한 컴포넌트 자동 선택</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InfographicGenerator;
