
import React, { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, Sparkles } from 'lucide-react';

interface TopicConfirmDialogProps {
  isOpen: boolean;
  topic: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const TopicConfirmDialog: React.FC<TopicConfirmDialogProps> = ({
  isOpen,
  topic,
  onConfirm,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // useCallback으로 함수 메모화 - 불필요한 리렌더링 방지
  const handleConfirm = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 이미 처리 중이거나 다이얼로그가 닫혀있으면 무시
    if (isProcessing || !isOpen) {
      console.log('handleConfirm 무시됨:', { isProcessing, isOpen });
      return;
    }
    
    setIsProcessing(true);
    console.log('TopicConfirmDialog handleConfirm 시작:', topic);
    
    try {
      // 즉시 다이얼로그 닫기 위해 onCancel 먼저 호출
      onCancel();
      
      // 약간의 지연 후 onConfirm 실행 (UI 업데이트 보장)
      setTimeout(() => {
        onConfirm();
      }, 50);
      
    } catch (error) {
      console.error('handleConfirm 오류:', error);
      setIsProcessing(false);
    }
  }, [isProcessing, isOpen, topic, onConfirm, onCancel]);

  const handleCancel = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isProcessing) {
      console.log('handleCancel 무시됨 - 처리 중');
      return;
    }
    
    console.log('TopicConfirmDialog handleCancel 호출됨');
    setIsProcessing(false);
    onCancel();
  }, [isProcessing, onCancel]);

  // 다이얼로그 상태 변경 시 처리 상태 초기화
  React.useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
    }
  }, [isOpen]);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isProcessing) {
        handleCancel();
      }
    }}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto bg-blue-100 rounded-full p-3 w-fit mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-gray-900">
            블로그 글 작성 확인
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-600 mt-3">
            선택하신 주제로 블로그 글을 작성하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="bg-blue-50 rounded-lg p-4 my-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-900 text-sm mb-1">선택된 주제:</p>
              <p className="text-blue-800 font-medium">{topic}</p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={handleCancel}
            className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={isProcessing}
          >
            아니요
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            {isProcessing ? '처리 중...' : '네, 작성하겠습니다'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
