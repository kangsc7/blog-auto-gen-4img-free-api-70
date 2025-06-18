
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface TopicSelectionNotificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TopicSelectionNotification: React.FC<TopicSelectionNotificationProps> = ({
  open,
  onOpenChange,
}) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-green-700">
            주제 생성 완료!
          </DialogTitle>
          <DialogDescription className="text-base mt-3 text-orange-600 font-semibold">
            생성된 주제를 선택해 주세요!
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 font-semibold"
          >
            확인
          </Button>
        </div>
        <div className="text-xs text-gray-500 text-center mt-3">
          이 창은 7초 후 자동으로 사라집니다
        </div>
      </DialogContent>
    </Dialog>
  );
};
