
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

// H2 섹션에서 영어 이미지 프롬프트 생성 함수
const generateImagePromptFromSection = async (
  sectionTitle: string,
  geminiApiKey: string
): Promise<string> => {
  try {
    const cleanTitle = sectionTitle.replace(/<[^>]*>/g, '').replace(/[💰📝🤔📌💯✨🎯⚡🔥💡]/g, '').trim();
    
    const prompt = `"${cleanTitle}"라는 한국어 소제목을 픽사베이에서 검색하기 위한 최적의 영어 키워드로 변환해주세요.

🎯 변환 조건:
- 3-5단어의 간결한 영어 표현
- 픽사베이에서 실제로 찾을 수 있는 이미지 키워드
- 정부지원금, 복지 관련 주제라면 business, government, support, money, application 등 관련 키워드 사용
- 너무 구체적이지 않고 적절히 일반적인 표현

예시:
- "지원금 신청방법" → "government support application"
- "자격조건 확인" → "eligibility requirements check"
- "혜택 내용" → "financial benefits overview"

다른 설명 없이 영어 키워드만 제공해주세요:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 50,
        },
      }),
    });

    if (!response.ok) throw new Error('Gemini API 오류');

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (result) {
      const cleanedResult = result.replace(/^["']|["']$/g, '').trim();
      console.log(`✅ 이미지 프롬프트 생성: "${cleanTitle}" → "${cleanedResult}"`);
      return cleanedResult;
    }
    
    throw new Error('Gemini 응답 없음');
    
  } catch (error) {
    console.error('이미지 프롬프트 생성 실패:', error);
    
    // 백업: 기본 키워드 매핑
    const fallbackMap: { [key: string]: string } = {
      '지원금': 'government financial support',
      '신청': 'application process',
      '방법': 'method guide',
      '조건': 'requirements criteria',
      '자격': 'eligibility qualification',
      '혜택': 'benefits overview',
      '정부': 'government services',
      '복지': 'welfare support'
    };
    
    for (const [korean, english] of Object.entries(fallbackMap)) {
      if (sectionTitle.includes(korean)) {
        console.log(`🔄 백업 키워드 사용: "${sectionTitle}" → "${english}"`);
        return english;
      }
    }
    
    return 'business office documents';
  }
};

// 10페이지 검색으로 중복 없는 이미지 수집
export const searchPixabayAdvanced = async (
  query: string,
  apiKey: string,
  usedImageIds: number[] = [],
  maxPages: number = 10
): Promise<PixabayImage | null> => {
  console.log(`🔍 고급 검색 시작: "${query}" (최대 ${maxPages}페이지, 제외 ID: ${usedImageIds.length}개)`);
  
  const encodedQuery = encodeURIComponent(query);
  
  // 카테고리별 순환 검색 (공식 가이드 기준)
  const categories = [
    'business', 'backgrounds', 'education', 'people', 
    'buildings', 'computer', 'industry', 'places'
  ];
  
  for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
    const category = categories[categoryIndex];
    
    for (let page = 1; page <= maxPages; page++) {
      try {
        // 픽사베이 공식 파라미터 사용
        const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodedQuery}&image_type=photo&orientation=horizontal&category=${category}&min_width=800&min_height=600&per_page=20&page=${page}&safesearch=true&order=popular&editors_choice=false`;
        
        console.log(`📡 ${categoryIndex + 1}번째 카테고리(${category}) ${page}페이지 검색`);
        
        const response = await fetch(url);
        
        if (response.status === 429) {
          console.warn(`⚠️ API 한도 초과, 1초 대기`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        if (!response.ok) {
          console.error(`❌ API 오류: ${response.status}`);
          continue;
        }

        const data: PixabayResponse = await response.json();
        console.log(`📊 ${category} ${page}페이지: ${data.hits.length}개 이미지 발견`);
        
        if (data.hits && data.hits.length > 0) {
          // 중복 제거 및 품질 필터링
          const filteredImages = data.hits.filter(img => 
            !usedImageIds.includes(img.id) && // 중복 제거
            img.views > 500 && // 최소 조회수
            img.downloads > 100 && // 최소 다운로드수
            img.webformatURL.includes('pixabay.com') // 유효한 URL
          );
          
          if (filteredImages.length > 0) {
            const selectedImage = filteredImages[0];
            console.log(`🎯 중복 없는 이미지 발견: ID ${selectedImage.id} (${category} ${page}페이지)`);
            return selectedImage;
          }
        }
        
        // API 호출 간격 (공식 가이드 권장)
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ ${category} ${page}페이지 검색 실패:`, error);
        continue;
      }
    }
  }
  
  console.log(`❌ ${maxPages}페이지 모든 카테고리 검색 완료, 적합한 이미지 없음`);
  return null;
};

// H2 섹션별 이미지 프롬프트 생성 및 추출
const extractSectionImagePrompts = async (
  htmlContent: string,
  geminiApiKey: string
): Promise<{ title: string; prompt: string }[]> => {
  console.log('🔍 H2 섹션별 이미지 프롬프트 생성 시작');
  
  const h2Sections = htmlContent.match(/<h2[^>]*>.*?<\/h2>/gi);
  if (!h2Sections || h2Sections.length === 0) {
    console.log('❌ H2 섹션을 찾을 수 없습니다.');
    return [];
  }

  const sectionPrompts: { title: string; prompt: string }[] = [];
  
  for (let i = 0; i < Math.min(h2Sections.length, 5); i++) {
    const section = h2Sections[i];
    const titleMatch = section.match(/<h2[^>]*>(.*?)<\/h2>/i);
    
    if (titleMatch) {
      const title = titleMatch[1];
      const prompt = await generateImagePromptFromSection(title, geminiApiKey);
      
      sectionPrompts.push({ title, prompt });
      console.log(`✅ ${i + 1}번째 섹션 프롬프트: "${title}" → "${prompt}"`);
      
      // Gemini API 호출 간격
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return sectionPrompts;
};

export const integratePixabayImages = async (
  htmlContent: string,
  pixabayApiKey: string,
  geminiApiKey: string
): Promise<{ finalHtml: string; imageCount: number; clipboardImages: string[] }> => {
  console.log('🔥 픽사베이 고급 이미지 통합 시작 (10페이지 검색, 중복 방지)');

  try {
    // 1. H2 섹션별 이미지 프롬프트 생성
    const sectionPrompts = await extractSectionImagePrompts(htmlContent, geminiApiKey);
    
    if (sectionPrompts.length === 0) {
      console.log('❌ 생성된 이미지 프롬프트가 없습니다.');
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 2. H2 섹션들 찾기
    const h2Sections = htmlContent.match(/<h2[^>]*>.*?<\/h2>/gi);
    if (!h2Sections) {
      console.log('❌ H2 섹션을 찾을 수 없습니다.');
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 3. 중복 방지를 위한 사용된 이미지 ID 추적
    const usedImageIds: number[] = [];
    const validImages: PixabayImage[] = [];

    // 4. 각 섹션별로 10페이지 검색하여 중복 없는 이미지 수집
    for (let i = 0; i < sectionPrompts.length; i++) {
      const { title, prompt } = sectionPrompts[i];
      
      try {
        console.log(`🔍 ${i + 1}번째 섹션 고급 검색: "${prompt}"`);
        
        const image = await searchPixabayAdvanced(prompt, pixabayApiKey, usedImageIds, 10);
        
        if (image) {
          validImages.push(image);
          usedImageIds.push(image.id);
          console.log(`✅ ${i + 1}번째 섹션 이미지 성공: ID ${image.id}`);
        } else {
          console.log(`❌ ${i + 1}번째 섹션 이미지 실패, 백업 검색`);
          
          // 백업: 일반적인 비즈니스 이미지 검색
          const fallbackImage = await searchPixabayAdvanced('business office meeting', pixabayApiKey, usedImageIds, 5);
          if (fallbackImage && !usedImageIds.includes(fallbackImage.id)) {
            validImages.push(fallbackImage);
            usedImageIds.push(fallbackImage.id);
            console.log(`✅ ${i + 1}번째 섹션 백업 이미지 성공: ID ${fallbackImage.id}`);
          }
        }
        
        // API 호출 간격
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ ${i + 1}번째 섹션 검색 실패:`, error);
      }
    }

    console.log('🎯 고급 검색 완료 - 최종 유효한 이미지 수:', validImages.length);
    console.log('📊 사용된 이미지 ID들:', usedImageIds);

    if (validImages.length === 0) {
      console.log('❌ 사용 가능한 이미지가 없습니다.');
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 5. HTML에 이미지 삽입
    let updatedHtml = htmlContent;
    const clipboardImages: string[] = [];

    for (let i = 0; i < Math.min(validImages.length, h2Sections.length); i++) {
      const image = validImages[i];
      const sectionTitle = h2Sections[i];
      
      const altText = sectionTitle.replace(/<[^>]*>/g, '').replace(/[^\w\s가-힣]/g, ' ').trim() || '블로그 이미지';
      
      // 티스토리 최적화 이미지 태그
      const imageHtml = `
        <div class="pixabay-image-container" style="text-align: center; margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius: 15px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);">
          <img 
            src="${image.webformatURL}" 
            alt="${altText}" 
            class="pixabay-image clickable-image"
            style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); cursor: pointer; transition: all 0.3s ease; border: 3px solid #fff;" 
            onclick="window.copyImageToClipboard && window.copyImageToClipboard('${image.webformatURL}')"
            onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 12px 35px rgba(0, 0, 0, 0.3)';"
            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 25px rgba(0, 0, 0, 0.2)';"
            title="🖱️ 클릭하면 티스토리용으로 이미지가 복사됩니다"
            data-image-url="${image.webformatURL}"
            data-image-id="${image.id}"
            data-section-index="${i + 1}"
          >
        </div>`;

      // H2 섹션 바로 다음에 이미지 삽입
      const sectionEndIndex = updatedHtml.indexOf('</h2>', updatedHtml.indexOf(sectionTitle)) + 5;
      if (sectionEndIndex > 4) {
        updatedHtml = updatedHtml.slice(0, sectionEndIndex) + imageHtml + updatedHtml.slice(sectionEndIndex);
        clipboardImages.push(image.webformatURL);
        console.log(`✅ ${i + 1}번째 이미지 삽입 완료 (ID: ${image.id})`);
      }
    }

    // 6. 이미지 복사 스크립트 (개선된 버전)
    const imageScriptHtml = `
    <script>
      window.copyImageToClipboard = async function(imageUrl) {
        try {
          console.log('🖼️ 티스토리 이미지 복사 시작:', imageUrl);
          
          const response = await fetch(imageUrl, { mode: 'cors' });
          const blob = await response.blob();
          
          const clipboardItem = new ClipboardItem({
            [blob.type]: blob
          });
          
          await navigator.clipboard.write([clipboardItem]);
          
          // 성공 알림
          const toast = document.createElement('div');
          toast.innerHTML = '✅ 중복 없는 고품질 이미지 복사 완료! Ctrl+V로 붙여넣으세요';
          toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 15px 25px; border-radius: 10px; font-weight: bold; z-index: 10000; box-shadow: 0 6px 20px rgba(0,0,0,0.3); animation: slideIn 0.3s ease;';
          document.body.appendChild(toast);
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 4000);
          
        } catch (error) {
          console.error('❌ 이미지 복사 실패:', error);
          const toast = document.createElement('div');
          toast.innerHTML = '⚠️ 이미지 복사 실패. 우클릭으로 시도해보세요';
          toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 15px 25px; border-radius: 10px; font-weight: bold; z-index: 10000; box-shadow: 0 6px 20px rgba(0,0,0,0.3);';
          document.body.appendChild(toast);
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 4000);
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
    console.error('❌ 픽사베이 고급 이미지 통합 중 전체 오류:', error);
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

// 기존 함수들도 유지 (하위 호환성)
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
