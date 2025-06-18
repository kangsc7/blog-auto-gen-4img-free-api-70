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

// 여러 페이지에서 이미지를 수집하는 함수
const collectImagesFromMultiplePages = async (keyword: string, pixabayApiKey: string, maxPages: number = 10): Promise<any[]> => {
    const allImages: any[] = [];
    
    for (let page = 1; page <= maxPages; page++) {
        try {
            const imageData = await searchPixabayImages(keyword, pixabayApiKey, page);
            if (imageData?.hits && imageData.hits.length > 0) {
                allImages.push(...imageData.hits);
                console.log(`📦 수집된 총 이미지 수: ${allImages.length}`);
            } else {
                console.log(`⏹️ 페이지 ${page}에서 더 이상 이미지 없음, 검색 중단`);
                break;
            }
        } catch (error) {
            console.error(`❌ 페이지 ${page} 검색 오류:`, error);
            break;
        }
    }
    
    return allImages;
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
    geminiApiKey: string,
    onImageFound?: (url: string, description: string, position: number) => void
): Promise<{ finalHtml: string; imageCount: number }> => {
    console.log('🚀 Pixabay 이미지 통합 시작 (자동 클립보드 방식)');
    console.log('📄 HTML 콘텐츠 길이:', htmlContent.length);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const h2s = Array.from(doc.querySelectorAll('h2'));
    console.log('📋 발견된 H2 태그 수:', h2s.length);
    
    let imageCount = 0;
    const MAX_IMAGES = 5;
    const usedImageUrls = new Set<string>();

    if (h2s.length > 0) {
        const numImagesToInsert = Math.min(MAX_IMAGES, h2s.length);
        const indicesToInsertAt = Array.from({ length: numImagesToInsert }, (_, i) => 
            Math.floor(i * (h2s.length / numImagesToInsert))
        );
        console.log('🎯 이미지 삽입 위치:', indicesToInsertAt);

        for (const index of indicesToInsertAt) {
            const h2 = h2s[index];
            if (!h2) {
                console.log(`⚠️ H2 태그 없음 (인덱스 ${index})`);
                continue;
            }

            console.log(`\n🔍 처리중인 H2 (${index + 1}/${indicesToInsertAt.length}):`, h2.textContent?.substring(0, 50));

            let contentForSummary = '';
            let currentNode = h2.nextSibling;
            while (currentNode && currentNode.nodeName !== 'H2') {
                contentForSummary += currentNode.textContent || '';
                currentNode = currentNode.nextSibling;
            }

            const textToSummarize = (h2.textContent + " " + contentForSummary).replace(/\s+/g, ' ').trim().substring(0, 1000);
            console.log('📝 요약할 텍스트 길이:', textToSummarize.length);

            if (textToSummarize.length > 10) {
                try {
                    const keyword = await getSummaryKeywords(textToSummarize, geminiApiKey);
                    if (!keyword) {
                        console.log('❌ 키워드 생성 실패, 다음 섹션으로');
                        continue;
                    }

                    const allImages = await collectImagesFromMultiplePages(keyword, pixabayApiKey, 10);
                    
                    if (allImages.length === 0) {
                        console.log('❌ 검색된 이미지 없음:', keyword);
                        continue;
                    }
                    
                    const availableImages = allImages.filter(hit => !usedImageUrls.has(hit.webformatURL));
                    console.log('🎲 사용 가능한 이미지 수:', availableImages.length, '/ 전체:', allImages.length);

                    if (availableImages.length > 0) {
                        const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
                        const imageUrl = randomImage.webformatURL;
                        usedImageUrls.add(imageUrl);
                        console.log('✅ 선택된 이미지:', imageUrl);

                        // 섹션 요약 및 ALT 텍스트 생성
                        const sectionSummary = textToSummarize.substring(0, 100).replace(/[<>]/g, '').trim();
                        const altText = sectionSummary || h2.textContent?.trim() || keyword;
                        
                        // 이미지 정보를 자동으로 클립보드 시스템에 전달
                        if (onImageFound) {
                            onImageFound(imageUrl, altText, imageCount + 1);
                        }

                        // 블로그에 640x480 이미지 태그 직접 삽입
                        const imageContainer = doc.createElement('div');
                        imageContainer.style.textAlign = 'center';
                        imageContainer.style.margin = '2em 0';
                        imageContainer.style.padding = '1em';
                        imageContainer.style.borderRadius = '8px';
                        
                        const imgElement = doc.createElement('img');
                        imgElement.src = imageUrl;
                        imgElement.alt = altText;
                        imgElement.title = altText;
                        imgElement.style.width = '640px';
                        imgElement.style.height = '480px';
                        imgElement.style.objectFit = 'cover';
                        imgElement.style.borderRadius = '8px';
                        imgElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                        imgElement.setAttribute('data-description', altText);
                        imgElement.setAttribute('data-position', (imageCount + 1).toString());
                        
                        imageContainer.appendChild(imgElement);
                        h2.parentNode?.insertBefore(imageContainer, h2.nextSibling);
                        imageCount++;
                        console.log(`🖼️ 이미지 ${imageCount} 자동 삽입 완료 (640x480)`);
                    } else {
                        console.log('⚠️ 사용 가능한 이미지 없음 (모두 중복)');
                    }
                } catch (e) {
                    console.error("❌ 개별 이미지 통합 오류:", e);
                }
            } else {
                console.log('⚠️ 텍스트 길이 부족:', textToSummarize.length);
            }
        }
    } else {
        console.log('❌ H2 태그를 찾을 수 없음');
    }
    
    console.log(`🏁 자동 Pixabay 이미지 통합 완료: ${imageCount}개 이미지 삽입`);
    return { finalHtml: doc.body.innerHTML, imageCount };
};
