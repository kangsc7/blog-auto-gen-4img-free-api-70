import { ColorTheme } from '@/types';

interface Colors {
  primary: string;
  secondary: string;
  textHighlight: string;
  highlight: string;
  highlightBorder: string;
  warnBg: string;
  warnBorder: string;
  link: string;
}

export const getColors = (selectedTheme: string): Colors => {
  switch (selectedTheme) {
    case 'blue':
      return {
        primary: '#1a73e8',
        secondary: '#4285f4',
        textHighlight: '#1967d2',
        highlight: '#e8f0fe',
        highlightBorder: '#4285f4',
        warnBg: '#fef7e0',
        warnBorder: '#fbbc04',
        link: '#1a73e8',
      };
    case 'green':
      return {
        primary: '#0f9d58',
        secondary: '#34a853',
        textHighlight: '#137333',
        highlight: '#e6f4ea',
        highlightBorder: '#34a853',
        warnBg: '#fef7e0',
        warnBorder: '#fbbc04',
        link: '#0f9d58',
      };
    case 'purple':
      return {
        primary: '#9334e6',
        secondary: '#a142f4',
        textHighlight: '#7627bb',
        highlight: '#f3e8fd',
        highlightBorder: '#9334e6',
        warnBg: '#fef7e0',
        warnBorder: '#fbbc04',
        link: '#9334e6',
      };
    case 'red':
      return {
        primary: '#ea4335',
        secondary: '#f44336',
        textHighlight: '#c5221f',
        highlight: '#fce8e6',
        highlightBorder: '#ea4335',
        warnBg: '#fef7e0',
        warnBorder: '#fbbc04',
        link: '#ea4335',
      };
    case 'orange':
      return {
        primary: '#fa7b17',
        secondary: '#f9ab00',
        textHighlight: '#e37400',
        highlight: '#fef3e6',
        highlightBorder: '#fa7b17',
        warnBg: '#fef7e0',
        warnBorder: '#fbbc04',
        link: '#fa7b17',
      };
    case 'teal':
      return {
        primary: '#00a19c',
        secondary: '#26a69a',
        textHighlight: '#00897b',
        highlight: '#e0f2f1',
        highlightBorder: '#00a19c',
        warnBg: '#fef7e0',
        warnBorder: '#fbbc04',
        link: '#00a19c',
      };
    case 'pink':
      return {
        primary: '#e84a75',
        secondary: '#ec5f82',
        textHighlight: '#d23964',
        highlight: '#fce4ec',
        highlightBorder: '#e84a75',
        warnBg: '#fef7e0',
        warnBorder: '#fbbc04',
        link: '#e84a75',
      };
    case 'brown':
      return {
        primary: '#996a4d',
        secondary: '#a67c52',
        textHighlight: '#7b5544',
        highlight: '#efebe9',
        highlightBorder: '#996a4d',
        warnBg: '#fef7e0',
        warnBorder: '#fbbc04',
        link: '#996a4d',
      };
    case 'gray':
      return {
        primary: '#5f6368',
        secondary: '#7a7c80',
        textHighlight: '#3c4043',
        highlight: '#f1f3f4',
        highlightBorder: '#5f6368',
        warnBg: '#fef7e0',
        warnBorder: '#fbbc04',
        link: '#5f6368',
      };
    default:
      return {
        primary: '#1a73e8',
        secondary: '#4285f4',
        textHighlight: '#1967d2',
        highlight: '#e8f0fe',
        highlightBorder: '#4285f4',
        warnBg: '#fef7e0',
        warnBorder: '#fbbc04',
        link: '#1a73e8',
      };
  }
};

export const getHtmlTemplate = (
  colors: Colors,
  topic: string,
  keyword: string,
  referenceLink: string,
  referenceText: string
): string => {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${topic}</title>
    <style>
        body {
            font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.8;
            margin: 0;
            padding: 20px;
            background-color: #fafafa;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: ${colors.primary};
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.2em;
            line-height: 1.3;
            border-bottom: 3px solid ${colors.secondary};
            padding-bottom: 15px;
        }
        h2 {
            color: ${colors.secondary};
            margin-top: 35px;
            margin-bottom: 20px;
            font-size: 1.5em;
            border-left: 4px solid ${colors.highlight};
            padding-left: 15px;
        }
        h3 {
            color: ${colors.primary};
            margin-top: 25px;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        p {
            margin-bottom: 18px;
            text-align: justify;
        }
        strong {
            color: ${colors.textHighlight};
            font-weight: 600;
        }
        .highlight {
            background-color: ${colors.highlight};
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 4px solid ${colors.highlightBorder};
        }
        .warning {
            background-color: ${colors.warnBg};
            border: 1px solid ${colors.warnBorder};
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        ul, ol {
            margin: 20px 0;
            padding-left: 30px;
        }
        li {
            margin-bottom: 8px;
        }
        a {
            color: ${colors.link};
            text-decoration: underline;
        }
        a:hover {
            text-decoration: none;
        }
        .reference-section {
            margin-top: 40px;
            padding-top: 25px;
            border-top: 2px solid ${colors.secondary};
            text-align: center;
        }
        .reference-link {
            display: inline-block;
            background-color: ${colors.primary};
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 10px;
            transition: all 0.3s ease;
        }
        .reference-link:hover {
            background-color: ${colors.secondary};
            transform: translateY(-2px);
            color: white;
            text-decoration: none;
        }
        .image-container {
            text-align: center;
            margin: 30px 0;
        }
        .content-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>[제목: ${topic}에 대한 매력적이고 구체적인 제목 작성]</h1>
        
        <p>[도입부: 독자의 관심을 끌고 ${keyword}에 대한 호기심을 자극하는 내용]</p>
        
        <h2>[첫 번째 소제목: ${keyword}와 관련된 실용적인 질문이나 팁]</h2>
        <p>[본문 내용: ${keyword}에 대한 구체적이고 실용적인 정보를 제공하되, <strong>${keyword}</strong>를 자연스럽게 한 번 강조 사용]</p>
        
        <div class="highlight">
            <p>[중요 정보나 팁을 강조하는 박스]</p>
        </div>
        
        <h2>[두 번째 소제목: ${keyword}의 다른 측면이나 활용법]</h2>
        <p>[본문 내용: 추가적인 가치 있는 정보를 제공하되, <strong>${keyword}</strong>를 자연스럽게 한 번 강조 사용]</p>
        
        <ul>
            <li>[구체적인 팁이나 방법 1]</li>
            <li>[구체적인 팁이나 방법 2]</li>
            <li>[구체적인 팁이나 방법 3]</li>
        </ul>
        
        <h2>[세 번째 소제목: ${keyword} 관련 주의사항이나 고급 팁]</h2>
        <p>[본문 내용: 심화된 내용이나 주의사항을 다루되, <strong>${keyword}</strong>를 자연스럽게 한 번 강조 사용]</p>
        
        <div class="warning">
            <p>[주의사항이나 중요한 경고사항]</p>
        </div>
        
        <h2>[마무리 소제목: ${keyword}에 대한 정리나 향후 전망]</h2>
        <p>[마무리 내용: 글을 정리하고 독자에게 동기부여를 주는 내용]</p>
        
        <div class="reference-section">
            <p>👉 <a href="${referenceLink}" target="_blank" rel="noopener" class="reference-link">${referenceText}</a></p>
        </div>
        
        <p style="margin-top: 30px; text-align: center; font-size: 0.9em; color: #666;">
            [태그를 쉼표로 구분하여 나열하되, '태그:' 접두사 없이 키워드만 작성]
        </p>
    </div>
</body>
</html>`;
};
