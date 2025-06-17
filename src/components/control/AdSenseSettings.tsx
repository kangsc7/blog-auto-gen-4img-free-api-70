
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdSenseSettings {
  enabled: boolean;
  adClient: string;
  adSlot: string;
  adCount: number;
}

interface AdSenseSettingsProps {
  onSettingsChange: (settings: AdSenseSettings) => void;
}

const STORAGE_KEY = 'adsense_settings';

export const AdSenseSettings: React.FC<AdSenseSettingsProps> = ({ onSettingsChange }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdSenseSettings>({
    enabled: false,
    adClient: '',
    adSlot: '',
    adCount: 1
  });

  // localStorage에서 설정 로드
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        onSettingsChange(parsed);
      } catch (error) {
        console.error('AdSense 설정 로드 실패:', error);
      }
    }
  }, [onSettingsChange]);

  // 설정 저장
  const handleSave = () => {
    if (settings.enabled && (!settings.adClient || !settings.adSlot)) {
      toast({
        title: "입력 오류",
        description: "광고가 활성화된 경우 클라이언트 ID와 슬롯 ID를 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    onSettingsChange(settings);
    toast({
      title: "설정 저장 완료",
      description: "AdSense 광고 설정이 저장되었습니다."
    });
  };

  // 설정 삭제
  const handleDelete = () => {
    const defaultSettings = {
      enabled: false,
      adClient: '',
      adSlot: '',
      adCount: 1
    };
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
    onSettingsChange(defaultSettings);
    toast({
      title: "설정 삭제 완료",
      description: "AdSense 광고 설정이 삭제되었습니다."
    });
  };

  const updateSettings = (updates: Partial<AdSenseSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-700">
          <Settings className="h-5 w-5 mr-2" />
          중간 광고 삽입 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="adsense-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSettings({ enabled: checked })}
          />
          <Label htmlFor="adsense-enabled" className="text-sm font-medium">
            AdSense 광고 활성화
          </Label>
        </div>

        {settings.enabled && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                data-ad-client
              </Label>
              <Input
                placeholder="예: 9349400170540330 (숫자만 입력)"
                value={settings.adClient}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  updateSettings({ adClient: value });
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">
                data-ad-slot
              </Label>
              <Input
                placeholder="예: 3317787655 (숫자만 입력)"
                value={settings.adSlot}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  updateSettings({ adSlot: value });
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">
                광고 삽입 개수 (1-3개)
              </Label>
              <Input
                type="number"
                min="1"
                max="3"
                value={settings.adCount}
                onChange={(e) => {
                  const value = Math.min(3, Math.max(1, parseInt(e.target.value) || 1));
                  updateSettings({ adCount: value });
                }}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                본문의 H2 제목 위에 균등하게 배치됩니다
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                설정 저장
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                설정 삭제
              </Button>
            </div>
          </div>
        )}

        {!settings.enabled && (
          <p className="text-sm text-gray-500 text-center py-2">
            광고를 활성화하면 설정 옵션이 표시됩니다
          </p>
        )}
      </CardContent>
    </Card>
  );
};
