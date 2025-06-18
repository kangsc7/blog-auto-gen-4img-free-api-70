
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUp, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ImagePaster = () => {
    const [convertedImage, setConvertedImage] = useState<string | null>(null);
    const [imageBlob, setImageBlob] = useState<Blob | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const handleAppReset = () => {
            setConvertedImage(null);
            setImageBlob(null);
        };
        window.addEventListener('app-reset', handleAppReset);
        return () => {
            window.removeEventListener('app-reset', handleAppReset);
        };
    }, []);

    const convertToJpeg = (file: File): Promise<{ dataUrl: string; blob: Blob }> => {
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
                    
                    // 고품질 JPEG로 변환
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            return reject(new Error('Canvas toBlob failed'));
                        }
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                        resolve({ dataUrl, blob });
                    }, 'image/jpeg', 0.95);
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
                const { dataUrl, blob } = await convertToJpeg(imageFile);
                setConvertedImage(dataUrl);
                setImageBlob(blob);
                toast({ title: "변환 완료", description: "이미지를 성공적으로 붙여넣고 변환했습니다." });
            } catch (error) {
                console.error("Image conversion error:", error);
                toast({ title: "변환 실패", description: "이미지를 변환하는 중 오류가 발생했습니다.", variant: "destructive" });
            }
        } else {
            toast({ 
                title: "이미지만 붙여넣기 가능", 
                description: "Whisk에서 이미지를 우클릭 → '이미지 복사'를 선택한 후 붙여넣어 주세요.", 
                variant: "destructive" 
            });
        }
    }, [toast]);

    const handleCopyImageLikePaint = async () => {
        if (!imageBlob) {
            toast({ title: "복사 실패", description: "복사할 이미지가 없습니다.", variant: "destructive" });
            return;
        }

        try {
            // 그림판과 동일한 방식: 순수 이미지 바이너리만 클립보드에 복사
            const clipboardItem = new ClipboardItem({
                [imageBlob.type]: imageBlob
            });

            await navigator.clipboard.write([clipboardItem]);
            
            toast({ 
                title: "✅ 이미지 복사 완료!", 
                description: "그림판 방식으로 이미지가 복사되었습니다. 블로그 글 미리보기 창에서 Ctrl+V로 붙여넣으세요!" 
            });

        } catch (error) {
            console.error('그림판 방식 복사 실패:', error);
            
            // 대안 방법: execCommand 사용 (구형 브라우저 지원)
            try {
                // 임시 img 요소 생성
                const img = new Image();
                img.src = convertedImage!;
                
                // 임시 div에 이미지 추가
                const tempDiv = document.createElement('div');
                tempDiv.contentEditable = 'true';
                tempDiv.appendChild(img);
                document.body.appendChild(tempDiv);
                
                // 이미지 선택 및 복사
                const range = document.createRange();
                range.selectNode(img);
                const selection = window.getSelection();
                if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    const success = document.execCommand('copy');
                    if (success) {
                        toast({ 
                            title: "✅ 이미지 복사 완료 (대안방법)", 
                            description: "이미지가 복사되었습니다. 블로그 글에 붙여넣어보세요!" 
                        });
                    } else {
                        throw new Error('execCommand copy failed');
                    }
                }
                
                // 정리
                document.body.removeChild(tempDiv);
                selection?.removeAllRanges();
                
            } catch (fallbackError) {
                console.error('대안 복사 방법도 실패:', fallbackError);
                
                // 최종 대안: 사용자에게 직접 복사 방법 안내
                toast({ 
                    title: "수동 복사 필요", 
                    description: "아래 이미지를 우클릭하여 '이미지 복사'를 선택한 후 블로그에 붙여넣으세요.", 
                    variant: "destructive"
                });
            }
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
                        <img 
                            src={convertedImage} 
                            alt="Pasted and converted" 
                            className="max-w-full max-h-[200px] rounded"
                            onContextMenu={(e) => {
                                // 우클릭 메뉴 허용 (이미지 복사 옵션 제공)
                                e.stopPropagation();
                            }}
                        />
                    ) : (
                        <div className="text-gray-500">
                            <ImageUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="font-semibold">이곳에 이미지를 붙여넣으세요 (Ctrl+V)</p>
                            <p className="text-sm">Whisk에서 이미지를 우클릭 → '이미지 복사' 후 붙여넣으세요.</p>
                        </div>
                    )}
                </div>

                {convertedImage && imageBlob && (
                    <div className="flex flex-col space-y-2">
                        <Button 
                            onClick={handleCopyImageLikePaint}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            그림판 방식으로 이미지 복사
                        </Button>
                        <div className="text-xs text-gray-600 bg-green-50 p-3 rounded border-l-4 border-green-400">
                            <p className="font-bold text-green-700 mb-1">🎯 사용법 (그림판 방식)</p>
                            <p className="mb-1">1. 위 버튼 클릭하여 이미지를 클립보드에 복사</p>
                            <p className="mb-1">2. 블로그 글 미리보기 창에서 <kbd className="bg-gray-200 px-1 rounded">Ctrl+V</kbd>로 붙여넣기</p>
                            <p className="text-green-600 font-medium">✅ 코드가 아닌 실제 이미지가 삽입됩니다!</p>
                        </div>
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            <p className="font-bold mb-1">💡 문제 해결 팁:</p>
                            <p>복사가 안 될 경우 위 이미지를 우클릭 → '이미지 복사'를 선택하세요.</p>
                        </div>
                        <Button 
                            onClick={() => {
                                setConvertedImage(null);
                                setImageBlob(null);
                            }}
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
