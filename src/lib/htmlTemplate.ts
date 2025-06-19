
export const getHtmlTemplate = (
  title: string,
  content: string,
  metaDescription?: string,
  keywords?: string,
  canonicalUrl?: string
): string => {
  const finalMetaDescription = metaDescription || `${title}에 대한 상세한 정보와 실용적인 팁을 제공합니다.`;
  const finalKeywords = keywords || title.split(' ').join(', ');
  
  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${finalMetaDescription}">
    <meta name="keywords" content="${finalKeywords}">
    ${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}">` : ''}
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${finalMetaDescription}">
    <meta property="og:type" content="article">
    ${canonicalUrl ? `<meta property="og:url" content="${canonicalUrl}">` : ''}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${finalMetaDescription}">
    <style>
        body {
            font-family: 'Malgun Gothic', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        h2 {
            color: #34495e;
            margin-top: 40px;
            margin-bottom: 20px;
            padding-left: 15px;
            border-left: 4px solid #3498db;
        }
        h3 {
            color: #7f8c8d;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        .highlight {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #e74c3c;
            margin: 20px 0;
        }
        .tip {
            background-color: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #27ae60;
            margin: 20px 0;
        }
        ul, ol {
            margin-bottom: 20px;
            padding-left: 30px;
        }
        li {
            margin-bottom: 8px;
        }
        blockquote {
            font-style: italic;
            border-left: 4px solid #bdc3c7;
            padding-left: 20px;
            margin: 20px 0;
            color: #7f8c8d;
        }
        .image-container {
            text-align: center;
            margin: 30px 0;
        }
        .image-container img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
};

export const createBasicHtmlStructure = (title: string, content: string): string => {
  return getHtmlTemplate(title, content);
};

// 기본 HTML 구조 생성 함수들
export const wrapContentInHtml = (content: string, title?: string): string => {
  const pageTitle = title || '블로그 포스트';
  return getHtmlTemplate(pageTitle, content);
};

export const addMetaToHtml = (
  htmlContent: string,
  metaDescription: string,
  keywords: string
): string => {
  // 기존 HTML에 메타 정보 추가
  return htmlContent.replace(
    '<meta name="description"',
    `<meta name="description" content="${metaDescription}">\n    <meta name="keywords" content="${keywords}">\n    <meta name="description"`
  );
};
