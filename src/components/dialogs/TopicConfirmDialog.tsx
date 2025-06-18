
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';

interface TopicConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: string;
  onConfirm: (topic: string) => void;
  onCancel: () => void;
}

export const TopicConfirmDialog: React.FC<TopicConfirmDialogProps> = ({
  open,
  onOpenChange,
  topic,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-blue-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            주제 확인
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            선택하신 주제로 블로그 글을 생성하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-blue-800">{topic}</p>
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            취소
          </Button>
          <Button onClick={() => onConfirm(topic)} className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="h-4 w-4 mr-1" />
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
