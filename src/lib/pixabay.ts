const getSummaryKeywords = async (text: string, geminiApiKey: string): Promise<string | null> => {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
    const summaryPrompt = `다음 텍스트를 Pixabay 이미지 검색에 적합한 2-3개의 한국어 키워드로 요약해 주세요. 쉼표로 구분된 키워드만 제공하고 다른 설명은 하지 마세요. 텍스트: "${text}"`;
    try {
        console.log('🔍 키워드 생성 시작:', text.substring(0, 100) + '...');
        const summaryResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: summaryPrompt }] }] })
        });
        if (!summaryResponse.ok) {
            console.error('❌ 키워드 생성 API 실패:', summaryResponse.status, summaryResponse.statusText);
            return null;
        }
        const summaryData = await summaryResponse.json();
        const keywords = summaryData.candidates?.[0]?.content?.parts?.[0]?.text.trim() || null;
        console.log('✅ 생성된 키워드:', keywords);
        return keywords;
    } catch (error) {
        console.error("❌ 키워드 생성 오류:", error);
        return null;
    }
};

const searchPixabayImages = async (keyword: string, pixabayApiKey: string, page: number = 1) => {
    const imageSearchUrl = `https://pixabay.com/api/?key=${pixabayApiKey}&q=${encodeURIComponent(keyword)}&image_type=photo&safesearch=true&per_page=50&page=${page}&lang=ko`;
    try {
        console.log(`🖼️ Pixabay 검색 시작 (페이지 ${page}):`, keyword);
        const imageResponse = await fetch(imageSearchUrl);
        if (!imageResponse.ok) {
            console.error('❌ Pixabay API 실패:', imageResponse.status, imageResponse.statusText);
            if (imageResponse.status === 429) {
                console.error('🚫 Pixabay API 한도 초과');
            }
            return null;
        }
        const data = await imageResponse.json();
        console.log(`✅ Pixabay 응답 (페이지 ${page}):`, data.hits?.length || 0, '개 이미지 발견');
        return data;
    } catch (error) {
        console.error("❌ Pixabay 검색 오류:", error);
        return null;
    }
};

// 이미지를 Base64로 변환하는 함수
const convertImageToBase64 = async (imageUrl: string): Promise<string | null> => {
    try {
        console.log('🔄 이미지 Base64 변환 시작:', imageUrl);
        
        // CORS 프록시를 사용하여 이미지 가져오기
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${imageUrl}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            // CORS 프록시 실패 시 직접 시도
            const directResponse = await fetch(imageUrl, { mode: 'cors' });
            if (!directResponse.ok) {
                throw new Error('이미지 다운로드 실패');
            }
            const blob = await directResponse.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        }
        
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('❌ Base64 변환 실패:', error);
        
        // Canvas를 사용한 대체 방법
        try {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Canvas context 생성 실패'));
                        return;
                    }
                    
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataUrl);
                };
                img.onerror = () => reject(new Error('이미지 로드 실패'));
                img.src = imageUrl;
            });
        } catch (canvasError) {
            console.error('❌ Canvas 변환도 실패:', canvasError);
            return null;
        }
    }
};

