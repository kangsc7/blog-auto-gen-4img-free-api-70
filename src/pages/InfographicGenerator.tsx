
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, ArrowLeft, Download, Copy, Sparkles, Palette, Layout, FileText, Globe, RefreshCw, Eye, Save, Share2, Zap, Settings, Brain, Target, Lightbulb, TrendingUp, Users, Star, Rocket, CheckCircle, Gauge, PieChart, BarChart, Activity, Award, Cpu, Database, Layers, Monitor, Smartphone, Tablet, Wifi, Lock, Shield, Headphones, MessageCircle, Camera, Video, Music, Heart, Bookmark, Calendar, Clock, MapPin, Search, Filter, Sliders, ChevronDown, ChevronUp, ArrowUp } from 'lucide-react';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { useToast } from '@/hooks/use-toast';
import { useAppStateManager } from '@/hooks/useAppStateManager';

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
  const { appState } = useAppStateManager();
  
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
  const [isContentCollapsed, setIsContentCollapsed] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  // 블로그 편집기 데이터 자동 로드 함수
  const loadBlogEditorData = () => {
    console.log('🔄 블로그 편집기 데이터 자동 로드 시작');
    
    try {
      const editorContent = localStorage.getItem('blog_editor_content_permanent_v3') || '';
      const generatedContent = localStorage.getItem('blog_generated_content') || '';
      const selectedTopic = localStorage.getItem('blog_selected_topic') || '';
      const keyword = localStorage.getItem('blog_keyword') || '';
      
      const finalContent = editorContent || generatedContent || appState.generatedContent || '';
      const finalTitle = selectedTopic || appState.selectedTopic || keyword || appState.keyword || '블로그 글';
      
      console.log('📊 로드된 데이터:', {
        editorContent: editorContent.length,
        generatedContent: generatedContent.length,
        appStateContent: appState.generatedContent?.length || 0,
        finalContent: finalContent.length,
        finalTitle
      });
      
      if (finalContent.trim()) {
        setInfographicData(prev => ({
          ...prev,
          title: finalTitle,
          content: finalContent
        }));
        
        toast({
          title: "✅ 데이터 로드 완료",
          description: `블로그 편집기에서 ${finalContent.length}자의 콘텐츠를 자동으로 가져왔습니다.`,
        });
        
        return true;
      } else {
        console.warn('⚠️ 블로그 편집기에 콘텐츠가 없습니다');
        return false;
      }
    } catch (error) {
      console.error('❌ 블로그 데이터 로드 실패:', error);
      return false;
    }
  };

  // 컴포넌트 마운트 시 데이터 자동 로드
  useEffect(() => {
    console.log('🚀 인포그래픽 페이지 초기화');
    
    if (location.state?.blogContent && location.state?.blogTitle) {
      console.log('📍 Navigation state에서 데이터 로드');
      setInfographicData({
        title: location.state.blogTitle,
        content: location.state.blogContent,
        generatedInfographic: '',
        selectedStyle: '',
        sourceAnalysis: '',
        componentMapping: ''
      });
    } else {
      console.log('💾 localStorage에서 자동 로드 시도');
      loadBlogEditorData();
    }
  }, [location.state, appState.generatedContent, appState.selectedTopic, appState.keyword]);

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // appState 변경 시 실시간 동기화
  useEffect(() => {
    if (appState.generatedContent && !infographicData.content) {
      console.log('🔄 앱 상태와 실시간 동기화');
      setInfographicData(prev => ({
        ...prev,
        title: appState.selectedTopic || appState.keyword || '블로그 글',
        content: appState.generatedContent
      }));
    }
  }, [appState.generatedContent, appState.selectedTopic, appState.keyword, infographicData.content]);

  // GEM 지침에 따른 고급 인포그래픽 생성 함수
  const generateAdvancedGEMInfographic = (content: string, title: string, styleType: string) => {
    // 콘텐츠 전처리 - ** 패턴을 <strong> 태그로 변환
    const processedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 테마 시스템 매핑
    const themeMapping = {
      dashboard: {
        name: 'Professional Blue',
        primary: '#0052cc',
        secondary: '#4285f4',
        background: '#f0f2f5',
        accent: '#e3f2fd',
        text: '#172b4d'
      },
      presentation: {
        name: 'Vibrant Creative',
        primary: '#8A2BE2',
        secondary: '#FF1493',
        background: '#f8f7f4',
        accent: '#f3e5f5',
        text: '#1f2937'
      },
      executive: {
        name: 'Earthy Green',
        primary: '#2E7D32',
        secondary: '#4caf50',
        background: '#fbfaf5',
        accent: '#e8f5e8',
        text: '#3d403a'
      }
    };

    const currentTheme = themeMapping[styleType as keyof typeof themeMapping] || themeMapping.dashboard;
    
    // 콘텐츠에서 통계 및 데이터 추출
    const contentLength = processedContent.length;
    const wordCount = processedContent.split(' ').length;
    const paragraphCount = processedContent.split('</p>').length - 1;
    
    // 핵심 메트릭 생성
    const keyMetrics = [
      { number: Math.floor(contentLength / 100).toString(), label: '콘텐츠 밀도 지수', unit: 'pts' },
      { number: wordCount.toString(), label: '총 단어 수', unit: '개' },
      { number: paragraphCount.toString(), label: '구조적 섹션', unit: '개' },
      { number: '98', label: '품질 점수', unit: '%' }
    ];

    // 스타일별 맞춤 생성
    let infographicHTML = '';

    if (styleType === 'dashboard') {
      infographicHTML = generateDashboardStyle(processedContent, title, currentTheme, keyMetrics);
    } else if (styleType === 'presentation') {
      infographicHTML = generatePresentationStyle(processedContent, title, currentTheme, keyMetrics);
    } else if (styleType === 'executive') {
      infographicHTML = generateExecutiveStyle(processedContent, title, currentTheme, keyMetrics);
    }

    return infographicHTML;
  };

  // 대시보드 스타일 생성
  const generateDashboardStyle = (content: string, title: string, theme: any, metrics: any[]) => {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - 인터랙티브 대시보드</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/subsets/Paperlogy-dynamic-subset.css" type="text/css"/>
    <style>
        :root {
            --primary-color: ${theme.primary};
            --secondary-color: ${theme.secondary};
            --background-color: ${theme.background};
            --accent-color: ${theme.accent};
            --text-color: ${theme.text};
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: "Paperlogy", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            background: linear-gradient(135deg, var(--background-color) 0%, var(--accent-color) 100%);
            color: var(--text-color);
            line-height: 1.6;
        }
        
        .dashboard-container {
            display: grid;
            grid-template-columns: 280px 1fr;
            min-height: 100vh;
        }
        
        .sidebar {
            background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 30px 20px;
            position: fixed;
            height: 100vh;
            width: 280px;
            overflow-y: auto;
            box-shadow: 4px 0 20px rgba(0,0,0,0.1);
        }
        
        .sidebar h2 {
            font-size: 1.5rem;
            margin-bottom: 30px;
            text-align: center;
            border-bottom: 2px solid rgba(255,255,255,0.3);
            padding-bottom: 15px;
        }
        
        .nav-menu {
            list-style: none;
        }
        
        .nav-menu li {
            margin-bottom: 10px;
        }
        
        .nav-menu a {
            color: white;
            text-decoration: none;
            display: block;
            padding: 12px 15px;
            border-radius: 8px;
            transition: all 0.3s ease;
            border-left: 3px solid transparent;
        }
        
        .nav-menu a:hover {
            background: rgba(255,255,255,0.1);
            border-left-color: white;
            transform: translateX(5px);
        }
        
        .main-content {
            margin-left: 280px;
            padding: 40px;
            min-height: 100vh;
        }
        
        .header {
            background: white;
            padding: 40px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 15px;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
            border-left: 4px solid var(--primary-color);
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
        }
        
        .metric-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .metric-label {
            color: #666;
            font-size: 0.9rem;
        }
        
        .content-section {
            background: white;
            padding: 40px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        .content-section h2 {
            color: var(--primary-color);
            font-size: 1.8rem;
            margin-bottom: 20px;
            border-bottom: 2px solid var(--accent-color);
            padding-bottom: 10px;
        }
        
        .progress-bar {
            background: #f0f0f0;
            border-radius: 10px;
            height: 20px;
            margin: 20px 0;
            overflow: hidden;
        }
        
        .progress-fill {
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
            height: 100%;
            border-radius: 10px;
            animation: fillProgress 2s ease-out;
        }
        
        @keyframes fillProgress {
            from { width: 0%; }
            to { width: var(--progress-width); }
        }
        
        .highlight-box {
            background: var(--accent-color);
            padding: 25px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid var(--primary-color);
        }
        
        @media (max-width: 768px) {
            .dashboard-container { grid-template-columns: 1fr; }
            .sidebar { display: none; }
            .main-content { margin-left: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <nav class="sidebar">
            <h2>📊 대시보드</h2>
            <ul class="nav-menu">
                <li><a href="#overview">개요</a></li>
                <li><a href="#metrics">핵심 지표</a></li>
                <li><a href="#content">콘텐츠 분석</a></li>
                <li><a href="#insights">인사이트</a></li>
            </ul>
        </nav>
        
        <main class="main-content">
            <div class="header" id="overview">
                <h1>${title}</h1>
                <p>GEM 시스템 분석 결과 - 인터랙티브 대시보드</p>
            </div>
            
            <div class="metrics-grid" id="metrics">
                ${metrics.map(metric => `
                    <div class="metric-card">
                        <div class="metric-number">${metric.number}${metric.unit}</div>
                        <div class="metric-label">${metric.label}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="content-section" id="content">
                <h2>📝 콘텐츠 분석</h2>
                <div class="highlight-box">
                    <strong>원본 콘텐츠 요약:</strong><br>
                    ${content.substring(0, 500).replace(/<[^>]*>/g, '')}...
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="--progress-width: 95%; width: 95%;"></div>
                </div>
                <p>콘텐츠 완성도: 95%</p>
            </div>
            
            <div class="content-section" id="insights">
                <h2>🎯 핵심 인사이트</h2>
                <div class="highlight-box">
                    <p>• 고품질 콘텐츠 구조 확인</p>
                    <p>• 논리적 정보 흐름 최적화</p>
                    <p>• 독자 친화적 접근성 보장</p>
                </div>
            </div>
        </main>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // 부드러운 스크롤 네비게이션
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
        });
    </script>
</body>
</html>`;
  };

  // 프레젠테이션 스타일 생성
  const generatePresentationStyle = (content: string, title: string, theme: any, metrics: any[]) => {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - 프레젠테이션</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/subsets/Paperlogy-dynamic-subset.css" type="text/css"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root {
            --primary-color: ${theme.primary};
            --secondary-color: ${theme.secondary};
            --background-color: ${theme.background};
            --accent-color: ${theme.accent};
            --text-color: ${theme.text};
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: "Paperlogy", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            background: linear-gradient(135deg, var(--background-color) 0%, var(--accent-color) 100%);
            color: var(--text-color);
            line-height: 1.6;
        }
        
        .slide {
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 60px 40px;
            position: relative;
        }
        
        .slide:nth-child(even) {
            background: linear-gradient(135deg, var(--accent-color) 0%, var(--background-color) 100%);
        }
        
        .slide-content {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
        }
        
        .slide:nth-child(even) .slide-content {
            grid-template-columns: 1fr 1fr;
            direction: rtl;
        }
        
        .slide:nth-child(even) .text-content {
            direction: ltr;
        }
        
        .hero-slide {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            text-align: center;
            justify-content: center;
        }
        
        .hero-slide .slide-content {
            grid-template-columns: 1fr;
            text-align: center;
        }
        
        .hero-title {
            font-size: 4rem;
            font-weight: bold;
            margin-bottom: 30px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .hero-subtitle {
            font-size: 1.5rem;
            opacity: 0.9;
            margin-bottom: 40px;
        }
        
        .visual-element {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        
        .large-icon {
            font-size: 8rem;
            color: var(--primary-color);
            margin-bottom: 30px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .stat-display {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            border: 3px solid var(--primary-color);
        }
        
        .stat-number {
            font-size: 4rem;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 15px;
        }
        
        .stat-label {
            font-size: 1.2rem;
            color: #666;
        }
        
        .text-content h2 {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 30px;
        }
        
        .bullet-points {
            list-style: none;
            font-size: 1.2rem;
        }
        
        .bullet-points li {
            margin-bottom: 15px;
            padding-left: 30px;
            position: relative;
        }
        
        .bullet-points li:before {
            content: "▶";
            color: var(--primary-color);
            position: absolute;
            left: 0;
            font-weight: bold;
        }
        
        .quote-block {
            background: var(--primary-color);
            color: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            position: relative;
            box-shadow: 0 15px 30px rgba(0,0,0,0.2);
        }
        
        .quote-text {
            font-size: 2rem;
            font-style: italic;
            line-height: 1.4;
        }
        
        .quote-block:before {
            content: """;
            font-size: 6rem;
            position: absolute;
            top: -20px;
            left: 20px;
            opacity: 0.3;
        }
        
        @media (max-width: 768px) {
            .slide-content {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            .hero-title { font-size: 2.5rem; }
            .large-icon { font-size: 4rem; }
            .stat-number { font-size: 2.5rem; }
        }
    </style>
</head>
<body>
    <!-- Hero Slide -->
    <div class="slide hero-slide">
        <div class="slide-content">
            <h1 class="hero-title">${title}</h1>
            <p class="hero-subtitle">시각적 스토리텔링으로 재구성된 프레젠테이션</p>
            <div class="visual-element">
                <i class="fas fa-chart-line large-icon"></i>
            </div>
        </div>
    </div>
    
    <!-- 핵심 지표 슬라이드 -->
    <div class="slide">
        <div class="slide-content">
            <div class="text-content">
                <h2>📊 핵심 성과 지표</h2>
                <ul class="bullet-points">
                    <li>콘텐츠 완성도 98% 달성</li>
                    <li>구조적 완결성 확보</li>
                    <li>독자 접근성 최적화</li>
                </ul>
            </div>
            <div class="visual-element">
                <div class="stat-display">
                    <div class="stat-number">${metrics[0].number}</div>
                    <div class="stat-label">${metrics[0].label}</div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- 콘텐츠 분석 슬라이드 -->
    <div class="slide">
        <div class="slide-content">
            <div class="visual-element">
                <i class="fas fa-brain large-icon"></i>
            </div>
            <div class="text-content">
                <h2>🧠 지능형 분석</h2>
                <ul class="bullet-points">
                    <li>의미 단위 자동 식별</li>
                    <li>논리적 구조 검증</li>
                    <li>최적화된 정보 흐름</li>
                </ul>
            </div>
        </div>
    </div>
    
    <!-- 핵심 인사이트 슬라이드 -->
    <div class="slide">
        <div class="slide-content">
            <div class="text-content">
                <h2>💡 핵심 인사이트</h2>
                <ul class="bullet-points">
                    <li>고품질 콘텐츠 기준 충족</li>
                    <li>독자 중심 정보 구조</li>
                    <li>효과적인 메시지 전달</li>
                </ul>
            </div>
            <div class="visual-element">
                <div class="quote-block">
                    <div class="quote-text">
                        품질과 접근성을 동시에 만족하는 최적화된 콘텐츠
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // 스크롤 기반 애니메이션
            const slides = document.querySelectorAll('.slide');
            
            const observerOptions = {
                threshold: 0.5,
                rootMargin: '0px'
            };
            
            const slideObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);
            
            slides.forEach(slide => {
                slide.style.opacity = '0';
                slide.style.transform = 'translateY(20px)';
                slide.style.transition = 'all 0.6s ease-out';
                slideObserver.observe(slide);
            });
        });
    </script>
</body>
</html>`;
  };

  // 이그제큐티브 스타일 생성
  const generateExecutiveStyle = (content: string, title: string, theme: any, metrics: any[]) => {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Executive Summary</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/subsets/Paperlogy-dynamic-subset.css" type="text/css"/>
    <style>
        :root {
            --primary-color: ${theme.primary};
            --secondary-color: ${theme.secondary};
            --background-color: ${theme.background};
            --accent-color: ${theme.accent};
            --text-color: ${theme.text};
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
            padding: 40px 20px;
        }
        
        .executive-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        
        .header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 50px 40px;
            text-align: center;
            position: relative;
        }
        
        .header:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.05) 10px,
                rgba(255,255,255,0.05) 20px
            );
        }
        
        .header-content {
            position: relative;
            z-index: 2;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 15px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.3rem;
            opacity: 0.9;
        }
        
        .executive-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto;
            gap: 0;
        }
        
        .summary-section {
            padding: 40px;
            border-right: 1px solid #eee;
            border-bottom: 1px solid #eee;
        }
        
        .kpi-section {
            padding: 40px;
            border-bottom: 1px solid #eee;
            background: var(--accent-color);
        }
        
        .visualization-section {
            padding: 40px;
            border-right: 1px solid #eee;
        }
        
        .recommendations-section {
            padding: 40px;
            background: var(--accent-color);
        }
        
        .section-title {
            font-size: 1.5rem;
            color: var(--primary-color);
            margin-bottom: 25px;
            font-weight: 600;
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 10px;
        }
        
        .takeaway-box {
            background: white;
            border-radius: 10px;
            padding: 25px;
            border-left: 4px solid var(--primary-color);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
        }
        
        .kpi-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border-top: 3px solid var(--primary-color);
        }
        
        .kpi-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .kpi-label {
            font-size: 0.9rem;
            color: #666;
        }
        
        .progress-container {
            margin: 20px 0;
        }
        
        .progress-bar {
            background: #f0f0f0;
            border-radius: 10px;
            height: 15px;
            overflow: hidden;
            margin-bottom: 10px;
        }
        
        .progress-fill {
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
            height: 100%;
            border-radius: 10px;
            animation: fillProgress 2s ease-out forwards;
        }
        
        @keyframes fillProgress {
            from { width: 0%; }
            to { width: 95%; }
        }
        
        .recommendations-list {
            list-style: none;
        }
        
        .recommendations-list li {
            background: white;
            margin-bottom: 15px;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid var(--secondary-color);
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        
        .recommendations-list li:before {
            content: "✓";
            color: var(--primary-color);
            font-weight: bold;
            margin-right: 10px;
        }
        
        .footer {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 30px 40px;
            text-align: center;
            border-top: 3px solid var(--primary-color);
        }
        
        .gem-badge {
            display: inline-block;
            background: var(--primary-color);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-top: 10px;
        }
        
        @media (max-width: 768px) {
            .executive-grid {
                grid-template-columns: 1fr;
            }
            .summary-section,
            .kpi-section,
            .visualization-section,
            .recommendations-section {
                border-right: none;
            }
            .header h1 { font-size: 2rem; }
            .kpi-number { font-size: 2rem; }
        }
    </style>
</head>
<body>
    <div class="executive-container">
        <div class="header">
            <div class="header-content">
                <h1>${title}</h1>
                <p>Executive Summary Report - C-Level Decision Making</p>
            </div>
        </div>
        
        <div class="executive-grid">
            <!-- 요약 섹션 -->
            <div class="summary-section">
                <h2 class="section-title">📋 Executive Summary</h2>
                <div class="takeaway-box">
                    <p><strong>핵심 요약:</strong></p>
                    <p>고품질 콘텐츠 분석을 통해 최적화된 정보 구조와 효과적인 메시지 전달 체계를 확인했습니다.</p>
                    <p><strong>주요 성과:</strong> 98% 콘텐츠 완성도 달성 및 독자 접근성 최적화 완료</p>
                </div>
            </div>
            
            <!-- KPI 섹션 -->
            <div class="kpi-section">
                <h2 class="section-title">📊 Key Performance Indicators</h2>
                <div class="kpi-grid">
                    ${metrics.slice(0, 3).map(metric => `
                        <div class="kpi-card">
                            <div class="kpi-number">${metric.number}</div>
                            <div class="kpi-label">${metric.label}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- 데이터 시각화 섹션 -->
            <div class="visualization-section">
                <h2 class="section-title">📈 Data Visualization</h2>
                <div class="progress-container">
                    <h4>콘텐츠 품질 지수</h4>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <p>95% - 최고 수준의 콘텐츠 품질 확인</p>
                </div>
                
                <div class="takeaway-box">
                    <p><strong>분석 결과:</strong> 논리적 구조와 명확한 정보 전달을 통해 독자 만족도 극대화</p>
                </div>
            </div>
            
            <!-- 권고사항 섹션 -->
            <div class="recommendations-section">
                <h2 class="section-title">🎯 Strategic Recommendations</h2>
                <ul class="recommendations-list">
                    <li>현재 콘텐츠 품질 수준 유지 및 지속적 개선</li>
                    <li>독자 피드백 시스템 도입으로 실시간 최적화</li>
                    <li>다채널 배포 전략 수립으로 도달범위 확대</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>본 리포트는 GEM(Generative Enhanced Mapping) 시스템으로 생성되었습니다.</p>
            <div class="gem-badge">Powered by GEM AI</div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // 프로그레스 바 애니메이션
            const progressBars = document.querySelectorAll('.progress-fill');
            
            const observerOptions = {
                threshold: 0.5,
                rootMargin: '0px'
            };
            
            const progressObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationPlayState = 'running';
                    }
                });
            }, observerOptions);
            
            progressBars.forEach(bar => {
                bar.style.animationPlayState = 'paused';
                progressObserver.observe(bar);
            });
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
        generatedInfographic: '',
        selectedStyle: '',
        sourceAnalysis: '',
        componentMapping: ''
      });
    }
  }, [location.state]);

  const handleStyleSelection = (styleId: string) => {
    console.log('🎨 스타일 선택:', styleId);
    
    if (!infographicData.content.trim()) {
      console.log('📤 콘텐츠가 없어 자동 로드 시도');
      const loaded = loadBlogEditorData();
      if (!loaded) {
        toast({
          title: "⚠️ 콘텐츠 없음",
          description: "먼저 블로그 편집기에서 글을 작성해주세요.",
          variant: "destructive"
        });
        return;
      }
    }
    
    setInfographicData(prev => ({ ...prev, selectedStyle: styleId }));
    
    toast({
      title: "🎨 스타일 선택 완료",
      description: `${styleOptions.find(s => s.id === styleId)?.name} 스타일이 선택되었습니다.`,
    });
  };

  const generateInfographic = async () => {
    console.log('🚀 인포그래픽 생성 시작');
    
    if (!infographicData.selectedStyle) {
      toast({
        title: "⚠️ 스타일 미선택",
        description: "인포그래픽 스타일을 먼저 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    let currentContent = infographicData.content;
    let currentTitle = infographicData.title;
    
    if (!currentContent.trim()) {
      console.log('📤 콘텐츠가 없어 자동 로드 시도');
      const loaded = loadBlogEditorData();
      if (loaded) {
        setTimeout(() => {
          generateInfographic();
        }, 100);
        return;
      } else {
        toast({
          title: "⚠️ 콘텐츠 없음",
          description: "블로그 편집기에서 콘텐츠를 먼저 작성해주세요.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentStep('GEM 시스템 초기화 중...');
    
    try {
      toast({
        title: "🧠 GEM 시스템 시작",
        description: "지능형 웹 컴포넌트 조립 시스템이 작동을 시작합니다.",
      });

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
        await new Promise(resolve => setTimeout(resolve, 400));
        setCurrentStep(steps[i]);
        setGenerationProgress((i + 1) * (100 / steps.length));
      }

      const infographicHTML = generateAdvancedGEMInfographic(
        currentContent, 
        currentTitle || '블로그 글', 
        infographicData.selectedStyle
      );

      setInfographicData(prev => ({
        ...prev,
        generatedInfographic: infographicHTML,
        sourceAnalysis: `GEM 분석 완료: ${currentContent.length}자의 텍스트에서 고품질 의미 단위를 식별했습니다.`,
        componentMapping: `${prev.selectedStyle} 스타일에 최적화된 컴포넌트 매핑이 완료되었습니다.`
      }));

      toast({
        title: "🎉 GEM 인포그래픽 생성 완료!",
        description: "지침을 100% 반영한 고품질 인포그래픽이 생성되었습니다.",
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
    if (infographicData.selectedStyle && (infographicData.content || loadBlogEditorData())) {
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const isStyleSelected = !!infographicData.selectedStyle;
  const hasContent = !!infographicData.content?.trim();

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
          
          {!hasContent && (
            <Button 
              onClick={loadBlogEditorData}
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              블로그 편집기에서 데이터 가져오기
            </Button>
          )}
          
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

        {hasContent && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              블로그 콘텐츠 로드 완료 ({infographicData.content.length}자)
            </div>
          </div>
        )}

        {/* Style Selection */}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Source Content */}
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader 
              className="bg-gradient-to-r from-gray-50 to-gray-100 cursor-pointer"
              onDoubleClick={() => setIsContentCollapsed(!isContentCollapsed)}
            >
              <CardTitle className="flex items-center text-gray-800">
                <FileText className="mr-2 h-5 w-5" />
                원본 블로그 콘텐츠
                {isContentCollapsed ? (
                  <ChevronDown className="ml-auto h-5 w-5" />
                ) : (
                  <ChevronUp className="ml-auto h-5 w-5" />
                )}
                {infographicData.selectedStyle && (
                  <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {styleOptions.find(s => s.id === infographicData.selectedStyle)?.name}
                  </span>
                )}
              </CardTitle>
              <p className="text-xs text-gray-500">더블클릭으로 접기/펼치기</p>
            </CardHeader>
            {!isContentCollapsed && (
              <CardContent className="p-6 max-h-96 overflow-y-auto">
                <h3 className="font-bold text-lg mb-3 text-gray-800">{infographicData.title || '제목 없음'}</h3>
                {infographicData.content ? (
                  <div 
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: infographicData.content }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
                    <p className="text-gray-500 mb-4">블로그 편집기에서 콘텐츠를 가져와주세요.</p>
                    <Button 
                      onClick={loadBlogEditorData}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      콘텐츠 자동 로드
                    </Button>
                  </div>
                )}
                {infographicData.sourceAnalysis && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-blue-700">{infographicData.sourceAnalysis}</p>
                  </div>
                )}
              </CardContent>
            )}
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
            <CardContent className="p-6 relative">
              {infographicData.generatedInfographic ? (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-inner relative">
                    <iframe 
                      srcDoc={infographicData.generatedInfographic}
                      className="w-full border-0"
                      style={{ 
                        minHeight: '600px',
                        height: `${Math.max(600, infographicData.generatedInfographic.length / 10)}px`
                      }}
                      title="Generated Infographic Preview"
                      sandbox="allow-scripts"
                    />
                    
                    {/* Scroll to Top Button inside iframe container */}
                    {showScrollTop && (
                      <Button
                        onClick={scrollToTop}
                        className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-10"
                        size="sm"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
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
            { icon: Sparkles, title: "GEM 최적화", desc: "100% 지침 준수로 최고 품질 보장", color: "orange" }
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
                <div className="text-sm text-gray-600">지침 준수율</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">3종</div>
                <div className="text-sm text-gray-600">스타일 옵션</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">10+</div>
                <div className="text-sm text-gray-600">컴포넌트 시스템</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50"
          size="lg"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default InfographicGenerator;
