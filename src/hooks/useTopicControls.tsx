
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

// 간단한 유사도 검사 함수 (70% 기준) - 중복 금지 기능
const calculateSimilarity = (str1: string, str2: string): number => {
  const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase();
  const s1 = normalize(str1);
  const s2 = normalize(str2);
  
  if (s1 === s2) return 100;
  
  const maxLength = Math.max(s1.length, s2.length);
  let matches = 0;
  
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) matches++;
  }
  
  return (matches / maxLength) * 100;
};

// 주제에서 핵심 키워드를 추출하는 함수 (개선된 버전)
const extractKeywordFromTopic = (topic: string): string => {
  // 년도는 보존하고, 불필요한 단어들만 제거
  const cleaned = topic
    .replace(/지급|신청|방법|조건|자격|혜택|정보|안내|가이드|완벽|최신|최대한|확실하게|업법|총정리|노하우|팁|비결|효과적인|성공적인/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // 정리된 키워드가 너무 짧으면 원본 주제의 주요 단어들을 추출
  if (cleaned.length < 3) {
    const words = topic.split(/\s+/).filter(word => word.length > 1);
    return words.slice(0, 2).join(' ') || topic;
  }
  
  return cleaned;
};

export const useTopicControls = (appState: AppState, saveAppState: (newState: Partial<AppState>) => void) => {
  const { toast } = useToast();
  const [manualTopic, setManualTopic] = useState('');

  const selectTopic = (topic: string) => {
    console.log('📌 주제 선택:', topic);
    saveAppState({ selectedTopic: topic });
  };

  const handleManualTopicAdd = () => {
    if (!manualTopic.trim()) {
      toast({
        title: "입력 오류",
        description: "주제를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    const trimmedTopic = manualTopic.trim();

    // 중복 금지 설정이 활성화된 경우에만 유사도 검사 (70% 기준)
    if (appState.preventDuplicates && appState.topics.length > 0) {
      console.log('🔍 중복 금지 모드 - 유사도 70% 검사 시작');
      
      const isDuplicate = appState.topics.some(existingTopic => {
        const similarity = calculateSimilarity(trimmedTopic, existingTopic);
        console.log(`📊 유사도 검사: "${trimmedTopic}" vs "${existingTopic}" = ${similarity.toFixed(1)}%`);
        return similarity >= 70;
      });

      if (isDuplicate) {
        console.log('❌ 중복 주제 감지 (70% 이상 유사)');
        toast({
          title: "중복 주제 감지 (70% 기준)",
          description: "70% 이상 유사한 주제가 이미 존재합니다. 중복 금지가 활성화되어 있어 추가할 수 없습니다.",
          variant: "destructive"
        });
        return;
      } else {
        console.log('✅ 중복 검사 통과 (70% 미만)');
      }
    } else {
      console.log('🔓 중복 허용 모드 - 유사도 검사 생략');
    }

    // 수동 입력된 주제에서 핵심 키워드 추출
    const extractedKeyword = extractKeywordFromTopic(trimmedTopic);
    console.log('📝 수동 주제 추가:', { topic: trimmedTopic, keyword: extractedKeyword });
    
    const updatedTopics = [...appState.topics, trimmedTopic];
    
    // 주제를 추가하고 동시에 선택된 주제로 설정, 핵심 키워드도 설정
    saveAppState({ 
      topics: updatedTopics,
      selectedTopic: trimmedTopic,
      keyword: extractedKeyword || trimmedTopic // 추출된 키워드가 없으면 전체 주제를 키워드로 사용
    });
    
    setManualTopic('');
    
    const duplicateStatus = appState.preventDuplicates ? '중복 금지 적용됨' : '중복 허용됨';
    
    toast({
      title: "주제 추가 완료",
      description: `"${trimmedTopic}" 주제가 추가되고 선택되었습니다. 핵심 키워드: "${extractedKeyword || trimmedTopic}" (${duplicateStatus})`,
      duration: 3000
    });
  };

  return {
    manualTopic,
    setManualTopic,
    selectTopic,
    handleManualTopicAdd,
  };
};
