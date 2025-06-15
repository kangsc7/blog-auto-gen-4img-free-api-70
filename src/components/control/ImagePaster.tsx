
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUp, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ImagePaster = () => {
    const [convertedImage, setConvertedImage] = useState<string | null>(null);
    const { toast } = useToast();

    const convertToJpeg = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                if (!event.target?.result) {
                    return reject(new Error('FileReader did not return a result.'));
                }
                const img = new Image();
                img.src = event.target.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        return reject(new Error('Could not get canvas context'));
                    }
                    ctx.drawImage(img, 0, 0);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.95); // High quality JPEG
                    resolve(dataUrl);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handlePaste = useCallback(async (event: React.ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        
        const items = event.clipboardData?.items;
        if (!items) {
            toast({ title: "붙여넣기 실패", description: "클립보드에 데이터가 없습니다.", variant: "destructive" });
            return;
        }

        let imageFile: File | null = null;
        for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
                imageFile = item.getAsFile();
                break;
            }
        }

        if (imageFile) {
            toast({ title: "이미지 처리 중", description: "이미지를 JPG로 변환하고 있습니다..." });
            try {
                const jpegDataUrl = await convertToJpeg(imageFile);
                setConvertedImage(jpegDataUrl);
                toast({ title: "변환 완료", description: "이미지를 성공적으로 붙여넣고 변환했습니다." });
            } catch (error) {
                console.error("Image conversion error:", error);
                toast({ title: "변환 실패", description: "이미지를 변환하는 중 오류가 발생했습니다.", variant: "destructive" });
            }
        } else {
            toast({ title: "붙여넣기 오류", description: "클립보드에서 이미지를 찾을 수 없습니다. 이미지 파일을 복사했는지 확인해주세요.", variant: "destructive" });
        }
    }, [toast]);

    const handleCopyHtml = async () => {
        if (!convertedImage) return;

        const imgTag = `<img src="${convertedImage}" alt="pasted_and_converted_image" style="max-width: 100%; height: auto;">`;
        try {
            // Use Clipboard API to write HTML content, with a plain text fallback.
            const blob = new Blob([imgTag], { type: 'text/html' });
            const plainTextBlob = new Blob([imgTag], { type: 'text/plain' });
            
            const clipboardItem = new ClipboardItem({
                'text/html': blob,
                'text/plain': plainTextBlob,
            });

            await navigator.clipboard.write([clipboardItem]);
            toast({ title: "복사 완료", description: "이미지 HTML 태그가 클립보드에 복사되었습니다. 미리보기 창에 붙여넣으세요." });
        } catch (error) {
            console.error('Failed to copy HTML: ', error);
            // Fallback for browsers that might not support ClipboardItem or have security restrictions
            try {
                await navigator.clipboard.writeText(imgTag);
                toast({ title: "복사 완료 (Fallback)", description: "HTML 코드가 복사되었습니다. 일부 편집기에서는 HTML 모드로 붙여넣어야 할 수 있습니다." });
            } catch (copyError) {
                console.error('Failed to copy HTML as text: ', copyError);
                toast({ title: "복사 실패", description: "클립보드 복사에 실패했습니다.", variant: "destructive" });
            }
        }
    };

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center text-purple-700">
                    <ImageUp className="h-5 w-5 mr-2" />
                    4. 이미지 붙여넣기 및 변환 (JPG)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                    tabIndex={0}
                    onPaste={handlePaste}
                    className="w-full min-h-[150px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    {convertedImage ? (
                        <img src={convertedImage} alt="Pasted and converted" className="max-w-full max-h-[200px] rounded" />
                    ) : (
                        <div className="text-gray-500">
                            <ImageUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="font-semibold">이곳에 이미지를 붙여넣으세요 (Ctrl+V)</p>
                            <p className="text-sm">Whisk에서 복사한 이미지가 JPG로 변환됩니다.</p>
                        </div>
                    )}
                </div>

                {convertedImage && (
                    <div className="flex flex-col space-y-2">
                        <Button 
                            onClick={handleCopyHtml}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            블로그용 이미지 복사 (HTML)
                        </Button>
                         <Button 
                            onClick={() => setConvertedImage(null)}
                            variant="outline"
                            className="w-full"
                        >
                            초기화
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
