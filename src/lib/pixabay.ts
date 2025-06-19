
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
  console.log('Pixabay 이미지 통합 시작:', { 
    htmlLength: htmlContent.length,
    hasPixabayKey: !!pixabayApiKey,
    hasGeminiKey: !!geminiApiKey
  });

  try {
    // 1. HTML에서 H2 섹션들을 찾기
    const h2Sections = htmlContent.match(/<h2[^>]*>.*?<\/h2>/gi);
    if (!h2Sections || h2Sections.length === 0) {
      console.log('H2 섹션을 찾을 수 없습니다.');
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    console.log('찾은 H2 섹션 수:', h2Sections.length);

    // 2. 각 H2 섹션에서 키워드 추출
    const keywords: string[] = [];
    for (const section of h2Sections.slice(0, 5)) { // 최대 5개 섹션
      const titleMatch = section.match(/<h2[^>]*>(.*?)<\/h2>/i);
      if (titleMatch) {
        const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        const cleanTitle = title.replace(/[^\w\s가-힣]/g, ' ').trim();
        if (cleanTitle) {
          keywords.push(cleanTitle);
        }
      }
    }

    console.log('추출된 키워드들:', keywords);

    if (keywords.length === 0) {
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 3. 각 키워드로 이미지 검색 (한 번에 하나씩)
    const imagePromises = keywords.map(async (keyword) => {
      try {
        const images = await searchPixabayImages(keyword, pixabayApiKey, 1);
        return images.length > 0 ? images[0] : null;
      } catch (error) {
        console.error(`키워드 "${keyword}" 이미지 검색 실패:`, error);
        return null;
      }
    });

    const resolvedImages = await Promise.all(imagePromises);
    const validImages = resolvedImages.filter(img => img !== null);

    console.log('유효한 이미지 수:', validImages.length);

    if (validImages.length === 0) {
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 4. HTML에 이미지 삽입 (캡션 없이)
    let updatedHtml = htmlContent;
    const clipboardImages: string[] = [];

    for (let i = 0; i < Math.min(validImages.length, h2Sections.length); i++) {
      const image = validImages[i];
      const sectionTitle = h2Sections[i];
      
      // 이미지 태그 생성 (캡션 없이)
      const imageHtml = `
        <div class="image-container" style="text-align: center; margin: 30px 0;">
          <img src="${image.webformatURL}" alt="" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        </div>`;

      // 해당 H2 섹션 다음에 이미지 삽입
      const sectionEndIndex = updatedHtml.indexOf('</h2>', updatedHtml.indexOf(sectionTitle)) + 5;
      if (sectionEndIndex > 4) {
        updatedHtml = updatedHtml.slice(0, sectionEndIndex) + imageHtml + updatedHtml.slice(sectionEndIndex);
        clipboardImages.push(image.webformatURL);
      }
    }

    return { 
      finalHtml: updatedHtml, 
      imageCount: validImages.length, 
      clipboardImages 
    };

  } catch (error) {
    console.error('Pixabay 이미지 통합 중 전체 오류:', error);
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
