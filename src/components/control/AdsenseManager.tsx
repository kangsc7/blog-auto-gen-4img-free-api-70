
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  const [tempAdsenseCode, setTempAdsenseCode] = useState(appState.adsenseCode);

  const handleSaveAdsenseConfig = () => {
    if (appState.isAdsenseEnabled && !tempAdsenseCode.trim()) {
      toast({
        title: "애드센스 코드 누락",
        description: "활성화하려면 애드센스 코드를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    saveAppState({
      adsenseCode: tempAdsenseCode.trim(),
    });

    toast({
      title: "애드센스 설정 저장",
      description: "애드센스 광고 설정이 저장되었습니다.",
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
              애드센스 코드
            </label>
            <Textarea
              placeholder={`애드센스 코드를 입력하세요:

<ins class="adsbygoogle"
     style="display:block; margin:30px 0;"
     data-ad-client="ca-pub-6856407981xxxxxx"
     data-ad-slot="83615xxxxx"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`}
              value={tempAdsenseCode}
              onChange={(e) => setTempAdsenseCode(e.target.value)}
              rows={8}
              className="min-h-[200px]"
            />
            <p className="text-xs text-gray-500 mt-2">
              본문 중간부의 H2 제목 위에 자동으로 삽입됩니다.
            </p>
          </div>

          <Button
            onClick={handleSaveAdsenseConfig}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            애드센스 설정 저장
          </Button>
        </CardContent>
      )}
    </Card>
  );
};
