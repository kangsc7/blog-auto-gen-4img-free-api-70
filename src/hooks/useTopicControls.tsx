
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

interface UseTopicControlsParams {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  preventDuplicates: boolean;
  canUseFeatures: boolean;
}

export const useTopicControls = ({ 
  appState, 
  saveAppState, 
  preventDuplicates,
  canUseFeatures 
}: UseTopicControlsParams) => {
  const { toast } = useToast();
  const [manualTopic, setManualTopic] = useState('');

  // 유사도 계산 함수
  const calculateSimilarity = useCallback((str1: string, str2: string): number => {
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');
    const s1 = normalize(str1);
    const s2 = normalize(str2);
    
    if (s1 === s2) return 1;
    
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = (s1: string, s2: string): number => {
      const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
      
      for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
      for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
      
      for (let j = 1; j <= s2.length; j++) {
        for (let i = 1; i <= s1.length; i++) {
          const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1,
            matrix[j - 1][i] + 1,
            matrix[j - 1][i - 1] + indicator
          );
        }
      }
      return matrix[s2.length][s1.length];
    };
    
    return (longer.length - editDistance(longer, shorter)) / longer.length;
  }, []);

  // 중복 체크 함수
  const isDuplicate = useCallback((newTopic: string): boolean => {
    if (!preventDuplicates) return false;
    
    return appState.topics.some(existingTopic => 
      calculateSimilarity(newTopic, existingTopic) > 0.7
    );
  }, [preventDuplicates, appState.topics, calculateSimilarity]);

  // 주제 선택
  const selectTopic = useCallback((topic: string) => {
    if (!canUseFeatures) {
      toast({
        title: "접근 제한",
        description: "이 기능을 사용할 권한이 없습니다.",
        variant: "destructive"
      });
      return;
    }
    
    saveAppState({ selectedTopic: topic });
    console.log('주제 선택됨:', topic);
  }, [canUseFeatures, saveAppState, toast]);

  // 수동 주제 추가
  const handleManualTopicAdd = useCallback(() => {
    if (!canUseFeatures) {
      toast({
        title: "접근 제한",
        description: "이 기능을 사용할 권한이 없습니다.",
        variant: "destructive"
      });
      return;
    }

    const trimmedTopic = manualTopic.trim();
    
    if (!trimmedTopic) {
      toast({
        title: "입력 오류",
        description: "주제를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (appState.topics.includes(trimmedTopic)) {
      toast({
        title: "중복 주제",
        description: "이미 존재하는 주제입니다.",
        variant: "destructive"
      });
      return;
    }

    if (isDuplicate(trimmedTopic)) {
      toast({
        title: "유사한 주제 존재",
        description: "유사한 주제가 이미 존재합니다. (70% 이상 유사)",
        variant: "destructive"
      });
      return;
    }

    const updatedTopics = [...appState.topics, trimmedTopic];
    saveAppState({ topics: updatedTopics });
    setManualTopic('');
    
    toast({
      title: "주제 추가 완료",
      description: `"${trimmedTopic}" 주제가 추가되었습니다.`
    });
  }, [canUseFeatures, manualTopic, appState.topics, isDuplicate, saveAppState, toast]);

  return {
    manualTopic,
    setManualTopic,
    selectTopic,
    handleManualTopicAdd,
    isDuplicate,
    calculateSimilarity
  };
};
