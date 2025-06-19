
import { useToast } from '@/hooks/use-toast';

interface UseGenerationControlsProps {
  isOneClickGenerating: boolean;
  isGeneratingContent: boolean;
  handleStopOneClick: () => void;
  stopArticleGeneration: () => void;
  handleResetApp: () => void;
}

export const useGenerationControls = ({
  isOneClickGenerating,
  isGeneratingContent,
  handleStopOneClick,
  stopArticleGeneration,
  handleResetApp,
}: UseGenerationControlsProps) => {
  const { toast } = useToast();

  const handleUnifiedStop = () => {
    console.log('통합 중단 버튼 클릭 - 상태:', { 
      isOneClickGenerating, 
      isGeneratingContent 
    });
    
    if (isOneClickGenerating) {
      handleStopOneClick();
    }
    
    if (isGeneratingContent) {
      stopArticleGeneration();
    }
  };

  const enhancedResetApp = () => {
    console.log('🔄 향상된 초기화 시작');
    
    // 편집기에 초기화 이벤트 발송
    window.dispatchEvent(new Event('app-reset'));
    
    // 기존 초기화 실행
    handleResetApp();
    
    console.log('✅향상된 초기화 완료');
  };

  const convertToMarkdown = (selectedTopic: string, generatedContent: string) => {
    const markdown = `# ${selectedTopic}\n\n${generatedContent}`;
    navigator.clipboard.writeText(markdown).then(() => {
      toast({
        title: "마크다운 복사 완료",
        description: "마크다운 형식으로 복사되었습니다.",
      });
    }).catch(() => {
      toast({
        title: "복사 실패",
        description: "마크다운 복사에 실패했습니다.",
        variant: "destructive",
      });
    });
  };

  return {
    handleUnifiedStop,
    enhancedResetApp,
    convertToMarkdown,
  };
};
