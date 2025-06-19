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

// H2 섹션에서 키워드 추출 및 최적화
const extractOptimizedKeywords = (htmlContent: string): string[] => {
  console.log('🔍 H2 섹션에서 키워드 추출 시작');
  
  const h2Sections = htmlContent.match(/<h2[^>]*>.*?<\/h2>/gi);
  if (!h2Sections || h2Sections.length === 0) {
    console.log('❌ H2 섹션을 찾을 수 없습니다.');
    return [];
  }

  const optimizedKeywords: string[] = [];
  
  for (const section of h2Sections.slice(0, 5)) {
    const titleMatch = section.match(/<h2[^>]*>(.*?)<\/h2>/i);
    if (titleMatch) {
      let title = titleMatch[1].replace(/<[^>]*>/g, '').replace(/[💰📝🤔📌💯✨🎯⚡🔥💡]/g, '').trim();
      
      // 픽사베이 최적화된 영어 키워드로 변환
      const koreanToEnglish: { [key: string]: string } = {
        '지원금': 'money support',
        '신청': 'application',
        '방법': 'method',
        '조건': 'requirements',
        '자격': 'eligibility',
        '혜택': 'benefits',
        '정부': 'government',
        '디지털': 'digital',
        '플랫폼': 'platform',
        '온라인': 'online',
        '서비스': 'service',
        '복지': 'welfare',
        '생계급여': 'basic livelihood',
        '주거급여': 'housing allowance',
        '의료급여': 'medical aid',
        '교육급여': 'education support'
      };
      
      let englishKeyword = title;
      Object.entries(koreanToEnglish).forEach(([korean, english]) => {
        if (title.includes(korean)) {
          englishKeyword = english;
        }
      });
      
      // 일반적인 배경 이미지 키워드로 보완
      const backgroundKeywords = [
        'business meeting',
        'office work',
        'documents',
        'calculator money',
        'government building',
        'digital technology',
        'people working',
        'financial planning'
      ];
      
      const finalKeyword = englishKeyword.length > 3 ? englishKeyword : backgroundKeywords[Math.floor(Math.random() * backgroundKeywords.length)];
      optimizedKeywords.push(finalKeyword);
      console.log(`✅ 키워드 최적화: "${title}" → "${finalKeyword}"`);
    }
  }

  return optimizedKeywords;
};