// 이미지를 클립보드에 복사하는 함수 - 티스토리 호환성 개선
const copyImageToClipboard = async (imageUrl: string): Promise<boolean> => {
    try {
        console.log('📋 이미지 클립보드 복사 시작:', imageUrl);
        
        const response = await fetch(imageUrl, { mode: 'cors' });
        const blob = await response.blob();
        
        if (navigator.clipboard && window.ClipboardItem) {
            // 티스토리 호환성을 위한 다중 형식 지원
            const clipboardItem = new ClipboardItem({
                [blob.type]: blob,
                'text/html': new Blob([`<img src="${imageUrl}" alt="copied-image" style="max-width: 100%; height: auto;" />`], { type: 'text/html' }),
                'text/plain': new Blob([imageUrl], { type: 'text/plain' })
            });
            await navigator.clipboard.write([clipboardItem]);
            console.log('✅ 클립보드 복사 성공 (다중 형식)');
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ 클립보드 복사 실패:', error);
        
        // 대체 방법: 이미지 URL만 텍스트로 복사
        try {
            await navigator.clipboard.writeText(imageUrl);
            console.log('✅ 이미지 URL 텍스트 복사 성공');
            return true;
        } catch (textError) {
            console.error('❌ 텍스트 복사도 실패:', textError);
            return false;
        }
    }
};

// 병렬 처리로 이미지 수집 속도 개선
const collectImagesFromMultiplePagesParallel = async (keyword: string, pixabayApiKey: string, maxPages: number = 5): Promise<any[]> => {
    console.log(`🚀 병렬 이미지 수집 시작 (최대 ${maxPages}페이지)`);
    
    // 병렬로 여러 페이지 동시 요청 (성능 개선)
    const pagePromises = Array.from({ length: Math.min(maxPages, 3) }, (_, i) => 
        searchPixabayImages(keyword, pixabayApiKey, i + 1)
    );
    
    try {
        const results = await Promise.allSettled(pagePromises);
        const allImages: any[] = [];
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value?.hits) {
                allImages.push(...result.value.hits);
                console.log(`✅ 페이지 ${index + 1}: ${result.value.hits.length}개 이미지 수집`);
            } else {
                console.warn(`⚠️ 페이지 ${index + 1} 실패:`, result.status === 'rejected' ? result.reason : 'No data');
            }
        });
        
        console.log(`📦 총 ${allImages.length}개 이미지 수집 완료`);
        return allImages;
    } catch (error) {
        console.error('❌ 병렬 이미지 수집 오류:', error);
        return [];
    }
};

export const generateMetaDescription = async (htmlContent: string, geminiApiKey: string): Promise<string | null> => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const plainText = (doc.body.textContent || '').trim().replace(/\s+/g, ' ').substring(0, 4000);

    if (!plainText) return null;

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
    const metaPrompt = `다음 텍스트를 SEO에 최적화된 150자 내외의 한국어 메타 설명으로 요약해 주세요. 다른 설명 없이 메타 설명 텍스트만 제공해주세요. 텍스트: "${plainText}"`;
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: metaPrompt }] }] })
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text.trim() || null;
    } catch (error) {
        console.error("Error generating meta description:", error);
        return null;
    }
};

