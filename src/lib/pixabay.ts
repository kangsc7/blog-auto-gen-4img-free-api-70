
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
    
    // HTML에서 H2 섹션들을 찾기
    const h2Sections = htmlContent.match(/<h2[^>]*>.*?(?=<h2|$)/gs) || [];
    console.log(`발견된 H2 섹션 수: ${h2Sections.length}`);
    
    if (h2Sections.length === 0) {
      console.log('H2 섹션을 찾을 수 없음 - 이미지 삽입 건너뛰기');
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 5개 섹션에 이미지 삽입 (6번째는 마무리 섹션이므로 제외)
    const sectionsToProcess = h2Sections.slice(0, 5);
    console.log(`이미지 삽입 대상 섹션 수: ${sectionsToProcess.length}`);

    let finalHtml = htmlContent;
    let totalImageCount = 0;
    const clipboardImages: string[] = [];

    // 각 섹션에 대해 이미지 검색 및 삽입
    for (let i = 0; i < sectionsToProcess.length; i++) {
      console.log(`🔍 섹션 ${i + 1} 이미지 검색 시작`);
      
      try {
        // 섹션에서 키워드 추출
        const sectionKeywords = await extractKeywordsFromSection(sectionsToProcess[i], geminiApiKey);
        console.log(`섹션 ${i + 1} 키워드:`, sectionKeywords);
        
        // Pixabay 이미지 검색
        const imageUrl = await searchPixabayImage(sectionKeywords, pixabayApiKey);
        
        if (imageUrl) {
          console.log(`✅ 섹션 ${i + 1} 이미지 발견:`, imageUrl);
          
          // 이미지를 해당 섹션 끝에 삽입 - 티스토리 복사/붙여넣기 최적화
          const sectionEndPattern = new RegExp(`(${escapeRegExp(sectionsToProcess[i])})`, 'g');
          const imageHtml = `
            <div style="text-align: center; margin: 20px 0;">
              <img src="${imageUrl}" alt="섹션 ${i + 1} 관련 이미지" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); cursor: pointer;" class="copyable-image tistory-optimized-image" data-original-src="${imageUrl}" onclick="makeImageCopyable(this)" crossorigin="anonymous" data-filename="section_${i + 1}_image.png">
            </div>`;
          
          finalHtml = finalHtml.replace(sectionEndPattern, `$1${imageHtml}`);
          clipboardImages.push(imageUrl);
          totalImageCount++;
          
          // API 요청 간격 조절 (429 에러 방지)
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

    // 향상된 이미지 복사/붙여넣기 기능을 위한 JavaScript 추가
    const imageScript = `
    <script>
    // 티스토리 최적화된 이미지 복사/붙여넣기 함수
    function makeImageCopyable(imgElement) {
      try {
        // 1. 캔버스를 사용하여 이미지를 실제 파일 형태로 변환
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
          // 고해상도 설정
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          
          // 이미지 그리기
          ctx.drawImage(img, 0, 0);
          
          // 다중 복사 방식 시도
          canvas.toBlob(async function(blob) {
            if (blob) {
              try {
                // 방법 1: 최신 브라우저용 ClipboardItem
                const clipboardItem = new ClipboardItem({
                  'image/png': blob,
                  'image/jpeg': blob
                });
                await navigator.clipboard.write([clipboardItem]);
                
                // 성공 알림
                showCopySuccessMessage('이미지가 클립보드에 복사되었습니다! 티스토리에서 Ctrl+V로 붙여넣으세요.');
                
                // 이미지 표시 효과
                imgElement.style.border = '3px solid #22c55e';
                setTimeout(() => {
                  imgElement.style.border = '';
                }, 1500);
                
              } catch (clipboardError) {
                console.log('ClipboardItem 방식 실패, 대안 시도:', clipboardError);
                
                // 방법 2: 데이터 URL 복사
                const dataURL = canvas.toDataURL('image/png');
                await navigator.clipboard.writeText(dataURL);
                showCopySuccessMessage('이미지 데이터가 복사되었습니다. 티스토리에 붙여넣기를 시도해보세요.');
              }
            }
          }, 'image/png', 0.95);
        };
        
        img.onerror = function() {
          console.error('이미지 로드 실패');
          // 대안: 이미지 URL 복사
          navigator.clipboard.writeText(imgElement.src).then(() => {
            showCopySuccessMessage('이미지 URL이 복사되었습니다.');
          });
        };
        
        img.src = imgElement.src;
        
      } catch (error) {
        console.error('이미지 복사 중 오류:', error);
        // 최종 대안: 이미지 URL 복사
        navigator.clipboard.writeText(imgElement.src).then(() => {
          showCopySuccessMessage('이미지 URL이 복사되었습니다.');
        });
      }
    }
    
    // 복사 성공 메시지 표시
    function showCopySuccessMessage(message) {
      const notification = document.createElement('div');
      notification.innerHTML = message;
      notification.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background: #22c55e;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      \`;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
    
    // 모든 이미지에 클릭 이벤트 자동 추가
    document.addEventListener('DOMContentLoaded', function() {
      const images = document.querySelectorAll('.tistory-optimized-image');
      images.forEach(img => {
        img.style.cursor = 'pointer';
        img.title = '클릭하여 클립보드에 복사 (티스토리 붙여넣기 가능)';
      });
    });
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

// 섹션에서 키워드 추출 함수
const extractKeywordsFromSection = async (sectionHtml: string, geminiApiKey: string): Promise<string> => {
  try {
    // HTML 태그 제거하여 텍스트만 추출
    const textContent = sectionHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // 키워드 추출을 위한 Gemini API 호출
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
  
  // 기본 키워드 반환
  return 'business technology';
};

// Pixabay 이미지 검색 함수
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
      // 가장 적합한 이미지 선택 (views와 downloads 기준)
      const sortedImages = data.hits.sort((a: any, b: any) => {
        return (b.views + b.downloads) - (a.views + a.downloads);
      });
      
      const selectedImage = sortedImages[0];
      console.log('선택된 이미지:', selectedImage);
      
      // 적절한 크기의 이미지 URL 반환
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
    // HTML 태그 제거 및 공백 정리
    const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Gemini API에 전달할 프롬프트
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
