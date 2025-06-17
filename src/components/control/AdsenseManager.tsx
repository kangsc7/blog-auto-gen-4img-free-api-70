
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

interface AdsenseManagerProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
}

export const AdsenseManager: React.FC<AdsenseManagerProps> = ({
  appState,
  saveAppState
}) => {
  const { toast } = useToast();
  const [tempAdsenseClient, setTempAdsenseClient] = useState(appState.adsenseClient);
  const [tempAdsenseSlot, setTempAdsenseSlot] = useState(appState.adsenseSlot);

  const handleSaveAdsenseConfig = () => {
    if (appState.isAdsenseEnabled && (!tempAdsenseClient.trim() || !tempAdsenseSlot.trim())) {
      toast({
        title: "애드센스 설정 누락",
        description: "활성화하려면 Client ID와 Slot ID를 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    // 애드센스 코드 생성
    const generatedCode = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${tempAdsenseClient}"
     crossorigin="anonymous"></script>
<!-- 중간 광고 -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-${tempAdsenseClient}"
     data-ad-slot="${tempAdsenseSlot}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;

    saveAppState({
      adsenseClient: tempAdsenseClient.trim(),
      adsenseSlot: tempAdsenseSlot.trim(),
      adsenseCode: generatedCode,
    });

    toast({
      title: "애드센스 설정 저장",
      description: "애드센스 광고 설정이 저장되었습니다.",
    });
  };

  const handleDeleteAdsenseConfig = () => {
    saveAppState({
      adsenseClient: '',
      adsenseSlot: '',
      adsenseCode: '',
      isAdsenseEnabled: false,
    });
    setTempAdsenseClient('');
    setTempAdsenseSlot('');

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
              data-ad-client : 숫자만 입력
            </label>
            <Input
              placeholder="예: 1234567890123456"
              value={tempAdsenseClient}
              onChange={(e) => setTempAdsenseClient(e.target.value.replace(/[^0-9]/g, ''))}
              className="mb-3"
            />
            
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              data-ad-slot : 숫자만 입력
            </label>
            <Input
              placeholder="예: 9876543210"
              value={tempAdsenseSlot}
              onChange={(e) => setTempAdsenseSlot(e.target.value.replace(/[^0-9]/g, ''))}
            />
            
            <p className="text-xs text-gray-500 mt-2">
              본문 중간부의 H2 제목 위에 자동으로 삽입됩니다.
            </p>
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
              variant="destructive"
              className="flex-1"
            >
              설정 삭제
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
