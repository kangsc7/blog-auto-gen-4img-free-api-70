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

    // 1. Word Count Score
    let wordCountScore = 0;
    if (wordCount > 1500) wordCountScore = 100;
    else if (wordCount > 1000) wordCountScore = 80;
    else if (wordCount > 500) wordCountScore = 60;
    else if (wordCount > 300) wordCountScore = 40;
    else wordCountScore = 10;

    // 2. Keyword in Title Score
    const title = selectedTopic || doc.querySelector('h3')?.textContent || '';
    const keywordInTitleScore = keyword && title.toLowerCase().includes(keyword.toLowerCase()) ? 100 : 0;

    // 3. Keyword Density Score
    let keywordDensityScore = 0;
    if (keyword && wordCount > 0) {
      const keywordCount = (textContent.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      const density = (keywordCount / wordCount) * 100;
      
      // Target: 1.5% ~ 2.5%
      if (density >= 1.5 && density <= 2.5) {
        keywordDensityScore = 100;
      } 
      // Near target: 1.0% ~ 1.49% or 2.51% ~ 3.0%
      else if ((density >= 1.0 && density < 1.5) || (density > 2.5 && density <= 3.0)) {
        keywordDensityScore = 70;
      }
      // Acceptable range: 0.5% ~ 0.99% or 3.01% ~ 3.5%
      else if ((density >= 0.5 && density < 1.0) || (density > 3.0 && density <= 3.5)) {
        keywordDensityScore = 40;
      }
      // Far from target
      else {
        keywordDensityScore = 10;
      }
    }

    // 4. Headings Score
    const h2Count = doc.querySelectorAll('h2').length;
    const headingsScore = Math.round(Math.min((h2Count / 3) * 100, 100));

    // 5. Lists Score
    const listCount = doc.querySelectorAll('ul, ol').length;
    const listsScore = listCount > 0 ? 100 : 0;

    // 6. Links Score
    const linkCount = doc.querySelectorAll('a').length;
    const linksScore = Math.round(Math.min((linkCount / 2) * 100, 100));

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
