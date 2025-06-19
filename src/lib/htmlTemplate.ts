
export const createBlogTemplate = (
  title: string,
  content: string,
  selectedColorTheme: string,
  keyword: string = ''
): string => {
  // 섹션별 글자수 최적화 (190-240자)
  const minSectionLength = 190;
  const maxSectionLength = 240;
  
  const processedContent = content
    .split(/(?=<h[23])/g)
    .map(section => {
      if (!section.includes('<h2') && !section.includes('<h3')) {
        return section;
      }
      
      const textContent = section.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const currentLength = textContent.length;
      
      if (currentLength < minSectionLength) {
        const additionalContent = ` 이러한 접근 방식을 통해 더욱 체계적이고 효과적인 결과를 얻을 수 있습니다. 실제 적용 시에는 개인의 상황과 환경을 고려하여 유연하게 조정하는 것이 중요합니다.`;
        return section + additionalContent.slice(0, minSectionLength - currentLength);
      } else if (currentLength > maxSectionLength) {
        return section.slice(0, maxSectionLength);
      }
      
      return section;
    })
    .join('');

  const cleanTitle = title.replace(/[<>]/g, '').trim();
  const cleanKeyword = keyword.replace(/[<>]/g, '').trim();

  const colorThemes: Record<string, { bg: string; text: string; accent: string }> = {
    minimal: { bg: '#FFFFFF', text: '#333333', accent: '#666666' },
    warm: { bg: '#FFF8F0', text: '#8B4513', accent: '#D2691E' },
    cool: { bg: '#F0F8FF', text: '#2F4F4F', accent: '#4682B4' },
    nature: { bg: '#F0FFF0', text: '#228B22', accent: '#32CD32' },
    elegant: { bg: '#FAF0E6', text: '#8B4513', accent: '#CD853F' },
    modern: { bg: '#F5F5F5', text: '#2C3E50', accent: '#3498DB' },
    vibrant: { bg: '#FFF5EE', text: '#FF6347', accent: '#FF4500' }
  };

  const theme = colorThemes[selectedColorTheme] || colorThemes.minimal;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cleanTitle}</title>
    ${cleanKeyword ? `<meta name="keywords" content="${cleanKeyword}">` : ''}
    <style>
        body {
            font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif;
            line-height: 1.8;
            color: ${theme.text};
            background-color: ${theme.bg};
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: ${theme.accent};
            border-bottom: 3px solid ${theme.accent};
            padding-bottom: 10px;
            font-size: 2.2em;
            margin-bottom: 30px;
        }
        h2 {
            color: ${theme.accent};
            font-size: 1.6em;
            margin-top: 40px;
            margin-bottom: 20px;
            border-left: 4px solid ${theme.accent};
            padding-left: 15px;
        }
        h3 {
            color: ${theme.text};
            font-size: 1.3em;
            margin-top: 25px;
            margin-bottom: 15px;
        }
        p {
            margin-bottom: 18px;
            text-align: justify;
        }
        .intro {
            background: linear-gradient(135deg, ${theme.bg} 0%, ${theme.accent}20 100%);
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .conclusion {
            background: ${theme.accent}10;
            padding: 25px;
            border-radius: 12px;
            margin-top: 30px;
            border: 1px solid ${theme.accent}30;
        }
        ul, ol {
            margin-bottom: 20px;
            padding-left: 30px;
        }
        li {
            margin-bottom: 8px;
        }
        img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin: 20px 0;
            display: block;
            cursor: pointer;
            user-select: none;
        }
        .image-container {
            text-align: center;
            margin: 20px 0;
        }
        @media (max-width: 768px) {
            body { padding: 15px; font-size: 16px; }
            h1 { font-size: 1.8em; }
            h2 { font-size: 1.4em; }
            h3 { font-size: 1.2em; }
        }
    </style>
</head>
<body>
    ${processedContent}
</body>
</html>`;
};
