
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BarChart3, Sparkles } from 'lucide-react';

interface InfographicConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const InfographicConfirmDialog: React.FC<InfographicConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
        <DialogHeader className="text-center">
          <div className="mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-3 w-fit mb-4">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            인포그래픽 생성
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-700 mt-4">
            현재 블로그 콘텐츠를 바탕으로 
            <br />
            <span className="font-semibold text-purple-700">시각적 인포그래픽</span>을 생성하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-white/70 rounded-lg p-4 my-4 border border-purple-200">
          <div className="flex items-center text-sm text-gray-600 space-y-1">
            <div className="w-full">
              <div className="flex items-center mb-2">
                <span className="text-green-600 mr-2">✓</span>
                <span>AI 기반 자동 차트 및 그래프 생성</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="text-green-600 mr-2">✓</span>
                <span>반응형 디자인 및 고품질 시각화</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span>즉시 복사 및 다운로드 가능</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 justify-center sm:justify-center">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="px-6 py-2 border-gray-300 hover:bg-gray-50"
          >
            취소
          </Button>
          <Button 
            onClick={onConfirm}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
