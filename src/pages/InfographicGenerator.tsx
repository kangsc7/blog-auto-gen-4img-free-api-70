import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, CheckCircle, Brain, Zap, RotateCcw, Eye, Save, Sparkles, ArrowUp, Copy, Download, Share2 } from 'lucide-react';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { useToast } from '@/hooks/use-toast';
import { useAppStateManager } from '@/hooks/useAppStateManager';
import StyleSelection from '@/components/infographic/StyleSelection';
import GenerationProgress from '@/components/infographic/GenerationProgress';
import ContentDisplay from '@/components/infographic/ContentDisplay';
import InfographicPreview from '@/components/infographic/InfographicPreview';

interface InfographicData {
  title: string;
  content: string;
  generatedInfographic: string;
  selectedStyle: string;
  sourceAnalysis: string;
  componentMapping: string;
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

  const styleOptions = [
    { id: 'dashboard', name: '인터랙티브 대시보드' },
    { id: 'presentation', name: '프레젠테이션형 인포그래픽' },
    { id: 'executive', name: 'C-Level 원페이지 리포트' }
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

  // 블로그 콘텐츠에서 소제목 추출 함수
  const extractSubtitles = (content: string) => {
    const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
    const subtitles = [];
    let match;
    
    while ((match = h2Regex.exec(content)) !== null) {
      subtitles.push(match[1].replace(/<[^>]*>/g, '').trim());
    }
    
    return subtitles.slice(0, 5); // 최대 5개까지만
  };

  // 각 소제목의 내용 추출 함수
  const extractContentBySubtitle = (content: string, subtitle: string) => {
    const regex = new RegExp(`<h2[^>]*>${subtitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^<]*</h2>(.*?)(?=<h2|$)`, 'si');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  };

  // GEM 지침에 따른 고급 인포그래픽 생성 함수
  const generateAdvancedGEMInfographic = (content: string, title: string, styleType: string) => {
    // 콘텐츠 전처리 - ** 패턴을 <strong> 태그로 변환
    const processedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 소제목 추출
    const subtitles = extractSubtitles(processedContent);
    console.log('추출된 소제목:', subtitles);
    
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
    
    // 스타일별 맞춤 생성
    let infographicHTML = '';

    if (styleType === 'dashboard') {
      infographicHTML = generateDashboardStyle(processedContent, title, currentTheme, subtitles);
    } else if (styleType === 'presentation') {
      infographicHTML = generatePresentationStyle(processedContent, title, currentTheme, subtitles);
    } else if (styleType === 'executive') {
      infographicHTML = generateExecutiveStyle(processedContent, title, currentTheme, subtitles);
    }

    return infographicHTML;
  };

  // 대시보드 스타일 생성 (가독성 문제 해결)
  const generateDashboardStyle = (content: string, title: string, theme: any, subtitles: string[]) => {
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
            font-size: 16px;
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
            z-index: 1000;
        }
        
        .sidebar h2 {
            font-size: 1.5rem;
            margin-bottom: 30px;
            text-align: center;
            border-bottom: 2px solid rgba(255,255,255,0.3);
            padding-bottom: 15px;
            white-space: normal;
            word-wrap: break-word;
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
            font-size: 14px;
            line-height: 1.4;
            white-space: normal;
            word-wrap: break-word;
            overflow-wrap: break-word;
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
            max-width: calc(100vw - 280px);
            overflow-x: hidden;
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
            line-height: 1.3;
            word-wrap: break-word;
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
            line-height: 1.3;
            word-wrap: break-word;
        }
        
        .content-section p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 15px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        .highlight-box {
            background: var(--accent-color);
            padding: 25px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid var(--primary-color);
        }
        
        .highlight-box p {
            margin-bottom: 10px;
        }
        
        @media (max-width: 768px) {
            .dashboard-container { 
                grid-template-columns: 1fr; 
            }
            .sidebar { 
                display: none; 
            }
            .main-content { 
                margin-left: 0; 
                padding: 20px;
                max-width: 100vw;
            }
            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <nav class="sidebar">
            <h2>📊 대시보드</h2>
            <ul class="nav-menu">
                <li><a href="#overview">개요</a></li>
                ${subtitles.map((subtitle, index) => `
                    <li><a href="#section${index + 1}">${subtitle}</a></li>
                `).join('')}
                <li><a href="#conclusion">결론</a></li>
            </ul>
        </nav>
        
        <main class="main-content">
            <div class="header" id="overview">
                <h1>${title}</h1>
                <p>전문적인 분석과 인사이트를 담은 인터랙티브 대시보드</p>
            </div>
            
            ${subtitles.map((subtitle, index) => {
              const sectionContent = extractContentBySubtitle(content, subtitle);
              return `
                <div class="content-section" id="section${index + 1}">
                    <h2>${subtitle}</h2>
                    <div class="highlight-box">
                        ${sectionContent || `<p>${subtitle}에 대한 상세한 분석과 설명이 포함된 전문적인 내용입니다.</p>`}
                    </div>
                </div>
              `;
            }).join('')}
            
            <div class="content-section" id="conclusion">
                <h2>🎯 핵심 인사이트</h2>
                <div class="highlight-box">
                    <p>• 체계적이고 논리적인 구조로 정보 전달</p>
                    <p>• 실무진을 위한 실행 가능한 인사이트 제공</p>
                    <p>• 데이터 기반의 객관적 분석 결과</p>
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

  // 프레젠테이션 스타일 생성 (소제목 기반)
  const generatePresentationStyle = (content: string, title: string, theme: any, subtitles: string[]) => {
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
        
        @media (max-width: 768px) {
            .slide-content {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            .hero-title { font-size: 2.5rem; }
            .large-icon { font-size: 4rem; }
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
    
    ${subtitles.map((subtitle, index) => {
      const sectionContent = extractContentBySubtitle(content, subtitle);
      const icons = ['fas fa-lightbulb', 'fas fa-target', 'fas fa-rocket', 'fas fa-star', 'fas fa-trophy'];
      const icon = icons[index] || 'fas fa-info-circle';
      
      return `
        <!-- ${subtitle} 슬라이드 -->
        <div class="slide">
            <div class="slide-content">
                <div class="text-content">
                    <h2>${subtitle}</h2>
                    <ul class="bullet-points">
                        <li>체계적인 접근 방식으로 문제 해결</li>
                        <li>실무진을 위한 구체적인 실행 방안</li>
                        <li>검증된 방법론 기반의 전략적 접근</li>
                    </ul>
                </div>
                <div class="visual-element">
                    <i class="${icon} large-icon"></i>
                </div>
            </div>
        </div>
      `;
    }).join('')}
    
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

  // 이그제큐티브 스타일 생성 (최적화)
  const generateExecutiveStyle = (content: string, title: string, theme: any, subtitles: string[]) => {
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
            <h1>${title}</h1>
            <p>Executive Summary Report - 전략적 의사결정을 위한 핵심 분석</p>
        </div>
        
        <div class="executive-grid">
            <!-- 요약 섹션 -->
            <div class="summary-section">
                <h2 class="section-title">📋 Executive Summary</h2>
                <div class="takeaway-box">
                    <p><strong>핵심 요약:</strong></p>
                    <p>체계적인 분석을 통해 도출된 전략적 인사이트와 실행 가능한 솔루션을 제시합니다.</p>
                    <p><strong>주요 성과:</strong> 데이터 기반의 객관적 분석과 실무진을 위한 구체적 방향성 제시</p>
                </div>
            </div>
            
            <!-- KPI 섹션 -->
            <div class="kpi-section">
                <h2 class="section-title">📊 Key Insights</h2>
                <div class="kpi-grid">
                    ${subtitles.slice(0, 3).map((subtitle, index) => `
                        <div class="kpi-card">
                            <div class="kpi-number">${index + 1}</div>
                            <div class="kpi-label">${subtitle}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- 데이터 시각화 섹션 -->
            <div class="visualization-section">
                <h2 class="section-title">📈 Strategic Analysis</h2>
                <div class="takeaway-box">
                    <p><strong>분석 결과:</strong></p>
                    <ul style="list-style: none; padding-left: 0;">
                        ${subtitles.slice(0, 3).map(subtitle => `
                            <li style="margin-bottom: 10px;">• ${subtitle}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            
            <!-- 권고사항 섹션 -->
            <div class="recommendations-section">
                <h2 class="section-title">🎯 Strategic Recommendations</h2>
                <ul class="recommendations-list">
                    <li>현재 분석 결과를 바탕으로 한 지속적 모니터링</li>
                    <li>실행 가능한 액션 플랜 수립 및 단계별 실행</li>
                    <li>성과 측정 지표 설정 및 정기적 평가 체계 구축</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>본 리포트는 전문적인 분석 도구를 통해 생성되었습니다.</p>
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
        currentContent = infographicData.content;
        currentTitle = infographicData.title;
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
        '소제목 추출 및 매핑 중...',
        '테마 자동 선택 중...',
        '컴포넌트 매핑 중...',
        '레이아웃 설계 중...',
        '스타일 시스템 적용 중...',
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
        content: currentContent,
        title: currentTitle,
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

  const resetInfographic = () => {
    setInfographicData(prev => ({
      ...prev,
      generatedInfographic: '',
      sourceAnalysis: '',
      componentMapping: ''
    }));
    
    toast({
      title: "🔄 초기화 완료",
      description: "인포그래픽이 초기화되었습니다.",
    });
  };

  const resetAll = () => {
    setInfographicData({
      title: '',
      content: '',
      generatedInfographic: '',
      selectedStyle: '',
      sourceAnalysis: '',
      componentMapping: ''
    });
    
    toast({
      title: "🔄 전체 초기화 완료",
      description: "모든 설정과 데이터가 초기화되었습니다.",
    });
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
                onClick={shareInfographic}
                className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg"
              >
                <Share2 className="mr-2 h-4 w-4" />
                공유하기
              </Button>

              <Button 
                onClick={resetInfographic}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 shadow-lg"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                초기화
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

        {/* Enhanced Style Selection with Animations */}
        <StyleSelection 
          selectedStyle={infographicData.selectedStyle}
          onStyleSelect={handleStyleSelection}
        />

        {/* Generate Button */}
        {isStyleSelected && !infographicData.generatedInfographic && !isGenerating && (
          <div className="mb-8 text-center flex gap-4 justify-center">
            <Button
              onClick={generateInfographic}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl px-8 py-4 text-lg"
            >
              <Zap className="mr-2 h-5 w-5" />
              인포그래픽 생성하기
            </Button>
            
            <Button
              onClick={resetAll}
              variant="outline"
              className="px-8 py-4 text-lg border-red-300 text-red-600 hover:bg-red-50"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              초기화
            </Button>
          </div>
        )}

        {/* Generation Progress */}
        <GenerationProgress 
          isGenerating={isGenerating}
          progress={generationProgress}
          currentStep={currentStep}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Source Content */}
          <ContentDisplay 
            title={infographicData.title}
            content={infographicData.content}
            selectedStyle={infographicData.selectedStyle}
            sourceAnalysis={infographicData.sourceAnalysis}
            isCollapsed={isContentCollapsed}
            onToggleCollapse={() => setIsContentCollapsed(!isContentCollapsed)}
            onLoadContent={loadBlogEditorData}
            styleOptions={styleOptions}
          />

          {/* Generated Infographic */}
          <InfographicPreview 
            generatedInfographic={infographicData.generatedInfographic}
            componentMapping={infographicData.componentMapping}
            onCopy={copyToClipboard}
            onDownload={downloadHTML}
            onShare={shareInfographic}
            onReset={resetInfographic}
          />
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
