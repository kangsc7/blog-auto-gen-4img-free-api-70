
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, ImagePlus, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface RefactoredApiKeysSectionProps {
  geminiManager: any;
  pixabayManager: any;
  huggingFaceManager: any;
}

export const RefactoredApiKeysSection: React.FC<RefactoredApiKeysSectionProps> = ({
  geminiManager,
  pixabayManager,
  huggingFaceManager
}) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log('RefactoredApiKeysSection 렌더링 - 매니저 상태:', {
    gemini: { key: geminiManager.geminiApiKey, validated: geminiManager.isGeminiApiKeyValidated },
    pixabay: { key: pixabayManager.pixabayApiKey, validated: pixabayManager.isPixabayApiKeyValidated },
    huggingface: { key: huggingFaceManager.huggingFaceApiKey, validated: huggingFaceManager.isHuggingFaceApiKeyValidated }
  });

  return (
    <div className="container mx-auto mt-2 mb-4 px-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  API 키 설정
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          {/* Gemini API 키 설정 */}
          <Card className="shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                Gemini API 키 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API 키</label>
                <div className="flex space-x-2">
                  <Input
                    type="password"
                    placeholder="API 키를 입력해주세요"
                    value={geminiManager.geminiApiKey || ''}
                    onChange={(e) => {
                      geminiManager.setGeminiApiKey(e.target.value);
                      geminiManager.setIsGeminiApiKeyValidated(false);
                    }}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => geminiManager.validateGeminiApiKey(geminiManager.geminiApiKey)} 
                    disabled={!geminiManager.geminiApiKey?.trim() || geminiManager.isGeminiValidating}
                    variant="outline" 
                    className={geminiManager.isGeminiApiKeyValidated ? "text-green-600 border-green-600 hover:bg-green-50" : "text-blue-600 border-blue-600 hover:bg-blue-50"}
                  >
                    {geminiManager.isGeminiValidating ? (
                      <>검증 중...</>
                    ) : geminiManager.isGeminiApiKeyValidated ? (
                      <><CheckCircle className="h-4 w-4 mr-1" />연결됨</>
                    ) : (
                      '검증 및 저장'
                    )}
                  </Button>
                </div>
                <div className="flex space-x-2 mt-2">
                  <Button onClick={geminiManager.deleteGeminiApiKeyFromStorage} size="sm" variant="destructive" className="w-full">
                    키 삭제
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="hover:underline">Google AI Studio에서 발급</a>
                </p>
                {geminiManager.isGeminiApiKeyValidated && (
                  <p className="text-xs text-green-600 mt-1">✅ API 키가 검증 및 저장되었습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pixabay API 키 설정 */}
          <Card className="shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <ImagePlus className="h-5 w-5 mr-2" />
                Pixabay API 키 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pixabay API 키</label>
                <div className="flex space-x-2">
                  <Input
                    type="password"
                    placeholder="Pixabay API 키를 입력해주세요"
                    value={pixabayManager.pixabayApiKey || ''}
                    onChange={(e) => {
                      pixabayManager.setPixabayApiKey(e.target.value);
                      pixabayManager.setIsPixabayApiKeyValidated(false);
                    }}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => pixabayManager.validatePixabayApiKey(pixabayManager.pixabayApiKey)} 
                    disabled={!pixabayManager.pixabayApiKey?.trim() || pixabayManager.isPixabayValidating}
                    variant="outline" 
                    className={pixabayManager.isPixabayApiKeyValidated ? "text-green-600 border-green-600 hover:bg-green-50" : "text-orange-600 border-orange-600 hover:bg-orange-50"}
                  >
                    {pixabayManager.isPixabayValidating ? (
                      <>검증 중...</>
                    ) : pixabayManager.isPixabayApiKeyValidated ? (
                      <><CheckCircle className="h-4 w-4 mr-1" />연결됨</>
                    ) : (
                      '검증 및 저장'
                    )}
                  </Button>
                </div>
                <div className="flex space-x-2 mt-2">
                  <Button onClick={pixabayManager.deletePixabayApiKeyFromStorage} size="sm" variant="destructive" className="w-full">
                    키 삭제
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  <a href="https://pixabay.com/api/docs/" target="_blank" rel="noopener noreferrer" className="hover:underline">Pixabay에서 API 키 발급</a>
                </p>
                {pixabayManager.isPixabayApiKeyValidated && (
                  <p className="text-xs text-green-600 mt-1">✅ Pixabay API 키가 검증 및 저장되었습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hugging Face API 키 설정 */}
          <Card className="shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                Hugging Face API 키 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hugging Face User Access Token</label>
                <div className="flex space-x-2">
                  <Input
                    type="password"
                    placeholder="Hugging Face User Access Token을 입력해주세요"
                    value={huggingFaceManager.huggingFaceApiKey || ''}
                    onChange={(e) => {
                      huggingFaceManager.setHuggingFaceApiKey(e.target.value);
                      huggingFaceManager.setIsHuggingFaceApiKeyValidated(false);
                    }}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => huggingFaceManager.validateHuggingFaceApiKey(huggingFaceManager.huggingFaceApiKey)} 
                    disabled={!huggingFaceManager.huggingFaceApiKey?.trim() || huggingFaceManager.isHuggingFaceValidating}
                    variant="outline" 
                    className={huggingFaceManager.isHuggingFaceApiKeyValidated ? "text-green-600 border-green-600 hover:bg-green-50" : "text-purple-600 border-purple-600 hover:bg-purple-50"}
                  >
                    {huggingFaceManager.isHuggingFaceValidating ? (
                      <>검증 중...</>
                    ) : huggingFaceManager.isHuggingFaceApiKeyValidated ? (
                      <><CheckCircle className="h-4 w-4 mr-1" />연결됨</>
                    ) : (
                      '검증 및 저장'
                    )}
                  </Button>
                </div>
                <div className="flex space-x-2 mt-2">
                  <Button onClick={huggingFaceManager.deleteHuggingFaceApiKeyFromStorage} size="sm" variant="destructive" className="w-full">
                    키 삭제
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="hover:underline">Hugging Face에서 Access Token 발급</a>
                </p>
                {huggingFaceManager.isHuggingFaceApiKeyValidated && (
                  <p className="text-xs text-green-600 mt-1">✅ API 키가 검증 및 저장되었습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
