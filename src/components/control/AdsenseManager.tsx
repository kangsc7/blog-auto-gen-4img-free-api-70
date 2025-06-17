
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { Trash2 } from 'lucide-react';

interface AdsenseManagerProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
}

export const AdsenseManager: React.FC<AdsenseManagerProps> = ({
  appState,
  saveAppState
}) => {
  const { toast } = useToast();
  const [adClient, setAdClient] = useState(() => {
    // 기존 애드센스 코드에서 클라이언트 ID 추출
    const match = appState.adsenseCode.match(/data-ad-client="([^"]+)"/);
    return match ? match[1] : '';
  });
  
  const [adSlot, setAdSlot] = useState(() => {
    // 기존 애드센스 코드에서 슬롯 ID 추출
    const match = appState.adsenseCode.match(/data-ad-slot="([^"]+)"/);
    return match ? match[1] : '';
  });

  const generateAdsenseCode = (clientId: string, slotId: string) => {
    return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}"
     crossorigin="anonymous"></script>
<!-- 중간 광고 -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${clientId}"
     data-ad-slot="${slotId}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
  };

  const handleSaveAdsenseConfig = () => {
    if (appState.isAdsenseEnabled && (!adClient.trim() || !adSlot.trim())) {
      toast({
        title: "애드센스 정보 누락",
        description: "클라이언트 ID와 슬롯 ID를 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    const adsenseCode = generateAdsenseCode(adClient.trim(), adSlot.trim());
    
    saveAppState({
      adsenseCode: adsenseCode,
    });

    toast({
      title: "애드센스 설정 저장",
      description: "애드센스 광고 설정이 저장되었습니다.",
    });
  };

  const handleDeleteAdsenseConfig = () => {
    setAdClient('');
    setAdSlot('');
    saveAppState({
      adsenseCode: '',
      isAdsenseEnabled: false,
    });

    toast({
      title: "애드센스 설정 삭제",
      description: "애드센스 광고 설정이 삭제되었습니다.",
    });
  };

  const handleToggleAdsense = (enabled: boolean) => {
    saveAppState({
      isAdsenseEnabled: enabled,
    });

    toast({
      title: enabled ? "중간 광고 활성화" : "중간 광고 비활성화",
      description: enabled ? "블로그 글에 중간 광고가 삽입됩니다." : "중간 광고 삽입이 비활성화되었습니다.",
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-purple-700">
          <span>중간 광고 삽입 설정</span>
          <Switch
            checked={appState.isAdsenseEnabled}
            onCheckedChange={handleToggleAdsense}
          />
        </CardTitle>
      </CardHeader>
      
      {appState.isAdsenseEnabled && (
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              data-ad-client
            </label>
            <Input
              placeholder="ca-pub-1234567890123456"
              value={adClient}
              onChange={(e) => setAdClient(e.target.value)}
              className="mb-2"
            />
            <p className="text-xs text-gray-500">
              예: ca-pub-1234567890123456
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              data-ad-slot
            </label>
            <Input
              placeholder="1234567890"
              value={adSlot}
              onChange={(e) => setAdSlot(e.target.value)}
              className="mb-2"
            />
            <p className="text-xs text-gray-500">
              예: 1234567890 (숫자만)
            </p>
          </div>

          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            <p className="font-semibold mb-1">📍 광고 삽입 위치</p>
            <p>본문 중간부의 H2 제목 위에 자동으로 삽입됩니다.</p>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleSaveAdsenseConfig}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              애드센스 설정 저장
            </Button>
            
            <Button
              onClick={handleDeleteAdsenseConfig}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              삭제
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
