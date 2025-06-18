
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, Image, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageClipboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: Array<{
    url: string;
    description: string;
    position: number;
  }>;
}

export const ImageClipboardDialog: React.FC<ImageClipboardDialogProps> = ({
  open,
  onOpenChange,
  images,
}) => {
  const { toast } = useToast();
  const [copiedImages, setCopiedImages] = useState<Set<number>>(new Set());
  const [downloadingImages, setDownloadingImages] = useState<Set<number>>(new Set());

  const copyImageToClipboard = async (imageUrl: string, description: string, position: number) => {
    try {
      setDownloadingImages(prev => new Set(prev).add(position));
      
      // CORS 프록시를 통해 이미지 다운로드
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('이미지 다운로드에 실패했습니다.');
      }
      
      const blob = await response.blob();
      
      // ClipboardItem으로 이미지를 클립보드에 복사
      const clipboardItem = new ClipboardItem({
        [blob.type]: blob
      });
      
      await navigator.clipboard.write([clipboardItem]);
      
      setCopiedImages(prev => new Set(prev).add(position));
      
      toast({
        title: "이미지 복사 완료",
        description: `${position}번째 이미지가 클립보드에 복사되었습니다. 블로그 에디터에서 Ctrl+V로 붙여넣으세요.`,
        duration: 4000
      });
      
    } catch (error) {
      console.error('이미지 복사 오류:', error);
      toast({
        title: "이미지 복사 실패",
        description: "이미지를 클립보드에 복사하는데 실패했습니다. 직접 다운로드하여 사용해주세요.",
        variant: "destructive"
      });
    } finally {
      setDownloadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(position);
        return newSet;
      });
    }
  };

  const downloadImage = async (imageUrl: string, description: string, position: number) => {
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blog_image_${position}_${description.substring(0, 30).replace(/[^a-zA-Z0-9가-힣]/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "이미지 다운로드 완료",
        description: `${position}번째 이미지가 다운로드되었습니다.`
      });
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "이미지 다운로드에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const copyAllImages = async () => {
    for (const image of images) {
      if (!copiedImages.has(image.position)) {
        await copyImageToClipboard(image.url, image.description, image.position);
        // 각 이미지 복사 사이에 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-blue-600">
            <Image className="h-5 w-5 mr-2" />
            블로그 이미지 클립보드 복사
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            픽사베이에서 가져온 이미지들을 클립보드에 복사하여 블로그 에디터에 안전하게 붙여넣으세요.
            <br />
            <span className="text-blue-600 font-semibold">💡 사용법: 이미지 복사 → 블로그 에디터에서 원하는 위치에 Ctrl+V</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700">총 {images.length}개의 이미지</p>
            <Button 
              onClick={copyAllImages}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Copy className="h-4 w-4 mr-1" />
              모든 이미지 복사
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="relative">
                  <img 
                    src={image.url} 
                    alt={image.description}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                    {image.position}번째 위치
                  </div>
                  {copiedImages.has(image.position) && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white p-1 rounded">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 line-clamp-2">{image.description}</p>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => copyImageToClipboard(image.url, image.description, image.position)}
                      disabled={downloadingImages.has(image.position) || copiedImages.has(image.position)}
                      className={`flex-1 ${
                        copiedImages.has(image.position) 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      size="sm"
                    >
                      {downloadingImages.has(image.position) ? (
                        <>처리중...</>
                      ) : copiedImages.has(image.position) ? (
                        <><CheckCircle className="h-4 w-4 mr-1" />복사됨</>
                      ) : (
                        <><Copy className="h-4 w-4 mr-1" />클립보드 복사</>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => downloadImage(image.url, image.description, image.position)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">사용 안내:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>위에서 원하는 이미지의 "클립보드 복사" 버튼을 클릭</li>
                  <li>블로그 에디터에서 해당 이미지를 삽입할 위치로 커서 이동</li>
                  <li>Ctrl+V (또는 Cmd+V)로 이미지 붙여넣기</li>
                  <li>이미지가 블로그에 직접 업로드되어 안전하게 보관됩니다</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
