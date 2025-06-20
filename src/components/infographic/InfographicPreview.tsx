
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Copy, Download, Share2, RotateCcw, Brain } from 'lucide-react';

interface InfographicPreviewProps {
  generatedInfographic: string;
  componentMapping: string;
  onCopy: () => void;
  onDownload: () => void;
  onShare: () => void;
  onReset: () => void;
}

const InfographicPreview: React.FC<InfographicPreviewProps> = ({
  generatedInfographic,
  componentMapping,
  onCopy,
  onDownload,
  onShare,
  onReset
}) => {
  return (
    <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center text-gray-800">
          <Globe className="mr-2 h-5 w-5" />
          인포그래픽 생성 화면
          {generatedInfographic && (
            <span className="ml-auto text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
              생성 완료
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 relative">
        {generatedInfographic ? (
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-inner relative">
              <iframe 
                srcDoc={generatedInfographic}
                className="w-full border-0"
                style={{ 
                  minHeight: '600px',
                  height: `${Math.min(Math.max(600, generatedInfographic.length / 8), 1200)}px`
                }}
                title="Generated Infographic Preview"
                sandbox="allow-scripts"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={onCopy} className="flex items-center gap-2">
                <Copy className="h-3 w-3" />
                복사
              </Button>
              <Button size="sm" variant="outline" onClick={onDownload} className="flex items-center gap-2">
                <Download className="h-3 w-3" />
                다운로드
              </Button>
              <Button size="sm" variant="outline" onClick={onReset} className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50">
                <RotateCcw className="h-3 w-3" />
                초기화
              </Button>
              <Button size="sm" variant="outline" onClick={onShare} className="flex items-center gap-2">
                <Share2 className="h-3 w-3" />
                공유
              </Button>
            </div>

            {componentMapping && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-sm text-green-700">{componentMapping}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="mb-2">GEM 인포그래픽이 생성되면 여기에 표시됩니다</p>
            <p className="text-sm">스타일을 선택하고 생성 버튼을 클릭해주세요</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InfographicPreview;
