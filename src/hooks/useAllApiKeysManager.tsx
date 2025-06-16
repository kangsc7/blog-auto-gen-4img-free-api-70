
import { useGeminiManager } from '@/hooks/useGeminiManager';
import { usePixabayManager } from '@/hooks/usePixabayManager';
import { useHuggingFaceManager } from '@/hooks/useHuggingFaceManager';

export const useAllApiKeysManager = () => {
  const geminiManager = useGeminiManager();
  const pixabayManager = usePixabayManager();
  const huggingFaceManager = useHuggingFaceManager();

  return {
    geminiManager,
    pixabayManager,
    huggingFaceManager,
  };
};
