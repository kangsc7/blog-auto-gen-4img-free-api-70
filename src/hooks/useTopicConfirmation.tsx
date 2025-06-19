
import { useState } from 'react';

interface UseTopicConfirmationProps {
  onTopicSelect: (topic: string) => void;
  onTopicConfirm: (topic: string) => Promise<void>;
}

export const useTopicConfirmation = ({ onTopicSelect, onTopicConfirm }: UseTopicConfirmationProps) => {
  const [showTopicConfirmDialog, setShowTopicConfirmDialog] = useState(false);
  const [pendingTopic, setPendingTopic] = useState<string>('');

  const handleTopicSelect = (topic: string) => {
    console.log('주제 선택됨:', topic);
    setPendingTopic(topic);
    setShowTopicConfirmDialog(true);
  };

  const handleTopicConfirm = async () => {
    console.log('주제 확인 처리 시작:', pendingTopic);
    
    if (!pendingTopic) {
      console.log('처리할 주제가 없음 - 무시');
      return;
    }
    
    try {
      await onTopicConfirm(pendingTopic);
      setPendingTopic('');
    } catch (error) {
      console.error('주제 확인 처리 오류:', error);
      throw error;
    }
  };

  const handleTopicCancel = () => {
    console.log('주제 선택 취소');
    setShowTopicConfirmDialog(false);
    setPendingTopic('');
  };

  return {
    showTopicConfirmDialog,
    setShowTopicConfirmDialog,
    pendingTopic,
    handleTopicSelect,
    handleTopicConfirm,
    handleTopicCancel,
  };
};
