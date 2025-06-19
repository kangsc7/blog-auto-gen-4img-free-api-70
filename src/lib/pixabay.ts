
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

// H2 섹션에서 키워드 추출 및 최적화 - 완전히 새로운 방식
const extractOptimizedKeywords = (htmlContent: string): string[] => {
  console.log('🔍 H2 섹션에서 핵심 키워드 추출 시작');
  
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
      
      // 더 정확한 한글-영어 키워드 매핑 시스템
      const koreanToEnglishMapping: { [key: string]: string } = {
        // 정부 지원금 관련
        '지원금': 'government subsidy financial support',
        '디지털플랫폼': 'digital platform technology',
        '신청방법': 'application process procedure',
        '자격조건': 'eligibility requirements criteria',
        '혜택': 'benefits welfare assistance',
        '정부지원': 'government support aid',
        '복지': 'social welfare benefits',
        '생계급여': 'basic livelihood allowance',
        '주거급여': 'housing allowance rent support',
        '의료급여': 'medical assistance healthcare',
        '교육급여': 'education support scholarship',
        
        // 해수욕장/관광 관련
        '해수욕장': 'beach seaside ocean resort',
        '혼잡도': 'crowd density busy beach',
        '여행': 'travel vacation tourism',
        '휴가': 'vacation holiday leisure',
        '관광': 'tourism sightseeing travel',
        '숙박': 'accommodation hotel lodging',
        '맛집': 'restaurant food dining',
        
        // 비즈니스/직장 관련
        '직장': 'office workplace business',
        '회사': 'company corporation office',
        '업무': 'work business professional',
        '회의': 'meeting conference business',
        '문서': 'documents paperwork office',
        '계약': 'contract agreement business',
        '투자': 'investment finance money',
        '창업': 'startup business entrepreneurship',
        
        // 건강/의료 관련
        '건강': 'health wellness medical',
        '병원': 'hospital medical healthcare',
        '치료': 'treatment medical therapy',
        '운동': 'exercise fitness workout',
        '다이어트': 'diet fitness health',
        
        // 교육/학습 관련
        '교육': 'education learning study',
        '학습': 'learning education study',
        '강의': 'lecture education teaching',
        '시험': 'exam test study',
        '자격증': 'certificate qualification education'
      };
      
      // 제목에서 핵심 키워드 추출 및 영어 변환
      let englishKeyword = '';
      let found = false;
      
      // 정확한 매칭 우선
      for (const [korean, english] of Object.entries(koreanToEnglishMapping)) {
        if (title.includes(korean)) {
          englishKeyword = english;
          found = true;
          console.log(`✅ 정확한 매칭: "${korean}" → "${english}"`);
          break;
        }
      }
      
      // 매칭되지 않은 경우 컨텍스트 기반 추론
      if (!found) {
        if (title.includes('신청') || title.includes('방법') || title.includes('절차')) {
          englishKeyword = 'application process documents';
        } else if (title.includes('조건') || title.includes('자격') || title.includes('요건')) {
          englishKeyword = 'requirements criteria eligibility';
        } else if (title.includes('지원') || title.includes('도움') || title.includes('혜택')) {
          englishKeyword = 'support assistance benefits';
        } else if (title.includes('온라인') || title.includes('인터넷') || title.includes('웹사이트')) {
          englishKeyword = 'online internet website computer';
        } else if (title.includes('문서') || title.includes('서류') || title.includes('양식')) {
          englishKeyword = 'documents paperwork forms office';
        } else {
          // 기본 비즈니스 이미지
          englishKeyword = 'business professional office meeting';
        }
        console.log(`🔄 컨텍스트 추론: "${title}" → "${englishKeyword}"`);
      }
      
      optimizedKeywords.push(englishKeyword);
      console.log(`✅ 최종 키워드: "${title}" → "${englishKeyword}"`);
    }
  }

  return optimizedKeywords;
};

