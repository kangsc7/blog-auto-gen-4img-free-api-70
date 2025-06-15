
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useImagePromptGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDirectlyGenerating, setIsDirectlyGenerating] = useState(false);

  const createImagePrompt = async (inputText: string): Promise<boolean> => {
    if (!inputText.trim()) {
      toast({ title: "입력 오류", description: "프롬프트를 생성할 텍스트를 입력해주세요.", variant: "destructive" });
      return false;
    }
    if (!appState.isApiKeyValidated) {
      toast({ title: "API 키 검증 필요", description: "먼저 API 키를 입력하고 검증해주세요.", variant: "destructive" });
      return false;
    }

    setIsGeneratingImage(true);
    saveAppState({ imagePrompt: '' }); // Clear previous prompt
    try {
      const masterPrompt = `
You are an expert AI image prompt engineer. Your task is to transform a Korean text input into a single, high-quality image prompt in English. Follow these instructions meticulously:

**Input Korean Text:**
---
${inputText}
---

**Core Instructions:**

1.  **Primary Goal:** Analyze the core meaning, keywords, and mood of the input text. Synthesize this into a single, compelling visual scene. The output must be a ready-to-use prompt for an AI image generator.

2.  **Content Generation:**
    *   Extract the core visual message, key symbols, and dominant emotions from the text.
    *   Focus on actions, atmosphere, and symbolic representation rather than literal translation.
    *   The overall mood must be **bright, warm, and positive**. Use elements like warm sunlight, soft colors, and vibrant, happy expressions.

3.  **Prompt Structure and Formatting (Strict):**
    *   The entire output must be a **single sentence in English**.
    *   Follow this structure: [Main scene/subject description], [background description], [emotion and lighting style], [style and quality keywords].
    *   **Do NOT** include a period (.) at the end.
    *   **Do NOT** include any explanations, numbers, or list formatting. Output only the prompt itself.

4.  **Visual & Style Keywords (Mandatory):**
    *   **Main Subject:** The prompt must feature a clear, central subject that is sophisticated and detailed.
    *   **Background:** The background should be complementary, supporting the main subject without causing distraction. Use techniques like soft focus (bokeh) or contrast to emphasize the subject.
    *   **Mandatory Keywords:** The prompt **must end with** the following phrase: "4k photorealistic style, high detail, realistic, natural lighting, cinematic".

5.  **Content Policy & Safety (Crucial):**
    *   **People:** If any person appears, they **MUST** be described as **Korean**. (e.g., "A Korean woman smiling", "A group of Korean friends").
    *   **No Real People:** Avoid names or direct likenesses of famous individuals (celebrities, politicians). Use general descriptions (e.g., "a visionary tech leader").
    *   **Safety Compliance:** Ensure the prompt is safe and complies with policies of Google ImageFX and OpenAI. It must not contain:
        *   Explicit violence, gore, or sexual content.
        *   Sensitive political or religious themes.
        *   Content that could be interpreted as misinformation or conspiracy.

**Example Transformation:**
*   **Input:** "햇살 좋은 카페에서 노트북으로 글을 쓰는 프리랜서의 여유로운 오후"
*   **Output:** A Korean woman writing on a laptop in a sunlit modern cafe, with the bustling city street blurred through the window, an atmosphere of warm inspiration, soft golden lighting, 4k photorealistic style, high detail, realistic, natural lighting, cinematic
`;

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: masterPrompt }] }] })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
      }
      
      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }
      
      const generatedPrompt = data.candidates[0].content.parts[0].text.trim();
      
      saveAppState({ imagePrompt: generatedPrompt });
      toast({ title: "이미지 프롬프트 생성 완료", description: "ImageFX에서 사용할 수 있는 프롬프트가 생성되었습니다." });
      return true;
    } catch (error) {
      console.error('이미지 프롬프트 생성 오류:', error);
      toast({ title: "프롬프트 생성 실패", description: error instanceof Error ? error.message : "이미지 프롬프트 생성 중 오류가 발생했습니다.", variant: "destructive" });
      return false;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateDirectImage = async (): Promise<string | null> => {
    if (!appState.imagePrompt) {
      toast({ title: "프롬프트 필요", description: "먼저 이미지 프롬프트를 생성해주세요.", variant: "destructive" });
      return null;
    }

    setIsDirectlyGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image-hf', {
        body: { prompt: appState.imagePrompt },
      });

      if (error) {
        throw error; // Re-throw the error to be handled by the catch block
      }
      
      const { image } = data;
      if (!image) {
        throw new Error('API로부터 유효한 이미지를 받지 못했습니다.');
      }

      toast({ title: "이미지 생성 완료", description: "프롬프트 기반 이미지가 생성되었습니다." });
      return image;

    } catch (error: any) {
      console.error('직접 이미지 생성 오류:', error);
      let errorMessage = error instanceof Error ? error.message : "이미지 생성 중 오류가 발생했습니다.";
      // Try to parse a more detailed error from the Supabase function response context
      if (error.context && typeof error.context.json === 'function') {
        try {
          const functionError = await error.context.json();
          if (functionError.error && functionError.details) {
            errorMessage = `${functionError.error}: ${functionError.details}`;
          } else {
            errorMessage = functionError.error || functionError.details || errorMessage;
          }
        } catch (e) {
          // Parsing failed, stick with the original message
        }
      }
      toast({ title: "이미지 생성 실패", description: errorMessage, variant: "destructive" });
      return null;
    } finally {
      setIsDirectlyGenerating(false);
    }
  };

  return { isGeneratingImage, createImagePrompt, isDirectlyGenerating, generateDirectImage };
};
