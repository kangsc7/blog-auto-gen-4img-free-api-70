
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
    console.log('텍스트 내용 (일부):', textContent.substring(0, 200));

    // 1. Word Count Score
    let wordCountScore = 0;
    if (wordCount > 1500) wordCountScore = 100;
    else if (wordCount > 1000) wordCountScore = 80;
    else if (wordCount > 500) wordCountScore = 60;
    else if (wordCount > 300) wordCountScore = 40;
    else wordCountScore = 10;

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

    // 3. Keyword Density Score - 개선된 로직
    let keywordDensityScore = 0;
    let actualDensity = 0;
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
      const totalKeywordCount = exactMatches + Math.floor(partialMatches * 0.3);
      actualDensity = (totalKeywordCount / wordCount) * 100;
      
      console.log('정확한 키워드 매칭 수:', exactMatches);
      console.log('부분 키워드 매칭 수:', partialMatches);
      console.log('총 키워드 카운트:', totalKeywordCount);
      console.log('실제 키워드 밀도:', actualDensity.toFixed(2) + '%');
      
      // 더 관대한 키워드 밀도 기준
      if (actualDensity >= 1.0 && actualDensity <= 3.0) {
        keywordDensityScore = 100;
      } 
      else if (actualDensity >= 0.7 && actualDensity < 1.0) {
        keywordDensityScore = 85;
      }
      else if (actualDensity >= 0.5 && actualDensity < 0.7) {
        keywordDensityScore = 70;
      }
      else if (actualDensity >= 0.3 && actualDensity < 0.5) {
        keywordDensityScore = 50;
      }
      else if (actualDensity > 3.0 && actualDensity <= 4.0) {
        keywordDensityScore = 80;
      }
      else if (actualDensity > 4.0 && actualDensity <= 5.0) {
        keywordDensityScore = 60;
      }
      else {
        keywordDensityScore = 20;
      }
    }

    // 4. H2 Headings Score - 개선된 로직
    const h2Elements = doc.querySelectorAll('h2');
    const h2Count = h2Elements.length;
    
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

    // H2 점수 계산 (개수와 키워드 관련성 모두 고려)
    let headingsScore = 0;
    if (h2Count >= 3) {
      headingsScore = 80 + (h2WithKeywordCount * 5); // 기본 80점 + 키워드 관련 H2당 5점
    } else if (h2Count >= 2) {
      headingsScore = 60 + (h2WithKeywordCount * 10);
    } else if (h2Count >= 1) {
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
      actualDensity: actualDensity.toFixed(2),
      h2Count,
      h2WithKeywordCount,
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
          <p>디버그: 단어수 {debugInfo.wordCount}, 키워드밀도 {debugInfo.actualDensity}%, H2개수 {debugInfo.h2Count}, 키워드H2 {debugInfo.h2WithKeywordCount}개</p>
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
