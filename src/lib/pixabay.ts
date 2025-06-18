
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

// 이미지를 클립보드에 복사하는 함수
const copyImageToClipboard = async (imageUrl: string): Promise<boolean> => {
    try {
        console.log('📋 이미지 클립보드 복사 시작:', imageUrl);
        
        const response = await fetch(imageUrl, { mode: 'cors' });
        const blob = await response.blob();
        
        if (navigator.clipboard && window.ClipboardItem) {
            const clipboardItem = new ClipboardItem({
                [blob.type]: blob
            });
            await navigator.clipboard.write([clipboardItem]);
            console.log('✅ 클립보드 복사 성공');
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ 클립보드 복사 실패:', error);
        return false;
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
    geminiApiKey: string
): Promise<{ finalHtml: string; imageCount: number; clipboardImages: string[] }> => {
    console.log('🚀 Pixabay 이미지 통합 시작 (Base64 변환 모드)');
    console.log('📄 HTML 콘텐츠 길이:', htmlContent.length);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const h2s = Array.from(doc.querySelectorAll('h2'));
    console.log('📋 발견된 H2 태그 수:', h2s.length);
    
    let imageCount = 0;
    const MAX_IMAGES = 5;
    const usedImageUrls = new Set<string>();
    const clipboardImages: string[] = []; // 클립보드용 이미지 URL 저장

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

                        // Base64로 변환 시도
                        const base64Image = await convertImageToBase64(imageUrl);
                        
                        const imageContainer = doc.createElement('div');
                        imageContainer.style.textAlign = 'center';
                        imageContainer.style.margin = '2em 0';
                        
                        const img = doc.createElement('img');
                        const altText = h2.textContent?.trim() || keyword;
                        const sanitizedAltText = altText.replace(/[<>]/g, '').trim();
                        
                        if (base64Image) {
                            // Base64 이미지 사용
                            img.src = base64Image;
                            console.log('✅ Base64 이미지 생성 성공');
                        } else {
                            // Base64 실패 시 원본 URL 사용하되 플레이스홀더 추가
                            img.src = imageUrl;
                            img.setAttribute('data-original-url', imageUrl);
                            img.setAttribute('data-conversion-failed', 'true');
                            console.log('⚠️ Base64 변환 실패, 원본 URL 사용');
                        }
                        
                        img.alt = sanitizedAltText;
                        img.title = sanitizedAltText;
                        img.setAttribute('data-filename', sanitizedAltText.replace(/[^a-zA-Z0-9가-힣]/g, '_') + '.jpg');
                        img.setAttribute('data-pixabay-keyword', keyword);
                        
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        img.style.borderRadius = '8px';
                        img.style.display = 'block';
                        img.style.marginLeft = 'auto';
                        img.style.marginRight = 'auto';
                        img.style.width = '100%';
                        img.style.minHeight = '200px';
                        img.style.objectFit = 'cover';
                        
                        // 클립보드 복사용 데이터 저장
                        clipboardImages.push(imageUrl);
                        
                        // 이미지 설명 추가
                        const caption = doc.createElement('p');
                        caption.style.textAlign = 'center';
                        caption.style.fontSize = '0.9em';
                        caption.style.color = '#666';
                        caption.style.marginTop = '0.5em';
                        caption.textContent = `📸 ${sanitizedAltText} 관련 이미지`;
                        
                        imageContainer.appendChild(img);
                        imageContainer.appendChild(caption);
                        
                        h2.parentNode?.insertBefore(imageContainer, h2.nextSibling);
                        imageCount++;
                        console.log(`🖼️ 이미지 ${imageCount} 삽입 완료`);
                        
                        // 클립보드에 자동 복사 시도 (백그라운드)
                        copyImageToClipboard(imageUrl).catch(error => {
                            console.warn('📋 자동 클립보드 복사 실패:', error);
                        });
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
    
    // 이미지 변환 실패한 것들에 대한 안내 메시지 추가
    const failedImages = doc.querySelectorAll('img[data-conversion-failed="true"]');
    if (failedImages.length > 0) {
        const notice = doc.createElement('div');
        notice.style.backgroundColor = '#fff3cd';
        notice.style.border = '1px solid #ffeaa7';
        notice.style.padding = '1em';
        notice.style.margin = '1em 0';
        notice.style.borderRadius = '8px';
        notice.innerHTML = `
            <p style="margin: 0; color: #856404; font-weight: bold;">📋 이미지 안내</p>
            <p style="margin: 0.5em 0 0 0; color: #856404; font-size: 0.9em;">
                일부 이미지가 외부 링크로 삽입되었습니다. 티스토리 업로드 시 해당 이미지들을 수동으로 복사-붙여넣기 해주세요.
            </p>
        `;
        
        if (doc.body.firstChild) {
            doc.body.insertBefore(notice, doc.body.firstChild);
        }
    }
    
    console.log(`🏁 Pixabay 이미지 통합 완료: ${imageCount}개 이미지 추가 (Base64: ${imageCount - failedImages.length}개, 링크: ${failedImages.length}개)`);
    return { 
        finalHtml: doc.body.innerHTML, 
        imageCount,
        clipboardImages 
    };
};