export const integratePixabayImages = async (
    htmlContent: string, 
    pixabayApiKey: string, 
    geminiApiKey: string
): Promise<{ finalHtml: string; imageCount: number; clipboardImages: string[] }> => {
    console.log('🚀 Pixabay 이미지 통합 시작 (성능 최적화 모드)');
    console.log('📄 HTML 콘텐츠 길이:', htmlContent.length);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const h2s = Array.from(doc.querySelectorAll('h2'));
    console.log('📋 발견된 H2 태그 수:', h2s.length);
    
    let imageCount = 0;
    const MAX_IMAGES = 3; // 이미지 수 줄여서 속도 개선
    const usedImageUrls = new Set<string>();
    const clipboardImages: string[] = [];

    if (h2s.length > 0) {
        const numImagesToInsert = Math.min(MAX_IMAGES, h2s.length);
        const indicesToInsertAt = Array.from({ length: numImagesToInsert }, (_, i) => 
            Math.floor(i * (h2s.length / numImagesToInsert))
        );
        console.log('🎯 이미지 삽입 위치:', indicesToInsertAt);

        // 키워드 생성을 병렬로 처리하여 속도 개선
        const keywordPromises = indicesToInsertAt.map(async (index) => {
            const h2 = h2s[index];
            if (!h2) return null;

            let contentForSummary = '';
            let currentNode = h2.nextSibling;
            while (currentNode && currentNode.nodeName !== 'H2') {
                contentForSummary += currentNode.textContent || '';
                currentNode = currentNode.nextSibling;
            }

            const textToSummarize = (h2.textContent + " " + contentForSummary).replace(/\s+/g, ' ').trim().substring(0, 500); // 길이 줄여서 속도 개선
            
            if (textToSummarize.length > 10) {
                const keyword = await getSummaryKeywords(textToSummarize, geminiApiKey);
                return { index, h2, keyword, textToSummarize };
            }
            return null;
        });

        const keywordResults = await Promise.allSettled(keywordPromises);
        console.log('✅ 키워드 생성 완료');

        // 이미지 수집도 병렬로 처리
        for (const result of keywordResults) {
            if (result.status === 'fulfilled' && result.value) {
                const { index, h2, keyword } = result.value;
                
                if (!keyword) continue;

                try {
                    // 병렬 이미지 수집 사용 (속도 개선)
                    const allImages = await collectImagesFromMultiplePagesParallel(keyword, pixabayApiKey, 3);
                    
                    if (allImages.length === 0) {
                        console.log('❌ 검색된 이미지 없음:', keyword);
                        continue;
                    }
                    
                    const availableImages = allImages.filter(hit => !usedImageUrls.has(hit.webformatURL));
                    console.log('🎲 사용 가능한 이미지 수:', availableImages.length);

                    if (availableImages.length > 0) {
                        const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
                        const imageUrl = randomImage.webformatURL;
                        usedImageUrls.add(imageUrl);
                        console.log('✅ 선택된 이미지:', imageUrl);

                        const imageContainer = doc.createElement('div');
                        imageContainer.style.cssText = `
                            text-align: center !important;
                            margin: 2em 0 !important;
                            padding: 0 10px !important;
                            max-width: 100% !important;
                            box-sizing: border-box !important;
                        `;
                        
                        const img = doc.createElement('img');
                        const altText = h2.textContent?.trim() || keyword;
                        const sanitizedAltText = altText.replace(/[<>]/g, '').trim();
                        
                        // Base64 변환 건너뛰고 직접 URL 사용으로 속도 개선
                        img.src = imageUrl;
                        img.alt = sanitizedAltText;
                        img.title = sanitizedAltText;
                        img.setAttribute('data-filename', sanitizedAltText.replace(/[^a-zA-Z0-9가-힣]/g, '_') + '.jpg');
                        img.setAttribute('data-pixabay-keyword', keyword);
                        img.setAttribute('crossorigin', 'anonymous'); // CORS 설정 추가
                        
                        // 모바일 최적화 스타일 강화 (!important 추가)
                        img.style.cssText = `
                            max-width: 100% !important;
                            height: auto !important;
                            border-radius: 8px !important;
                            display: block !important;
                            margin: 0 auto !important;
                            width: 100% !important;
                            min-height: 200px !important;
                            object-fit: cover !important;
                            box-sizing: border-box !important;
                            padding: 0 !important;
                            margin-left: 10px !important;
                            margin-right: 10px !important;
                        `;
                        
                        clipboardImages.push(imageUrl);
                        
                        // 간단한 캡션
                        const caption = doc.createElement('p');
                        caption.style.cssText = `
                            text-align: center !important;
                            font-size: 0.9em !important;
                            color: #666 !important;
                            margin-top: 0.5em !important;
                            padding: 0 10px !important;
                        `;
                        caption.textContent = `📸 ${sanitizedAltText}`;
                        
                        imageContainer.appendChild(img);
                        imageContainer.appendChild(caption);
                        
                        h2.parentNode?.insertBefore(imageContainer, h2.nextSibling);
                        imageCount++;
                        console.log(`🖼️ 이미지 ${imageCount} 삽입 완료`);
                    }
                } catch (e) {
                    console.error("❌ 개별 이미지 통합 오류:", e);
                }
            }
        }
    }
    
    // 티스토리 가이드 텍스트 제거
    const guideSections = doc.querySelectorAll('.image-copy-notice, [class*="image-copy"], [class*="tistory"]');
    guideSections.forEach(section => section.remove());
    
    // 가이드 텍스트가 포함된 div나 p 태그도 제거
    const allElements = doc.querySelectorAll('div, p');
    allElements.forEach(element => {
        const text = element.textContent || '';
        if (text.includes('티스토리 이미지 활용 가이드') || 
            text.includes('이미지를 마우스 우클릭') ||
            text.includes('대표 이미지로 설정')) {
            element.remove();
        }
    });
    
    console.log(`🏁 Pixabay 이미지 통합 완료: ${imageCount}개 이미지 추가 (성능 최적화 적용)`);
    return { 
        finalHtml: doc.body.innerHTML, 
        imageCount,
        clipboardImages 
    };
};
