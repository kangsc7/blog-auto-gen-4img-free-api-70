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
</head>
<body>
    <article>
        <h1>${topic}</h1>
        <p>여기에 블로그 글 내용이 들어갑니다.</p>
        
        ${referenceLink ? `<div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
                👉 이 글과 관련된 다른 정보가 궁금하다면?
                <a href="${referenceLink}" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline; margin-left: 8px;">${referenceText || '워드프레스 꿀팁 더 보러가기'}</a>
            </p>
        </div>` : ''}
    </article>
</body>
</html>`;
};
