
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { AppState } from '@/types';

interface UseAppUtilsProps {
  appState: AppState;
}

export const useAppUtils = ({ appState }: UseAppUtilsProps) => {
  const { toast } = useToast();
  const [whiskUrl, setWhiskUrl] = useState('https://whisk.webwide.ai/');
  
  // 텍스트를 클립보드에 복사하는 함수
  const copyToClipboard = (text: string, type: string) => {
    if (!text) {
      toast({ 
        title: "복사 실패", 
        description: "복사할 내용이 없습니다.", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      navigator.clipboard.writeText(text);
      toast({ title: `${type} 복사 완료`, description: `${type}가 클립보드에 복사되었습니다.` });
    } catch (error) {
      console.error('클립보드 복사 오류:', error);
      toast({ 
        title: "복사 실패", 
        description: "클립보드에 복사하지 못했습니다.", 
        variant: "destructive" 
      });
    }
  };
  
  // HTML 다운로드 함수
  const downloadHTML = () => {
    if (!appState.generatedContent) {
      toast({ 
        title: "다운로드 실패", 
        description: "다운로드할 콘텐츠가 없습니다.", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      // HTML 문서 생성
      const fullHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appState.selectedTopic || '생성된 블로그 글'}</title>
</head>
<body>
${appState.generatedContent}
</body>
</html>
      `;
      
      // Blob 생성
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // 다운로드 링크 생성 및 클릭
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appState.selectedTopic || '블로그_글'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // URL 객체 해제
      URL.revokeObjectURL(url);
      
      toast({ title: "HTML 다운로드 완료", description: "HTML 파일이 다운로드되었습니다." });
    } catch (error) {
      console.error('HTML 다운로드 오류:', error);
      toast({ 
        title: "다운로드 실패", 
        description: "HTML 파일을 다운로드하지 못했습니다.", 
        variant: "destructive" 
      });
    }
  };
  
  // Whisk 열기 함수
  const openWhisk = () => {
    try {
      // 새 창으로 Whisk 열기
      window.open(whiskUrl, '_blank');
      toast({ title: "Whisk 열기", description: "Whisk 이미지 생성 도구가 새 창에서 열렸습니다." });
    } catch (error) {
      console.error('Whisk 열기 오류:', error);
      toast({ 
        title: "Whisk 열기 실패", 
        description: "Whisk를 열지 못했습니다.", 
        variant: "destructive" 
      });
    }
  };
  
  return {
    copyToClipboard,
    downloadHTML,
    openWhisk,
  };
};