// 10페이지까지 검색하여 중복되지 않는 이미지 수집
export const searchPixabayImages10Pages = async (
  query: string,
  apiKey: string,
  maxImages: number = 5
): Promise<PixabayImage[]> => {
  console.log(`🔍 10페이지 포괄 검색 시작: "${query}" (최대 ${maxImages}개)`);
  
  const validImages: PixabayImage[] = [];
  const usedImageIds = new Set<number>(); // 중복 방지
  const encodedQuery = encodeURIComponent(query);
  
  // 10페이지까지 순차 검색
  for (let page = 1; page <= 10 && validImages.length < maxImages; page++) {
    try {
      const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodedQuery}&image_type=photo&orientation=horizontal&category=backgrounds&min_width=800&min_height=600&per_page=20&page=${page}&safesearch=true&order=popular`;
      
      console.log(`📡 ${page}페이지 검색: ${url.substring(0, 100)}...`);
      
      const response = await fetch(url);
      
      if (response.status === 429) {
        console.warn(`⚠️ ${page}페이지 - API 한도 초과, 1초 대기 후 재시도`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      if (!response.ok) {
        console.error(`❌ ${page}페이지 - API 오류: ${response.status}`);
        continue;
      }

      const data: PixabayResponse = await response.json();
      console.log(`✅ ${page}페이지 - ${data.hits.length}개 이미지 발견`);
      
      if (data.hits && data.hits.length > 0) {
        // 품질 좋고 중복되지 않는 이미지만 선별
        const qualityImages = data.hits.filter(img => 
          !usedImageIds.has(img.id) && // 중복 방지
          img.views > 1000 && 
          img.downloads > 100 && 
          img.webformatURL.includes('pixabay.com')
        );
        
        // 필요한 만큼만 추가
        const imagesToAdd = qualityImages.slice(0, maxImages - validImages.length);
        
        imagesToAdd.forEach(img => {
          validImages.push(img);
          usedImageIds.add(img.id);
        });
        
        console.log(`🎯 ${page}페이지에서 ${imagesToAdd.length}개 고품질 이미지 추가 (중복 제거됨)`);
        
        if (validImages.length >= maxImages) {
          console.log(`🏁 목표 이미지 수 달성: ${validImages.length}개`);
          break;
        }
      }
      
      // API 호출 간격
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ ${page}페이지 검색 실패:`, error);
      continue;
    }
  }
  
  console.log(`🏁 10페이지 검색 완료 - 최종 결과: ${validImages.length}개 고품질 중복 없는 이미지`);
  return validImages;
};

// 기존 함수들 유지 (호환성을 위해)
export const searchPixabayByPage = async (
  query: string,
  apiKey: string,
  targetPage: number
): Promise<PixabayImage | null> => {
  // 이 함수는 더 이상 사용하지 않지만 호환성을 위해 유지
  const images = await searchPixabayImages10Pages(query, apiKey, 1);
  return images.length > 0 ? images[0] : null;
};

export const searchPixabayImagesAdvanced = async (
  query: string,
  apiKey: string,
  maxImages: number = 1
): Promise<PixabayImage[]> => {
  return await searchPixabayImages10Pages(query, apiKey, maxImages);
};

export const searchPixabayImages = async (
  query: string,
  apiKey: string,
  count: number = 5
): Promise<PixabayImage[]> => {
  return await searchPixabayImages10Pages(query, apiKey, count);
};

