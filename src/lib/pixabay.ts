
import { getColors } from './promptUtils';

interface PixabayImage {
  id: number;
  webformatURL: string;
  tags: string;
  user: string;
  views: number;
  downloads: number;
  likes: number;
}

interface PixabayResponse {
  hits: PixabayImage[];
  total: number;
  totalHits: number;
}

export const searchPixabayImages = async (
  query: string,
  apiKey: string,
  count: number = 5
): Promise<PixabayImage[]> => {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodedQuery}&image_type=photo&orientation=horizontal&category=backgrounds&min_width=800&min_height=600&per_page=${count}&safesearch=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Pixabay API 오류: ${response.status}`);
    }

    const data: PixabayResponse = await response.json();
    return data.hits || [];
  } catch (error) {
    console.error('Pixabay 이미지 검색 오류:', error);
    return [];
  }
};

export const integratePixabayImages = async (
  htmlContent: string,
  pixabayApiKey: string,
  geminiApiKey: string
): Promise<{ finalHtml: string; imageCount: number; clipboardImages: string[] }> => {
  console.log('🔥 Pixabay 이미지 통합 시작:', { 
    htmlLength: htmlContent.length,
    hasPixabayKey: !!pixabayApiKey,
    hasGeminiKey: !!geminiApiKey
  });

  try {
    // 1. HTML에서 H2 섹션들을 찾기
    const h2Sections = htmlContent.match(/<h2[^>]*>.*?<\/h2>/gi);
    if (!h2Sections || h2Sections.length === 0) {
      console.log('❌ H2 섹션을 찾을 수 없습니다.');
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    console.log('✅ 찾은 H2 섹션 수:', h2Sections.length);

    // 2. 각 H2 섹션에서 키워드 추출
    const keywords: string[] = [];
    for (const section of h2Sections.slice(0, 5)) { // 최대 5개 섹션
      const titleMatch = section.match(/<h2[^>]*>(.*?)<\/h2>/i);
      if (titleMatch) {
        const title = titleMatch[1].replace(/<[^>]*>/g, '').replace(/[💰📝🤔📌💯]/g, '').trim();
        const cleanTitle = title.replace(/[^\w\s가-힣]/g, ' ').trim();
        if (cleanTitle) {
          keywords.push(cleanTitle);
        }
      }
    }

    console.log('✅ 추출된 키워드들:', keywords);

    if (keywords.length === 0) {
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 3. 각 키워드로 이미지 검색 (순차적으로)
    const validImages: PixabayImage[] = [];
    for (let i = 0; i < keywords.length; i++) {
      try {
        console.log(`🔍 ${i+1}번째 키워드 검색:`, keywords[i]);
        const images = await searchPixabayImages(keywords[i], pixabayApiKey, 1);
        if (images.length > 0) {
          validImages.push(images[0]);
          console.log(`✅ ${i+1}번째 이미지 찾음:`, images[0].webformatURL);
        } else {
          console.log(`❌ ${i+1}번째 이미지 찾기 실패`);
        }
        // API 호출 간격 조절
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`❌ 키워드 "${keywords[i]}" 이미지 검색 실패:`, error);
      }
    }

    console.log('🎯 유효한 이미지 수:', validImages.length);

    if (validImages.length === 0) {
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 4. HTML에 이미지 삽입 (각 H2 섹션 바로 아래에)
    let updatedHtml = htmlContent;
    const clipboardImages: string[] = [];

    for (let i = 0; i < Math.min(validImages.length, h2Sections.length); i++) {
      const image = validImages[i];
      const sectionTitle = h2Sections[i];
      
      // alt 태그용 텍스트 생성 (HTML 태그 제거)
      const altText = sectionTitle.replace(/<[^>]*>/g, '').replace(/[^\w\s가-힣]/g, ' ').trim() || '블로그 이미지';
      
      // 티스토리 최적화 이미지 태그 생성 (클릭 시 복사 기능 포함)
      const imageHtml = `
        <div class="pixabay-image-container" style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <img 
            src="${image.webformatURL}" 
            alt="${altText}" 
            class="pixabay-image"
            style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); cursor: pointer; transition: all 0.3s ease; border: 3px solid #fff;" 
            onclick="window.copyImageToClipboard && window.copyImageToClipboard('${image.webformatURL}')"
            onmouseover="this.style.transform='scale(1.03)'; this.style.boxShadow='0 8px 25px rgba(0, 0, 0, 0.2)';"
            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0, 0, 0, 0.15)';"
            title="🖱️ 클릭하면 티스토리용으로 이미지가 복사됩니다"
            data-image-url="${image.webformatURL}"
          >
          <p style="margin-top: 12px; color: #64748b; font-size: 12px; font-weight: 500;">💡 이미지 클릭 시 티스토리 복사 가능</p>
        </div>`;

      // 해당 H2 섹션 바로 다음에 이미지 삽입
      const sectionEndIndex = updatedHtml.indexOf('</h2>', updatedHtml.indexOf(sectionTitle)) + 5;
      if (sectionEndIndex > 4) {
        updatedHtml = updatedHtml.slice(0, sectionEndIndex) + imageHtml + updatedHtml.slice(sectionEndIndex);
        clipboardImages.push(image.webformatURL);
        console.log(`✅ ${i+1}번째 이미지 삽입 완료`);
      }
    }

    // 5. 글로벌 이미지 복사 함수 추가
    const imageScriptHtml = `
    <script>
      window.copyImageToClipboard = async function(imageUrl) {
        try {
          console.log('🖼️ 이미지 복사 시작:', imageUrl);
          
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          const clipboardItem = new ClipboardItem({
            [blob.type]: blob
          });
          
          await navigator.clipboard.write([clipboardItem]);
          
          // 성공 알림 표시
          const toast = document.createElement('div');
          toast.innerHTML = '✅ 티스토리용 이미지 복사 완료! Ctrl+V로 붙여넣으세요';
          toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 20px; border-radius: 8px; font-weight: bold; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
          document.body.appendChild(toast);
          setTimeout(() => document.body.removeChild(toast), 3000);
          
        } catch (error) {
          console.error('❌ 이미지 복사 실패:', error);
          const toast = document.createElement('div');
          toast.innerHTML = '⚠️ 이미지 복사 실패. 우클릭으로 시도해보세요';
          toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 12px 20px; border-radius: 8px; font-weight: bold; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
          document.body.appendChild(toast);
          setTimeout(() => document.body.removeChild(toast), 3000);
        }
      };
    </script>`;

    updatedHtml = updatedHtml + imageScriptHtml;

    return { 
      finalHtml: updatedHtml, 
      imageCount: validImages.length, 
      clipboardImages 
    };

  } catch (error) {
    console.error('❌ Pixabay 이미지 통합 중 전체 오류:', error);
    return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
  }
};

export const generateMetaDescription = async (
  htmlContent: string,
  geminiApiKey: string
): Promise<string> => {
  try {
    const prompt = `다음 HTML 콘텐츠를 바탕으로 SEO에 최적화된 메타 설명을 140-160자 내외로 작성해주세요. 키워드가 자연스럽게 포함되어야 하고, 독자의 클릭을 유도할 수 있어야 합니다.

HTML 콘텐츠:
${htmlContent.substring(0, 1000)}...

메타 설명만 출력해주세요:`;

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('메타 설명 생성 API 호출 실패');
    }

    const data = await response.json();
    const metaDescription = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    return metaDescription.length > 160 ? metaDescription.substring(0, 157) + '...' : metaDescription;
  } catch (error) {
    console.error('메타 설명 생성 오류:', error);
    return '';
  }
};
