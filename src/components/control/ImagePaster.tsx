
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUp, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ImagePaster = () => {
    const [convertedImage, setConvertedImage] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const handleAppReset = () => {
            setConvertedImage(null);
        };
        window.addEventListener('app-reset', handleAppReset);
        return () => {
            window.removeEventListener('app-reset', handleAppReset);
        };
    }, []);

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
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
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

        // 먼저 이미지 파일을 찾아보기
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
            // Whisk 텍스트나 기타 텍스트 무시
            toast({ 
                title: "이미지만 붙여넣기 가능", 
                description: "Whisk에서 이미지를 우클릭 → '이미지 복사'를 선택한 후 붙여넣어 주세요.", 
                variant: "destructive" 
            });
        }
    }, [toast]);

    const handleCopyHtml = async () => {
        if (!convertedImage) return;

        try {
            // 이미지를 canvas에 그려서 blob으로 변환
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = convertedImage;
            });
            
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            
            // canvas를 blob으로 변환
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob!);
                }, 'image/jpeg', 0.9);
            });

            // 다양한 형태로 클립보드에 복사 시도
            try {
                // 방법 1: 실제 이미지 파일로 복사 (가장 호환성이 좋음)
                const clipboardItem = new ClipboardItem({
                    'image/jpeg': blob,
                    'image/png': blob, // PNG로도 시도
                });
                
                await navigator.clipboard.write([clipboardItem]);
                
                toast({ 
                    title: "이미지 복사 완료", 
                    description: "이미지가 복사되었습니다. 블로그 에디터에 Ctrl+V로 붙여넣으세요!" 
                });
                return;
            } catch (imageError) {
                console.log('이미지 직접 복사 실패, HTML 방식으로 시도:', imageError);
                
                // 방법 2: HTML과 이미지를 함께 복사
                const imgTag = `<img src="${convertedImage}" alt="블로그 이미지" style="max-width: 100%; height: auto; border-radius: 8px;">`;
                
                try {
                    const clipboardItem = new ClipboardItem({
                        'image/jpeg': blob,
                        'text/html': new Blob([imgTag], { type: 'text/html' }),
                        'text/plain': new Blob([convertedImage], { type: 'text/plain' }), // base64 데이터도 포함
                    });

                    await navigator.clipboard.write([clipboardItem]);
                    
                    toast({ 
                        title: "복사 완료", 
                        description: "이미지와 HTML이 복사되었습니다. 블로그 에디터에 붙여넣으세요!" 
                    });
                    return;
                } catch (htmlError) {
                    console.log('HTML 복사도 실패, 텍스트로 시도:', htmlError);
                    
                    // 방법 3: 텍스트로만 복사 (마지막 수단)
                    await navigator.clipboard.writeText(convertedImage);
                    toast({ 
                        title: "이미지 링크 복사 완료", 
                        description: "이미지 데이터가 텍스트로 복사되었습니다. 블로그에서 이미지 삽입 기능을 사용해서 붙여넣으세요." 
                    });
                }
            }
        } catch (error) {
            console.error('모든 복사 방법 실패:', error);
            toast({ 
                title: "복사 실패", 
                description: "클립보드 복사에 실패했습니다. 브라우저가 이미지 복사를 지원하지 않을 수 있습니다.", 
                variant: "destructive" 
            });
        }
    };

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center text-purple-700">
                    <ImageUp className="h-5 w-5 mr-2" />
                    이미지 붙여넣기 및 변환
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
                            <p className="text-sm">Whisk에서 이미지를 우클릭 → '이미지 복사' 후 붙여넣으세요.</p>
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
                            블로그용 이미지 복사
                        </Button>
                        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                            💡 <strong>사용법:</strong> 버튼 클릭 후 블로그 에디터에서 Ctrl+V로 붙여넣으세요. 
                            실제 이미지 파일로 복사되어 대부분의 블로그 플랫폼에서 정상 표시됩니다.
                        </div>
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