export const integratePixabayImages = async (
  htmlContent: string,
  pixabayApiKey: string,
  geminiApiKey: string
): Promise<{ finalHtml: string; imageCount: number; clipboardImages: string[] }> => {
  console.log('🔥 새로운 10페이지 포괄 Pixabay 이미지 통합 시작:', { 
    htmlLength: htmlContent.length,
    hasPixabayKey: !!pixabayApiKey,
    hasGeminiKey: !!geminiApiKey
  });

  try {
    // 1. 최적화된 키워드 추출 (개선된 매핑 시스템 사용)
    const optimizedKeywords = extractOptimizedKeywords(htmlContent);
    console.log('✅ 최적화된 영어 키워드들:', optimizedKeywords);

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

    // 3. 각 키워드별로 10페이지 포괄 검색 (중복 방지)
    const validImages: PixabayImage[] = [];
    const allUsedImageIds = new Set<number>(); // 전체 중복 방지
    
    for (let i = 0; i < Math.min(optimizedKeywords.length, 5); i++) {
      const keyword = optimizedKeywords[i];
      
      try {
        console.log(`🔍 ${i+1}번째 소제목 - 10페이지 포괄 검색:`, keyword);
        
        // 10페이지 포괄 검색으로 1개 이미지 획득
        const images = await searchPixabayImages10Pages(keyword, pixabayApiKey, 1);
        
        if (images.length > 0) {
          const newImage = images.find(img => !allUsedImageIds.has(img.id));
          if (newImage) {
            validImages.push(newImage);
            allUsedImageIds.add(newImage.id);
            console.log(`✅ ${i+1}번째 소제목 - 10페이지 검색 성공:`, newImage.webformatURL);
          } else {
            console.log(`⚠️ ${i+1}번째 소제목 - 중복 이미지, 폴백 검색 시도`);
            
            // 폴백: 일반적인 키워드로 10페이지 검색
            const fallbackImages = await searchPixabayImages10Pages('business office professional', pixabayApiKey, 1);
            const fallbackImage = fallbackImages.find(img => !allUsedImageIds.has(img.id));
            if (fallbackImage) {
              validImages.push(fallbackImage);
              allUsedImageIds.add(fallbackImage.id);
              console.log(`✅ ${i+1}번째 소제목 - 폴백 이미지 성공:`, fallbackImage.webformatURL);
            }
          }
        } else {
          console.log(`❌ ${i+1}번째 소제목 - 10페이지 검색 실패, 폴백 시도`);
          
          // 폴백 검색
          const fallbackImages = await searchPixabayImages10Pages('business meeting documents', pixabayApiKey, 1);
          const fallbackImage = fallbackImages.find(img => !allUsedImageIds.has(img.id));
          if (fallbackImage) {
            validImages.push(fallbackImage);
            allUsedImageIds.add(fallbackImage.id);
            console.log(`✅ ${i+1}번째 소제목 - 폴백 이미지 성공:`, fallbackImage.webformatURL);
          }
        }
        
        // API 호출 간격
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (error) {
        console.error(`❌ ${i+1}번째 소제목 검색 실패:`, error);
      }
    }

    console.log('🎯 10페이지 포괄 검색 완료 - 최종 유효한 이미지 수:', validImages.length);

    if (validImages.length === 0) {
      console.log('❌ 사용 가능한 이미지가 없습니다.');
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 4. HTML에 이미지 삽입 (개선된 템플릿)
    let updatedHtml = htmlContent;
    const clipboardImages: string[] = [];

    for (let i = 0; i < Math.min(validImages.length, h2Sections.length); i++) {
      const image = validImages[i];
      const sectionTitle = h2Sections[i];
      
      const altText = sectionTitle.replace(/<[^>]*>/g, '').replace(/[^\w\s가-힣]/g, ' ').trim() || '블로그 이미지';
      
      // 티스토리 최적화 이미지 태그 (텍스트 정보 제거)
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
        </div>`;

      // H2 섹션 바로 다음에 이미지 삽입
      const sectionEndIndex = updatedHtml.indexOf('</h2>', updatedHtml.indexOf(sectionTitle)) + 5;
      if (sectionEndIndex > 4) {
        updatedHtml = updatedHtml.slice(0, sectionEndIndex) + imageHtml + updatedHtml.slice(sectionEndIndex);
        clipboardImages.push(image.webformatURL);
        console.log(`✅ ${i+1}번째 이미지 삽입 완료 (10페이지 검색)`);
      }
    }

    // 5. 글로벌 이미지 복사 함수 (간소화된 버전)
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
          toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 15px 25px; border-radius: 10px; font-weight: bold; z-index: 10000; box-shadow: 0 6px 20px rgba(0,0,0,0.3);';
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
          toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 15px 25px; border-radius: 10px; font-weight: bold; z-index: 10000;';
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
    console.error('❌ 10페이지 포괄 Pixabay 이미지 통합 중 전체 오류:', error);
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
