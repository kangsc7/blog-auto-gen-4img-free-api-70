
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface TopicConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  topic: string;
}

export const TopicConfirmDialog: React.FC<TopicConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  topic,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    if (isProcessing) return; // 중복 클릭 방지
    
    setIsProcessing(true);
    console.log('주제 확인 버튼 클릭됨:', topic);
    
    try {
      // 즉시 onConfirm 함수 호출 (async/await 사용하지 않음)
      onConfirm();
      onClose();
    } catch (error) {
      console.error('주제 확인 처리 오류:', error);
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (isProcessing) return;
    
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isProcessing) {
        onClose();
      }
    }}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-blue-600">
            🚀 블로그 글 생성 확인
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base leading-relaxed">
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="font-semibold text-blue-800 mb-2">선택하신 주제:</p>
              <p className="text-blue-700 italic">"{topic}"</p>
            </div>
            <p className="text-gray-700">
              이 주제로 블로그 글을 생성하시겠습니까?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '처리중...' : '네, 작성하겠습니다'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
