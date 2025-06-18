
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface DuplicateErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DuplicateErrorDialog: React.FC<DuplicateErrorDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-orange-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            중복 주제 감지
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            이미 생성된 주제와 유사한 주제입니다. 
            다른 키워드로 시도해보시거나 기존 주제를 활용해주세요.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
