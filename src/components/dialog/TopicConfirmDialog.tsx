
import React from 'react';
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
  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('TopicConfirmDialog handleConfirm 호출됨:', topic);
    try {
      onConfirm();
    } catch (error) {
      console.error('TopicConfirmDialog onConfirm 실행 중 오류:', error);
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('TopicConfirmDialog handleCancel 호출됨');
    try {
      onCancel();
    } catch (error) {
      console.error('TopicConfirmDialog onCancel 실행 중 오류:', error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
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
          >
            아니요
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            네, 작성하겠습니다
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
