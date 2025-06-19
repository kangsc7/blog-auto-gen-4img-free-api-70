interface PixabayImage {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  fullHDURL: string;
  views: number;
  downloads: number;
}

export const integratePixabayImages = async (
  htmlContent: string, 
  pixabayApiKey: string, 
  geminiApiKey: string
): Promise<{ finalHtml: string; imageCount: number; clipboardImages: string[] }> => {
  try {
    console.log('🖼️ Pixabay 이미지 통합 시작');
    
    const h2Sections = htmlContent.match(/<h2[^>]*>.*?(?=<h2|$)/gs) || [];
    console.log(`발견된 H2 섹션 수: ${h2Sections.length}`);
    
    if (h2Sections.length === 0) {
      console.log('H2 섹션을 찾을 수 없음 - 이미지 삽입 건너뛰기');
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    const sectionsToProcess = h2Sections.slice(0, 5);
    console.log(`이미지 삽입 대상 섹션 수: ${sectionsToProcess.length}`);

    let finalHtml = htmlContent;
    let totalImageCount = 0;
    const clipboardImages: string[] = [];

    for (let i = 0; i < sectionsToProcess.length; i++) {
      console.log(`🔍 섹션 ${i + 1} 이미지 검색 시작`);
      
      try {
        const sectionKeywords = await extractKeywordsFromSection(sectionsToProcess[i], geminiApiKey);
        console.log(`섹션 ${i + 1} 키워드:`, sectionKeywords);
        
        const imageUrl = await searchPixabayImage(sectionKeywords, pixabayApiKey);
        
        if (imageUrl) {
          console.log(`✅ 섹션 ${i + 1} 이미지 발견:`, imageUrl);
          
          // 티스토리 호환 이미지 HTML - 실제 파일 데이터로 변환
          const sectionEndPattern = new RegExp(`(${escapeRegExp(sectionsToProcess[i])})`, 'g');
          const imageHtml = `
            <div class="image-container">
              <img 
                src="${imageUrl}" 
                alt="섹션 ${i + 1} 관련 이미지" 
                style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); cursor: pointer; user-select: none;" 
                data-section="${i + 1}"
                onclick="copyImageToClipboard(this)"
                crossorigin="anonymous"
                draggable="false">
            </div>`;
          
          finalHtml = finalHtml.replace(sectionEndPattern, `$1${imageHtml}`);
          clipboardImages.push(imageUrl);
          totalImageCount++;
          
          if (i < sectionsToProcess.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } else {
          console.log(`❌ 섹션 ${i + 1} 이미지 검색 실패`);
        }
      } catch (sectionError) {
        console.error(`섹션 ${i + 1} 이미지 처리 오류:`, sectionError);
        continue;
      }
    }

    // 티스토리 호환 이미지 복사 스크립트 - 한 번만 클릭하면 되도록 개선
    const imageScript = `
    <script type="text/javascript">
    async function copyImageToClipboard(imgElement) {
      if (!imgElement) return;
      
      try {
        console.log('🖼️ 이미지 파일 복사 시작');
        
        // 시각적 피드백
        const originalBorder = imgElement.style.border;
        const originalFilter = imgElement.style.filter;
        imgElement.style.border = '3px solid #3b82f6';
        imgElement.style.filter = 'brightness(0.8)';
        
        // 이미지를 Blob으로 변환
        const response = await fetch(imgElement.src);
        const imageBlob = await response.blob();
        
        // ClipboardItem으로 파일 데이터 복사
        const clipboardItem = new ClipboardItem({
          [imageBlob.type]: imageBlob
        });
        
        await navigator.clipboard.write([clipboardItem]);
        
        // 성공 표시
        imgElement.style.border = '3px solid #22c55e';
        imgElement.style.filter = 'brightness(1.2)';
        
        showNotification('✅ 이미지가 파일로 복사되었습니다! 티스토리에서 Ctrl+V로 붙여넣으세요.', 'success');
        
        setTimeout(() => {
          imgElement.style.border = originalBorder;
          imgElement.style.filter = originalFilter;
        }, 2000);
        
      } catch (error) {
        console.error('이미지 복사 오류:', error);
        showNotification('❌ 이미지 복사에 실패했습니다. 우클릭으로 저장해서 사용하세요.', 'error');
        
        // 원래 스타일로 복원
        setTimeout(() => {
          imgElement.style.border = originalBorder;
          imgElement.style.filter = originalFilter;
        }, 2000);
      }
    }
    
    function showNotification(message, type) {
      const colors = {
        success: '#22c55e',
        info: '#3b82f6',
        warning: '#f59e0b',
        error: '#ef4444'
      };
      
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = 
        'position: fixed; top: 20px; right: 20px; background: ' + (colors[type] || colors.info) + 
        '; color: white; padding: 15px 20px; border-radius: 8px; z-index: 10000; font-weight: bold; ' +
        'box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 300px; line-height: 1.4;';
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    }
    </script>`;

    finalHtml = finalHtml + imageScript;

    console.log(`🎯 총 ${totalImageCount}개 이미지 삽입 완료`);
    return { finalHtml, imageCount: totalImageCount, clipboardImages };

  } catch (error) {
    console.error('Pixabay 이미지 통합 전체 오류:', error);
    return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
  }
};

// 정규식 이스케이프 함수
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const extractKeywordsFromSection = async (sectionHtml: string, geminiApiKey: string): Promise<string> => {
  try {
    const textContent = sectionHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    const prompt = `다음 텍스트에서 이미지 검색에 적합한 핵심 키워드 1-2개를 영어로 추출해주세요. 구체적이고 시각적인 개념 위주로 선택하세요.

텍스트: "${textContent.substring(0, 200)}"

조건:
- 영어 키워드만 출력
- 1-2개의 핵심 단어
- 공백으로 구분
- 시각적으로 표현 가능한 개념 선택

키워드:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 50,
          temperature: 0.3,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const keywords = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      console.log('추출된 키워드:', keywords);
      return keywords;
    }
  } catch (error) {
    console.error('키워드 추출 오류:', error);
  }
  
  return 'business technology';
};

const searchPixabayImage = async (keywords: string, apiKey: string): Promise<string | null> => {
  try {
    const searchQuery = encodeURIComponent(keywords);
    const pixabayUrl = `https://pixabay.com/api/?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&category=business&min_width=640&min_height=400&safesearch=true&per_page=10`;
    
    console.log('🔍 Pixabay 검색 URL:', pixabayUrl);
    
    const response = await fetch(pixabayUrl);
    
    if (!response.ok) {
      console.error('Pixabay API 응답 오류:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log('Pixabay 응답 데이터:', data);
    
    if (data.hits && data.hits.length > 0) {
      const sortedImages = data.hits.sort((a: any, b: any) => {
        return (b.views + b.downloads) - (a.views + a.downloads);
      });
      
      const selectedImage = sortedImages[0];
      console.log('선택된 이미지:', selectedImage);
      
      return selectedImage.webformatURL || selectedImage.largeImageURL || selectedImage.fullHDURL;
    }
    
    console.log('검색 결과 없음');
    return null;
  } catch (error) {
    console.error('Pixabay 이미지 검색 오류:', error);
    return null;
  }
};

export const generateMetaDescription = async (htmlContent: string, geminiApiKey: string): Promise<string | null> => {
  try {
    const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    const prompt = `다음 텍스트를 요약하여 100~150자 사이의 매력적인 메타 설명(meta description)을 생성하세요.
    텍스트: "${textContent.substring(0, 500)}"
    
    요구사항:
    - SEO에 최적화
    - 핵심 내용 포함
    - 클릭 유도
    - 100~150자
    
    메타 설명:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.5,
        },
      }),
    });

    if (!response.ok) {
      console.error('Meta description 생성 API 응답 오류:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const metaDescription = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    
    if (metaDescription) {
      console.log('Meta description 생성 성공:', metaDescription);
      return metaDescription;
    } else {
      console.warn('Meta description 생성 실패: 응답 내용 없음');
      return null;
    }

  } catch (error) {
    console.error('Meta description 생성 중 오류:', error);
    return null;
  }
};
