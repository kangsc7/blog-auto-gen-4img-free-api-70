
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

// 간단한 키워드 생성 (AI 분석 제거)
const generateSimpleKeywords = (htmlContent: string): string[] => {
  console.log('🔍 간단한 키워드 생성 시작');
  
  const h2Sections = htmlContent.match(/<h2[^>]*>.*?<\/h2>/gi);
  if (!h2Sections || h2Sections.length === 0) {
    console.log('❌ H2 섹션을 찾을 수 없습니다.');
    return [];
  }

  const keywords: string[] = [];
  
  // 최대 5개 섹션 처리
  for (let i = 0; i < Math.min(h2Sections.length, 5); i++) {
    const section = h2Sections[i];
    
    // 섹션에서 제목 추출
    const titleMatch = section.match(/<h2[^>]*>(.*?)<\/h2>/i);
    
    if (titleMatch) {
      const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      const keyword = generateKeywordFromTitle(title);
      keywords.push(keyword);
      console.log(`✅ ${i+1}번째 섹션 키워드 생성: "${keyword}"`);
    }
  }

  console.log('🎯 키워드 생성 완료:', keywords);
  return keywords;
};

// 제목 기반 키워드 생성
const generateKeywordFromTitle = (title: string): string => {
  const koreanToEnglishMapping: { [key: string]: string } = {
    // 해수욕장/여행 관련
    '해수욕장': 'beach seaside ocean summer vacation',
    '혼잡도': 'crowded busy people crowd density',
    '여행': 'travel vacation tourism holiday',
    '관광': 'tourism sightseeing travel destination',
    '숙박': 'hotel accommodation lodging resort',
    '맛집': 'restaurant food dining cuisine',
    
    // 정부지원/복지 관련
    '지원금': 'government financial support subsidy',
    '신청방법': 'application process procedure documents',
    '자격조건': 'eligibility requirements criteria qualification',
    '디지털플랫폼': 'digital platform computer technology',
    '정부지원': 'government assistance aid support',
    '복지': 'welfare social benefits assistance',
    '생계급여': 'basic livelihood allowance support',
    '주거급여': 'housing allowance rent assistance',
    '의료급여': 'medical assistance healthcare support',
    '교육급여': 'education support scholarship assistance',
    
    // 비즈니스/업무 관련
    '직장': 'office workplace business professional',
    '회사': 'company corporation business office',
    '업무': 'work business professional meeting',
    '회의': 'meeting conference business discussion',
    '문서': 'documents paperwork office business',
    '계약': 'contract agreement business legal',
    '투자': 'investment finance money business',
    '창업': 'startup business entrepreneurship innovation',
    
    // 건강/의료 관련
    '건강': 'health wellness medical fitness',
    '병원': 'hospital medical healthcare clinic',
    '치료': 'treatment medical therapy healthcare',
    '운동': 'exercise fitness workout health',
    '다이어트': 'diet fitness health nutrition',
    
    // 교육/학습 관련
    '교육': 'education learning study school',
    '학습': 'learning education study training',
    '강의': 'lecture education teaching classroom',
    '시험': 'exam test study education',
    '자격증': 'certificate qualification education training'
  };
  
  // 정확한 매칭 시도
  for (const [korean, english] of Object.entries(koreanToEnglishMapping)) {
    if (title.includes(korean)) {
      return english;
    }
  }
  
  // 컨텍스트 기반 추론
  if (title.includes('신청') || title.includes('방법') || title.includes('절차')) {
    return 'application process documents procedure';
  } else if (title.includes('조건') || title.includes('자격') || title.includes('요건')) {
    return 'requirements criteria eligibility qualification';
  } else if (title.includes('지원') || title.includes('도움') || title.includes('혜택')) {
    return 'support assistance benefits aid';
  } else if (title.includes('온라인') || title.includes('인터넷') || title.includes('웹사이트')) {
    return 'online internet website computer technology';
  } else if (title.includes('문서') || title.includes('서류') || title.includes('양식')) {
    return 'documents paperwork forms office business';
  } else {
    return 'business professional office meeting documents';
  }
};

