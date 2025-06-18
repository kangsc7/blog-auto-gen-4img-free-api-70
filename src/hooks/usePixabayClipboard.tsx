
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PixabayImage {
  url: string;
  description: string;
  position: number;
}

export const usePixabayClipboard = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<PixabayImage[]>([]);
  const [showClipboardDialog, setShowClipboardDialog] = useState(false);

  const addImageForClipboard = (url: string, description: string, position: number) => {
    setImages(prev => [...prev, { url, description, position }]);
  };

  const clearImages = () => {
    setImages([]);
  };

  const openClipboardDialog = () => {
    if (images.length === 0) {
      toast({
        title: "이미지 없음",
        description: "먼저 블로그 글을 생성하여 이미지를 생성해주세요.",
        variant: "destructive"
      });
      return;
    }
    setShowClipboardDialog(true);
  };

  const closeClipboardDialog = () => {
    setShowClipboardDialog(false);
  };

  return {
    images,
    showClipboardDialog,
    addImageForClipboard,
    clearImages,
    openClipboardDialog,
    closeClipboardDialog,
  };
};
