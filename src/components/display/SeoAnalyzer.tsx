
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, ChevronDown, ChevronUp, Search, Target, FileText, ExternalLink } from 'lucide-react';

interface SeoAnalyzerProps {
  generatedContent: string;
  keyword: string;
  selectedTopic: string;
}

export const SeoAnalyzer: React.FC<SeoAnalyzerProps> = ({
  generatedContent,
  keyword,
  selectedTopic,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (!generatedContent) return null;

  const handleDoubleClick = () => {
    setIsCollapsed(!isCollapsed);
  };

  // HTML 태그 제거하여 순수 텍스트 추출
  const getPlainText = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const plainText = getPlainText(generatedContent);
  
  // 단어 수 계산 (한글, 영문, 숫자 포함)
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  
  // 글자 수 계산 (공백 제외)
  const charCount = plainText.replace(/\s/g, '').length;

  // 키워드 밀도 계산 - 5개 이상이면 100%
  const keywordMatches = keyword ? (plainText.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length : 0;
  const keywordDensity = keywordMatches >= 5 ? 100 : (keywordMatches / 5) * 100;

  // 제목 최적화 점수 - 키워드가 제목에 포함되어 있는지 확인
  const titleOptimization = keyword && selectedTopic && selectedTopic.toLowerCase().includes(keyword.toLowerCase()) ? 100 : 70;

  // 콘텐츠 길이 점수 - 90% 수준으로 조정
  const getContentLengthScore = (wordCount: number): number => {
    if (wordCount >= 800) return 90; // 800단어 이상이면 90%
    if (wordCount >= 600) return 85; // 600-799단어면 85%
    if (wordCount >= 400) return 80; // 400-599단어면 80%
    if (wordCount >= 300) return 75; // 300-399단어면 75%
    if (wordCount >= 200) return 70; // 200-299단어면 70%
    return Math.max(50, (wordCount / 200) * 70); // 200단어 미만은 비례적으로 감소
  };

  const contentLengthScore = getContentLengthScore(wordCount);

  // 가독성 점수 - 문장 길이와 구조 분석
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((acc, s) => acc + s.trim().length, 0) / sentences.length;
  const readabilityScore = avgSentenceLength < 80 ? 90 : Math.max(60, 90 - (avgSentenceLength - 80) * 0.5);

  // 전체 SEO 점수 계산
  const overallScore = Math.round((keywordDensity + titleOptimization + contentLengthScore + readabilityScore) / 4);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="shadow-md border-2 border-green-200">
      <CardHeader 
        className="bg-green-50 cursor-pointer select-none" 
        onDoubleClick={handleDoubleClick}
        title="더블클릭하여 접기/펼치기"
      >
        <CardTitle className="flex items-center justify-between text-green-700">
          <div className="flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            📊 SEO 점수 분석
          </div>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </CardTitle>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-6 p-6">
          {/* 전체 SEO 점수 */}
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="text-2xl font-bold text-blue-800 mb-2">전체 SEO 점수</h3>
            <div className={`text-5xl font-bold mb-3 ${getScoreColor(overallScore)}`}>
              {overallScore}점
            </div>
            <Progress 
              value={overallScore} 
              className="w-full h-3 mb-2"
            />
            <p className="text-sm text-gray-600">
              {overallScore >= 80 ? '🎉 우수한 SEO 최적화!' : 
               overallScore >= 60 ? '👍 양호한 SEO 상태' : 
               '⚠️ SEO 개선이 필요합니다'}
            </p>
          </div>

          {/* 상세 분석 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 키워드 밀도 */}
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-3">
                <Target className="h-5 w-5 mr-2 text-purple-600" />
                <h4 className="font-semibold text-gray-800">핵심 키워드 밀도</h4>
              </div>
              <div className={`text-2xl font-bold mb-2 ${getScoreColor(keywordDensity)}`}>
                {Math.round(keywordDensity)}%
              </div>
              <Progress 
                value={keywordDensity} 
                className="w-full h-2 mb-2"
              />
              <p className="text-sm text-gray-600">
                키워드 "{keyword}" 등장 횟수: {keywordMatches}회
                {keywordMatches >= 5 ? ' ✅ 충분' : ' ⚠️ 5회 이상 권장'}
              </p>
            </div>

            {/* 제목 최적화 */}
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-3">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                <h4 className="font-semibold text-gray-800">제목 최적화</h4>
              </div>
              <div className={`text-2xl font-bold mb-2 ${getScoreColor(titleOptimization)}`}>
                {titleOptimization}%
              </div>
              <Progress 
                value={titleOptimization} 
                className="w-full h-2 mb-2"
              />
              <p className="text-sm text-gray-600">
                {titleOptimization === 100 ? '✅ 제목에 키워드 포함됨' : '⚠️ 제목에 키워드 추가 권장'}
              </p>
            </div>

            {/* 콘텐츠 길이 */}
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-3">
                <Search className="h-5 w-5 mr-2 text-green-600" />
                <h4 className="font-semibold text-gray-800">콘텐츠 길이</h4>
              </div>
              <div className={`text-2xl font-bold mb-2 ${getScoreColor(contentLengthScore)}`}>
                {Math.round(contentLengthScore)}%
              </div>
              <Progress 
                value={contentLengthScore} 
                className="w-full h-2 mb-2"
              />
              <p className="text-sm text-gray-600">
                단어 수: {wordCount}개 | 글자 수: {charCount}자
                {wordCount >= 800 ? ' ✅ 충분한 길이' : ' ⚠️ 800단어 이상 권장'}
              </p>
            </div>

            {/* 가독성 */}
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-3">
                <ExternalLink className="h-5 w-5 mr-2 text-orange-600" />
                <h4 className="font-semibold text-gray-800">가독성</h4>
              </div>
              <div className={`text-2xl font-bold mb-2 ${getScoreColor(readabilityScore)}`}>
                {Math.round(readabilityScore)}%
              </div>
              <Progress 
                value={readabilityScore} 
                className="w-full h-2 mb-2"
              />
              <p className="text-sm text-gray-600">
                평균 문장 길이: {Math.round(avgSentenceLength)}자
                {avgSentenceLength < 80 ? ' ✅ 적절한 길이' : ' ⚠️ 문장이 너무 깁니다'}
              </p>
            </div>
          </div>

          {/* SEO 개선 제안 */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
              💡 SEO 개선 제안
            </h4>
            <ul className="text-sm text-yellow-700 space-y-2">
              {keywordDensity < 100 && (
                <li>• 핵심 키워드 "{keyword}"를 {5 - keywordMatches}회 더 자연스럽게 추가해보세요</li>
              )}
              {titleOptimization < 100 && (
                <li>• 제목에 핵심 키워드를 포함시켜보세요</li>
              )}
              {contentLengthScore < 90 && (
                <li>• 콘텐츠 길이를 800단어 이상으로 늘려보세요 (현재: {wordCount}단어)</li>
              )}
              {readabilityScore < 90 && (
                <li>• 문장을 더 짧고 명확하게 작성해보세요</li>
              )}
              {overallScore >= 80 && (
                <li>• 🎉 훌륭합니다! 현재 SEO 최적화가 잘 되어있습니다</li>
              )}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