// 10페이지까지 검색하여 중복되지 않는 이미지 수집
export const searchPixabayImages10Pages = async (
  query: string,
  apiKey: string,
  maxImages: number = 5,
  usedImageIds: Set<number> = new Set()
): Promise<PixabayImage[]> => {
  console.log(`🔍 픽사베이 10페이지 검색 시작: "${query}" (최대 ${maxImages}개, 제외 이미지: ${usedImageIds.size}개)`);
  console.log(`🔑 픽사베이 API 키 확인: ${apiKey ? '✅ 존재 (' + apiKey.substring(0, 10) + '...)' : '❌ 없음'}`);
  
  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ 픽사베이 API 키가 없습니다.');
    return [];
  }
  
  const validImages: PixabayImage[] = [];
  const encodedQuery = encodeURIComponent(query);
  let retryCount = 0;
  const maxRetries = 3;
  
  // 10페이지까지 순차 검색
  for (let page = 1; page <= 10 && validImages.length < maxImages; page++) {
    try {
      const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodedQuery}&image_type=photo&orientation=horizontal&category=backgrounds&min_width=800&min_height=600&per_page=20&page=${page}&safesearch=true&order=popular`;
      
      console.log(`📡 ${page}페이지 검색 시작 (재시도: ${retryCount})`);
      
      const response = await fetch(url);
      
      console.log(`📊 ${page}페이지 응답 상태: ${response.status} ${response.statusText}`);
      
      if (response.status === 400) {
        console.error(`❌ ${page}페이지 - 잘못된 요청 (API 키 오류 가능성)`);
        const errorText = await response.text();
        console.error('오류 상세:', errorText);
        return [];
      }
      
      if (response.status === 429) {
        console.warn(`⚠️ ${page}페이지 - API 한도 초과, 2초 대기 후 재시도`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (retryCount < maxRetries) {
          retryCount++;
          page--;
          continue;
        }
      }
      
      if (!response.ok) {
        console.error(`❌ ${page}페이지 - API 오류: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('오류 응답:', errorText);
        continue;
      }

      const data: PixabayResponse = await response.json();
      console.log(`✅ ${page}페이지 - ${data.hits?.length || 0}개 이미지 발견 (전체: ${data.total || 0})`);
      
      if (data.hits && data.hits.length > 0) {
        // 품질 좋고 중복되지 않는 이미지만 선별
        const qualityImages = data.hits.filter(img => {
          const isNotDuplicate = !usedImageIds.has(img.id);
          const hasGoodQuality = img.views > 1000 && img.downloads > 100;
          const hasValidUrl = img.webformatURL && img.webformatURL.includes('pixabay.com');
          
          return isNotDuplicate && hasGoodQuality && hasValidUrl;
        });
        
        console.log(`🎯 ${page}페이지에서 ${qualityImages.length}개 고품질 이미지 필터링됨`);
        
        // 필요한 만큼만 추가
        const imagesToAdd = qualityImages.slice(0, maxImages - validImages.length);
        
        imagesToAdd.forEach(img => {
          validImages.push(img);
          usedImageIds.add(img.id);
          console.log(`➕ 이미지 추가: ${img.id}`);
        });
        
        console.log(`🎯 ${page}페이지에서 ${imagesToAdd.length}개 이미지 추가됨 (현재 총 ${validImages.length}개)`);
        
        if (validImages.length >= maxImages) {
          console.log(`🏁 목표 이미지 수 달성: ${validImages.length}개`);
          break;
        }
      } else {
        console.warn(`⚠️ ${page}페이지 - 이미지 없음`);
      }
      
      retryCount = 0;
      // API 호출 간격
      await new Promise(resolve => setTimeout(resolve, 600));
      
    } catch (error) {
      console.error(`❌ ${page}페이지 검색 실패 (재시도: ${retryCount}):`, error);
      
      if (retryCount < maxRetries) {
        retryCount++;
        page--;
        await new Promise(resolve => setTimeout(resolve, 1500));
        continue;
      } else {
        retryCount = 0;
        continue;
      }
    }
  }
  
  console.log(`🏁 픽사베이 10페이지 검색 완료 - 최종 결과: ${validImages.length}개 이미지`);
  
  if (validImages.length === 0) {
    console.error('❌ 픽사베이 검색 결과 없음');
  }
  
  return validImages;
};

// 기존 함수들 유지 (호환성을 위해)
export const searchPixabayByPage = async (
  query: string,
  apiKey: string,
  targetPage: number
): Promise<PixabayImage | null> => {
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
  geminiApiKey?: string
): Promise<{ finalHtml: string; imageCount: number; clipboardImages: string[] }> => {
  console.log('🔥 간단한 픽사베이 이미지 통합 시작:', { 
    htmlLength: htmlContent.length,
    hasPixabayKey: !!pixabayApiKey
  });

  try {
    // 1. 간단한 키워드 생성 (AI 분석 제거)
    const keywords = generateSimpleKeywords(htmlContent);
    console.log('✅ 간단한 키워드들:', keywords);

    if (keywords.length === 0) {
      console.log('❌ 생성된 키워드가 없습니다.');
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 2. H2 섹션들 찾기
    const h2Sections = htmlContent.match(/<h2[^>]*>.*?<\/h2>/gi);
    if (!h2Sections) {
      console.log('❌ H2 섹션을 찾을 수 없습니다.');
      return { finalHtml: htmlContent, imageCount: 0, clipboardImages: [] };
    }

    // 3. 전역 중복 방지를 위한 Set
    const globalUsedImageIds = new Set<number>();
    const validImages: PixabayImage[] = [];
    
    // 4. 각 키워드별로 10페이지 포괄 검색
    for (let i = 0; i < Math.min(keywords.length, 5); i++) {
      const keyword = keywords[i];
      
      try {
        console.log(`🔍 ${i+1}번째 소제목 - 키워드 검색: "${keyword}"`);
        
        const images = await searchPixabayImages10Pages(keyword, pixabayApiKey, 1, globalUsedImageIds);
        
        if (images.length > 0) {
          validImages.push(images[0]);
          console.log(`✅ ${i+1}번째 소제목 - 키워드 검색 성공:`, images[0].webformatURL);
        } else {
          console.log(`⚠️ ${i+1}번째 소제목 - 이미지 없음`);
        }
      } catch (error) {
        console.error(`❌ ${i+1}번째 소제목 검색 실패:`, error);
      }
      
      // API 호출 간격
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    console.log('🎯 간단한 픽사베이 검색 완료 - 최종 유효한 이미지 수:', validImages.length);

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
          >
        </div>`;

      // H2 섹션 바로 다음에 이미지 삽입
      const sectionEndIndex = updatedHtml.indexOf('</h2>', updatedHtml.indexOf(sectionTitle)) + 5;
      if (sectionEndIndex > 4) {
        updatedHtml = updatedHtml.slice(0, sectionEndIndex) + imageHtml + updatedHtml.slice(sectionEndIndex);
        clipboardImages.push(image.webformatURL);
        console.log(`✅ ${i+1}번째 이미지 삽입 완료`);
      }
    }

    // 6. 글로벌 이미지 복사 함수
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
    console.error('❌ 간단한 픽사베이 이미지 통합 중 전체 오류:', error);
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
