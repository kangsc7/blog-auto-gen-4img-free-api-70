
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

interface AppHandlersProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  resetApp: () => void;
}

export const useAppHandlers = ({ appState, saveAppState, resetApp }: AppHandlersProps) => {
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
  
  const handleResetApp = () => {
    resetApp();
    setManualTopic('');
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "복사 완료", description: `${type}이(가) 클립보드에 복사되었습니다.` });
    }).catch(() => {
      toast({ title: "복사 실패", description: "클립보드 복사에 실패했습니다.", variant: "destructive" });
    });
  };

  const openWhisk = () => {
    window.open('https://labs.google/fx/ko/tools/whisk', '_blank', 'noopener,noreferrer');
    toast({ title: "Whisk 열기", description: "Google Whisk가 새 탭에서 열렸습니다." });
  };

  const downloadHTML = () => {
    if (!appState.generatedContent) {
      toast({ title: "다운로드 오류", description: "다운로드할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    const blob = new Blob([appState.generatedContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appState.selectedTopic.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "다운로드 완료", description: "HTML 파일이 다운로드되었습니다." });
  };

  return {
    manualTopic,
    setManualTopic,
    selectTopic,
    handleManualTopicAdd,
    handleResetApp,
    copyToClipboard,
    openWhisk,
    downloadHTML
  };
};
