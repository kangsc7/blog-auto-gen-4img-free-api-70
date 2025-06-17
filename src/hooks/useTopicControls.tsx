
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

// 간단한 유사도 검사 함수 (70% 기준)
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

interface UseTopicControlsProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  preventDuplicates: boolean;
  canUseFeatures: boolean;
}

export const useTopicControls = ({ appState, saveAppState, preventDuplicates, canUseFeatures }: UseTopicControlsProps) => {
  const { toast } = useToast();
  const [manualTopic, setManualTopic] = useState('');

  const selectTopic = (topic: string) => {
    saveAppState({ selectedTopic: topic });
  };

  const handleManualTopicAdd = () => {
    if (!canUseFeatures) {
      toast({
        title: "접근 제한",
        description: "이 기능을 사용할 권한이 없습니다.",
        variant: "destructive"
      });
      return;
    }

    if (!manualTopic.trim()) return;

    // 중복 금지 설정이 활성화된 경우에만 유사도 검사
    if (preventDuplicates && appState.topics.length > 0) {
      const isDuplicate = appState.topics.some(existingTopic => {
        const similarity = calculateSimilarity(manualTopic.trim(), existingTopic);
        return similarity >= 70;
      });

      if (isDuplicate) {
        toast({
          title: "중복 주제 감지",
          description: "70% 이상 유사한 주제가 이미 존재합니다.",
          variant: "destructive"
        });
        return;
      }
    }

    const updatedTopics = [...appState.topics, manualTopic.trim()];
    saveAppState({ topics: updatedTopics });
    setManualTopic('');
    
    toast({
      title: "주제 추가 완료",
      description: "수동 주제가 성공적으로 추가되었습니다."
    });
  };

  return {
    manualTopic,
    setManualTopic,
    selectTopic,
    handleManualTopicAdd,
  };
};
