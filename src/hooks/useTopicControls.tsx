
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

interface TopicControlsProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
}

export const useTopicControls = ({ appState, saveAppState }: TopicControlsProps) => {
  const { toast } = useToast();
  const [manualTopic, setManualTopic] = useState('');

  const selectTopic = (topic: string) => {
    saveAppState({ selectedTopic: topic });
    toast({
      title: "주제 선택 완료",
      description: `"${topic}"이 선택되었습니다.`,
    });
  };

  const handleManualTopicAdd = () => {
    if (!manualTopic.trim()) {
      toast({ title: "주제 입력 오류", description: "주제를 입력해주세요.", variant: "destructive" });
      return;
    }
    const newTopics = [...appState.topics, manualTopic.trim()];
    saveAppState({ topics: newTopics, selectedTopic: manualTopic.trim() });
    setManualTopic('');
    toast({ title: "수동 주제 추가 완료", description: "새로운 주제가 추가되고 선택되었습니다." });
  };
  
  return {
    manualTopic,
    setManualTopic,
    selectTopic,
    handleManualTopicAdd,
  };
};
