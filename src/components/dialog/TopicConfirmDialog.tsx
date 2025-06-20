
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
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
          <AlertDialogCancel
            onClick={handleCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            네, 작성하겠습니다
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
