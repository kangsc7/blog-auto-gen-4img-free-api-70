
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText, Heading2, List, Link as LinkIcon, Search, Award } from 'lucide-react';

interface SeoAnalyzerProps {
  generatedContent: string;
  keyword: string;
  selectedTopic: string;
}

const CRITERIA = {
  wordCount: { weight: 25, title: '콘텐츠 길이 (단어 수)', icon: FileText },
  keywordInTitle: { weight: 15, title: '제목에 핵심 키워드 포함', icon: Heading2 },
  keywordDensity: { weight: 20, title: '핵심 키워드 밀도', icon: Search },
  headings: { weight: 15, title: '소제목 (H2) 사용', icon: Heading2 },
  lists: { weight: 10, title: '목록 (리스트) 사용', icon: List },
  links: { weight: 15, title: '링크 사용', icon: LinkIcon },
};

const getScoreTextColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

export const SeoAnalyzer: React.FC<SeoAnalyzerProps> = ({ generatedContent, keyword, selectedTopic }) => {
  const [scores, setScores] = useState<Record<string, number>>({
    wordCount: 0,
    keywordInTitle: 0,
    keywordDensity: 0,
    headings: 0,
    lists: 0,
    links: 0,
  });

  const [debugInfo, setDebugInfo] = useState<any>({});

  const totalScore = useMemo(() => {
    return Object.entries(scores).reduce((total, [key, score]) => {
      const criteriaKey = key as keyof typeof CRITERIA;
      return total + (score / 100) * CRITERIA[criteriaKey].weight;
    }, 0);
  }, [scores]);

  useEffect(() => {
    if (!generatedContent) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(generatedContent, 'text/html');
    const textContent = doc.body.textContent || '';
    const words = textContent.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    console.log('SEO 분석 디버그 정보:');
    console.log('키워드:', keyword);
    console.log('선택된 주제:', selectedTopic);
    console.log('총 단어 수:', wordCount);
    console.log('HTML 내용 (일부):', generatedContent.substring(0, 500));

    // 1. Word Count Score - 수정된 기준 (현재 글 길이 기준 90% 목표)
    let wordCountScore = 0;
    if (wordCount >= 600) {
      wordCountScore = 100; // 600단어 이상이면 100점
    } else if (wordCount >= 500) {
      wordCountScore = 90; // 500단어 이상이면 90점
    } else if (wordCount >= 400) {
      wordCountScore = 80; // 400단어 이상이면 80점
    } else if (wordCount >= 300) {
      wordCountScore = 70; // 300단어 이상이면 70점
    } else if (wordCount >= 200) {
      wordCountScore = 50; // 200단어 이상이면 50점
    } else {
      wordCountScore = 20; // 200단어 미만은 20점
    }

    // 2. Keyword in Title Score - 개선된 로직
    let keywordInTitleScore = 0;
    if (keyword) {
      // 실제 HTML에서 제목 요소들 찾기
      const h1Elements = doc.querySelectorAll('h1');
      const h2Elements = doc.querySelectorAll('h2');
      const h3Elements = doc.querySelectorAll('h3');
      
      // 모든 제목 요소의 텍스트 수집
      const allTitles = [
        ...Array.from(h1Elements).map(el => el.textContent || ''),
        ...Array.from(h2Elements).map(el => el.textContent || ''),
        ...Array.from(h3Elements).map(el => el.textContent || ''),
        selectedTopic // 선택된 주제도 포함
      ];

      console.log('찾은 제목들:', allTitles);

      // 키워드의 핵심 부분 추출 (년도나 주요 단어)
      const keywordParts = keyword.toLowerCase().split(/\s+/).filter(part => 
        part.length > 1 && !['지급', '신청', '방법', '조건', '자격', '혜택', '정보', '안내'].includes(part)
      );

      console.log('키워드 핵심 부분들:', keywordParts);

      // 제목에서 키워드 부분이 포함되어 있는지 확인
      const titleHasKeyword = allTitles.some(title => {
        const lowerTitle = title.toLowerCase();
        return keywordParts.some(part => lowerTitle.includes(part)) || 
               lowerTitle.includes(keyword.toLowerCase());
      });

      keywordInTitleScore = titleHasKeyword ? 100 : 0;
      console.log('제목에 키워드 포함 여부:', titleHasKeyword);
    }

    // 3. Keyword Density Score - 수정된 로직 (5개 이상이면 100%)
    let keywordDensityScore = 0;
    let keywordCount = 0;
    if (keyword && wordCount > 0) {
      // 정확한 키워드 매칭과 부분 매칭 모두 고려
      const exactMatches = (textContent.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      
      // 키워드의 핵심 부분들도 카운트
      const keywordParts = keyword.toLowerCase().split(/\s+/).filter(part => 
        part.length > 2 && !['지급', '신청', '방법', '조건', '자격', '혜택', '정보', '안내'].includes(part)
      );
      
      let partialMatches = 0;
      keywordParts.forEach(part => {
        const matches = (textContent.toLowerCase().match(new RegExp(part, 'g')) || []).length;
        partialMatches += matches;
      });

      // 전체 키워드 출현 횟수 (정확한 매칭 + 부분 매칭의 일부)
      keywordCount = exactMatches + Math.floor(partialMatches * 0.3);
      
      console.log('정확한 키워드 매칭 수:', exactMatches);
      console.log('부분 키워드 매칭 수:', partialMatches);
      console.log('총 키워드 카운트:', keywordCount);
      
      // 5개 이상이면 100점, 그 이하는 비례적으로 점수 부여
      if (keywordCount >= 5) {
        keywordDensityScore = 100;
      } else if (keywordCount >= 4) {
        keywordDensityScore = 80;
      } else if (keywordCount >= 3) {
        keywordDensityScore = 60;
      } else if (keywordCount >= 2) {
        keywordDensityScore = 40;
      } else if (keywordCount >= 1) {
        keywordDensityScore = 20;
      } else {
        keywordDensityScore = 0;
      }
    }

    // 4. H2 Headings Score - HTML 구조 정확히 파싱
    const h2Elements = doc.querySelectorAll('h2');
    const h2Count = h2Elements.length;
    
    // H2 제목들의 실제 텍스트 확인
    const h2Texts = Array.from(h2Elements).map(el => el.textContent || '');
    console.log('실제 H2 제목들:', h2Texts);
    
    // H2 제목에 키워드 관련 내용이 포함되어 있는지 확인
    let h2WithKeywordCount = 0;
    if (keyword) {
      const keywordParts = keyword.toLowerCase().split(/\s+/).filter(part => 
        part.length > 2 && !['지급', '신청', '방법', '조건', '자격', '혜택', '정보', '안내'].includes(part)
      );
      
      h2Elements.forEach(h2 => {
        const h2Text = (h2.textContent || '').toLowerCase();
        const hasKeywordRelated = keywordParts.some(part => h2Text.includes(part)) || 
                                 h2Text.includes(keyword.toLowerCase());
        if (hasKeywordRelated) h2WithKeywordCount++;
      });
    }

    console.log('H2 개수:', h2Count);
    console.log('키워드 관련 H2 개수:', h2WithKeywordCount);

    // H2 점수 계산 - 7개 이상일 때 100점이 되도록 수정
    let headingsScore = 0;
    if (h2Count >= 7) {
      // 7개 이상이면 무조건 100점
      headingsScore = 100;
    } else if (h2Count >= 6) {
      // 6개면 95점 + 키워드 관련성 보너스
      headingsScore = 95 + (h2WithKeywordCount * 1);
    } else if (h2Count >= 4) {
      // 4-5개면 85점 + 키워드 관련성 보너스
      headingsScore = 85 + (h2WithKeywordCount * 3);
    } else if (h2Count >= 3) {
      // 3개면 75점 + 키워드 관련성 보너스
      headingsScore = 75 + (h2WithKeywordCount * 5);
    } else if (h2Count >= 2) {
      // 2개면 60점 + 키워드 관련성 보너스
      headingsScore = 60 + (h2WithKeywordCount * 8);
    } else if (h2Count >= 1) {
      // 1개면 40점 + 키워드 관련성 보너스
      headingsScore = 40 + (h2WithKeywordCount * 15);
    } else {
      headingsScore = 0;
    }
    headingsScore = Math.min(headingsScore, 100);

    // 5. Lists Score
    const listCount = doc.querySelectorAll('ul, ol').length;
    const listsScore = listCount > 0 ? 100 : 0;

    // 6. Links Score
    const linkCount = doc.querySelectorAll('a').length;
    const linksScore = Math.round(Math.min((linkCount / 2) * 100, 100));

    const newDebugInfo = {
      wordCount,
      keywordCount,
      h2Count,
      h2WithKeywordCount,
      h2Texts: h2Texts.join(', '),
      linkCount,
      listCount
    };

    setDebugInfo(newDebugInfo);
    console.log('최종 점수들:', {
      wordCount: wordCountScore,
      keywordInTitle: keywordInTitleScore,
      keywordDensity: keywordDensityScore,
      headings: headingsScore,
      lists: listsScore,
      links: linksScore
    });

    setScores({
      wordCount: wordCountScore,
      keywordInTitle: keywordInTitleScore,
      keywordDensity: keywordDensityScore,
      headings: headingsScore,
      lists: listsScore,
      links: linksScore,
    });

  }, [generatedContent, keyword, selectedTopic]);
  
  if (!generatedContent) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-indigo-700">
          <Award className="h-5 w-5 mr-2" />
          SEO 점수 분석
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
            <p className="text-lg text-gray-600 mb-2">총 SEO 점수</p>
            <p className={`text-6xl font-bold ${getScoreTextColor(totalScore)}`}>{Math.round(totalScore)}<span className="text-2xl text-gray-500">/100</span></p>
            <Progress value={totalScore} className="mt-4 h-3" />
        </div>
        
        {/* 디버그 정보 (개발용) */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <p>디버그: 단어수 {debugInfo.wordCount}, 키워드수 {debugInfo.keywordCount}개, H2개수 {debugInfo.h2Count}, 키워드H2 {debugInfo.h2WithKeywordCount}개</p>
          <p>H2 제목들: {debugInfo.h2Texts}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          {Object.entries(CRITERIA).map(([key, { title, icon: Icon }]) => {
            const score = scores[key as keyof typeof CRITERIA];
            return (
              <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-700">
                      <span className="flex items-center"><Icon className="h-4 w-4 mr-2" />{title}</span>
                      <span className={getScoreTextColor(score)}>{Math.round(score)}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
};