// 7페이지까지 검색하는 함수
export const searchPixabayImagesAdvanced = async (
  query: string,
  apiKey: string,
  maxImages: number = 1
): Promise<PixabayImage[]> => {
  console.log(`🔍 고급 검색 시작: "${query}" (최대 ${maxImages}개)`);
  
  const validImages: PixabayImage[] = [];
  const encodedQuery = encodeURIComponent(query);
  
  // 7페이지까지 검색
  for (let page = 1; page <= 7 && validImages.length < maxImages; page++) {
    try {
      const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodedQuery}&image_type=photo&orientation=horizontal&category=backgrounds&min_width=800&min_height=600&per_page=20&page=${page}&safesearch=true&order=popular`;
      
      console.log(`📡 ${page}페이지 검색: ${url.substring(0, 100)}...`);
      
      const response = await fetch(url);
      
      if (response.status === 429) {
        console.warn(`⚠️ ${page}페이지 - API 한도 초과, 0.5초 대기 후 재시도`);
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      
      if (!response.ok) {
        console.error(`❌ ${page}페이지 - API 오류: ${response.status}`);
        continue;
      }

      const data: PixabayResponse = await response.json();
      console.log(`✅ ${page}페이지 - ${data.hits.length}개 이미지 발견`);
      
      if (data.hits && data.hits.length > 0) {
        // 품질 좋은 이미지만 선별
        const qualityImages = data.hits.filter(img => 
          img.views > 1000 && 
          img.downloads > 100 && 
          img.webformatURL.includes('pixabay.com')
        );
        
        validImages.push(...qualityImages.slice(0, maxImages - validImages.length));
        console.log(`🎯 ${page}페이지에서 ${qualityImages.length}개 품질 이미지 추가`);
        
        if (validImages.length >= maxImages) break;
      }
      
      // API 호출 간격
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(`❌ ${page}페이지 검색 실패:`, error);
      continue;
    }
  }
  
  console.log(`🏁 최종 결과: ${validImages.length}개 이미지 발견`);
  return validImages;
};

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
  console.log('🔥 개선된 Pixabay 이미지 통합 시작:', { 
    htmlLength: htmlContent.length,
    hasPixabayKey: !!pixabayApiKey,
    hasGeminiKey: !!geminiApiKey
  });

  try {
    // 1. 최적화된 키워드 추출
    const optimizedKeywords = extractOptimizedKeywords(htmlContent);
    console.log('✅ 최적화된 키워드들:', optimizedKeywords);

    if (optimizedKeywords.length === 0) {
      console.log('❌ 추출된 키워드가 없습니다.');
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 2. H2 섹션들 찾기
    const h2Sections = htmlContent.match(/<h2[^>]*>.*?<\/h2>/gi);
    if (!h2Sections) {
      console.log('❌ H2 섹션을 찾을 수 없습니다.');
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 3. 각 키워드로 고급 이미지 검색
    const validImages: PixabayImage[] = [];
    for (let i = 0; i < optimizedKeywords.length; i++) {
      try {
        console.log(`🔍 ${i+1}번째 고급 검색:`, optimizedKeywords[i]);
        const images = await searchPixabayImagesAdvanced(optimizedKeywords[i], pixabayApiKey, 1);
        
        if (images.length > 0) {
          validImages.push(images[0]);
          console.log(`✅ ${i+1}번째 이미지 성공:`, images[0].webformatURL);
        } else {
          console.log(`❌ ${i+1}번째 이미지 실패 - 폴백 검색 시도`);
          // 폴백: 일반적인 키워드로 재검색
          const fallbackImages = await searchPixabayImagesAdvanced('business meeting office', pixabayApiKey, 1);
          if (fallbackImages.length > 0) {
            validImages.push(fallbackImages[0]);
            console.log(`✅ ${i+1}번째 폴백 이미지 성공:`, fallbackImages[0].webformatURL);
          }
        }
        
        // API 호출 간격
        await new Promise(resolve => setTimeout(resolve, 400));
      } catch (error) {
        console.error(`❌ ${i+1}번째 키워드 검색 실패:`, error);
      }
    }

    console.log('🎯 최종 유효한 이미지 수:', validImages.length);

    if (validImages.length === 0) {
      console.log('❌ 사용 가능한 이미지가 없습니다.');
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 4. HTML에 이미지 삽입
    let updatedHtml = htmlContent;
    const clipboardImages: string[] = [];

    for (let i = 0; i < Math.min(validImages.length, h2Sections.length); i++) {
      const image = validImages[i];
      const sectionTitle = h2Sections[i];
      
      const altText = sectionTitle.replace(/<[^>]*>/g, '').replace(/[^\w\s가-힣]/g, ' ').trim() || '블로그 이미지';
      
      // 티스토리 최적화 이미지 태그 (클릭 복사 기능 포함)
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
          >
          <p style="margin-top: 15px; color: #64748b; font-size: 13px; font-weight: 600;">💡 이미지 클릭 시 티스토리 복사 가능 (Ctrl+V로 붙여넣기)</p>
          <p style="margin-top: 8px; color: #94a3b8; font-size: 11px;">📊 조회수: ${image.views.toLocaleString()} | 다운로드: ${image.downloads.toLocaleString()}</p>
        </div>`;

      // H2 섹션 바로 다음에 이미지 삽입
      const sectionEndIndex = updatedHtml.indexOf('</h2>', updatedHtml.indexOf(sectionTitle)) + 5;
      if (sectionEndIndex > 4) {
        updatedHtml = updatedHtml.slice(0, sectionEndIndex) + imageHtml + updatedHtml.slice(sectionEndIndex);
        clipboardImages.push(image.webformatURL);
        console.log(`✅ ${i+1}번째 이미지 삽입 완료`);
      }
    }

    // 5. 글로벌 이미지 복사 함수 (강화된 버전)
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
          toast.innerHTML = '✅ 티스토리용 이미지 복사 완료! Ctrl+V로 붙여넣으세요';
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
