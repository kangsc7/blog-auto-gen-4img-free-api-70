
const getSummaryKeywords = async (text: string, geminiApiKey: string): Promise<string | null> => {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
    const summaryPrompt = `다음 텍스트를 Pixabay 이미지 검색에 적합한 2-3개의 한국어 키워드로 요약해 주세요. 쉼표로 구분된 키워드만 제공하고 다른 설명은 하지 마세요. 텍스트: "${text}"`;
    try {
        const summaryResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: summaryPrompt }] }] })
        });
        if (!summaryResponse.ok) return null;
        const summaryData = await summaryResponse.json();
        return summaryData.candidates?.[0]?.content?.parts?.[0]?.text.trim() || null;
    } catch (error) {
        console.error("Error generating summary keywords:", error);
        return null;
    }
};

const searchPixabayImages = async (keyword: string, pixabayApiKey: string, page: number = 1) => {
    const imageSearchUrl = `https://pixabay.com/api/?key=${pixabayApiKey}&q=${encodeURIComponent(keyword)}&image_type=photo&safesearch=true&per_page=50&page=${page}&lang=ko`;
    try {
        const imageResponse = await fetch(imageSearchUrl);
        if (!imageResponse.ok) return null;
        return await imageResponse.json();
    } catch (error) {
        console.error("Error searching pixabay images:", error);
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
            } else {
                // 더 이상 이미지가 없으면 중단
                break;
            }
        } catch (error) {
            console.error(`Error fetching page ${page}:`, error);
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
): Promise<{ finalHtml: string; imageCount: number }> => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const h2s = Array.from(doc.querySelectorAll('h2'));
    let imageCount = 0;
    const MAX_IMAGES = 5; // 4장에서 5장으로 증가
    const usedImageUrls = new Set<string>(); // 중복 이미지 추적을 위한 Set

    if (h2s.length > 0) {
        const numImagesToInsert = Math.min(MAX_IMAGES, h2s.length);
        const indicesToInsertAt = Array.from({ length: numImagesToInsert }, (_, i) => 
            Math.floor(i * (h2s.length / numImagesToInsert))
        );

        for (const index of indicesToInsertAt) {
            const h2 = h2s[index];
            if (!h2) continue;

            let contentForSummary = '';
            let currentNode = h2.nextSibling;
            while (currentNode && currentNode.nodeName !== 'H2') {
                contentForSummary += currentNode.textContent || '';
                currentNode = currentNode.nextSibling;
            }

            const textToSummarize = (h2.textContent + " " + contentForSummary).replace(/\s+/g, ' ').trim().substring(0, 1000);

            if (textToSummarize.length > 10) {
                try {
                    const keyword = await getSummaryKeywords(textToSummarize, geminiApiKey);
                    if (!keyword) continue;

                    // 10페이지까지 검색하여 더 많은 이미지 수집
                    const allImages = await collectImagesFromMultiplePages(keyword, pixabayApiKey, 10);
                    
                    // 사용하지 않은 이미지만 필터링
                    const availableImages = allImages.filter(hit => !usedImageUrls.has(hit.webformatURL));

                    if (availableImages.length > 0) {
                        // 랜덤하게 이미지 선택하여 중복 방지
                        const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
                        const imageUrl = randomImage.webformatURL;
                        usedImageUrls.add(imageUrl); // 사용된 이미지 URL 추가

                        const imageContainer = doc.createElement('div');
                        imageContainer.style.textAlign = 'center';
                        imageContainer.style.margin = '2em 0';
                        
                        const img = doc.createElement('img');
                        img.src = imageUrl;
                        img.alt = h2.textContent?.trim() || keyword;
                        img.style.maxWidth = '90%';
                        img.style.height = 'auto';
                        img.style.borderRadius = '8px';
                        img.style.display = 'block';
                        img.style.marginLeft = 'auto';
                        img.style.marginRight = 'auto';
                        
                        imageContainer.appendChild(img);
                        
                        h2.parentNode?.insertBefore(imageContainer, h2.nextSibling);
                        imageCount++;
                    }
                } catch (e) {
                    console.error("Error integrating single image:", e);
                }
            }
        }
    }
    
    return { finalHtml: doc.body.innerHTML, imageCount };
};
