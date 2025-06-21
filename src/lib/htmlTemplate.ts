
import { generateMetaDescription } from './pixabay';

export const getHtmlTemplate = (
  topic: string,
  content: string,
  section1: string,
  section2: string,
  section3: string
): string => {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${topic}</title>
    <style>
        body {
            font-family: 'Noto Sans KR', Arial, sans-serif;
            line-height: 1.8;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fafafa;
            color: #333;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            font-size: 2.2em;
            margin-bottom: 20px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            font-size: 1.6em;
            margin-top: 30px;
            margin-bottom: 15px;
            border-left: 4px solid #3498db;
            padding-left: 15px;
        }
        h3 {
            color: #2c3e50;
            font-size: 1.3em;
            margin-top: 25px;
            margin-bottom: 12px;
        }
        p {
            margin-bottom: 16px;
            text-align: justify;
        }
        p[data-ke-size="size16"] {
            margin: 16px 0;
            line-height: 16px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        ${content}
    </div>
</body>
</html>`;
};

export const createBlogHtmlTemplate = async (
  title: string,
  content: string,
  referenceLink?: string,
  referenceSentence?: string,
  geminiApiKey?: string
): Promise<string> => {
  console.log('📄 블로그 HTML 템플릿 생성 시작:', { title, hasReferenceLink: !!referenceLink });
  
  // 메타 설명 생성
  let metaDescription = '';
  if (geminiApiKey) {
    try {
      metaDescription = await generateMetaDescription(content, geminiApiKey);
      console.log('📝 메타 설명 생성 완료:', metaDescription.substring(0, 50) + '...');
    } catch (error) {
      console.error('❌ 메타 설명 생성 실패:', error);
    }
  }

  // 콘텐츠에서 첫 번째 줄(주제) 뒤에 특별한 빈 줄 추가
  let processedContent = content;
  const lines = content.split('\n');
  if (lines.length > 1) {
    const firstLine = lines[0];
    const restContent = lines.slice(1).join('\n');
    processedContent = firstLine + '\n<p data-ke-size="size16">&nbsp;</p>\n' + restContent;
  }

  // 외부 링크를 태그 바로 위에 추가 - 강화된 버전
  let finalContent = processedContent;
  if (referenceLink && referenceLink.trim()) {
    console.log('🔗 외부링크 연동 시작:', { referenceLink, referenceSentence });
    
    //default 값 적용
    const safeReferenceLink = referenceLink || 'https://worldpis.com/';
    const safeReferenceSentence = referenceSentence || '👉 워드프레스 꿀팁 더 보러가기';
    
    // 태그들을 찾아서 그 위에 외부 링크 삽입
    const tagPattern = /<p[^>]*style="[^"]*text-align:\s*center[^"]*"[^>]*>(?!.*<a)[^<]*<\/p>\s*<\/article>\s*$/i;
    const tagMatch = finalContent.match(tagPattern);
    
    if (tagMatch) {
      const tagStartIndex = finalContent.lastIndexOf(tagMatch[0]);
      const beforeTags = finalContent.substring(0, tagStartIndex);
      const tagsSection = finalContent.substring(tagStartIndex);
      
      const referenceLinkHtml = `
<div style="text-align: center; margin: 35px 0 25px 0; padding: 25px; background: linear-gradient(135deg, #f0f8ff, #e6f3ff); border-radius: 15px; border: 2px solid #3498db; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.2);">
  <h4 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">💡 이 글과 관련된 더 많은 정보가 궁금하다면?</h4>
  <a style="display: inline-block; color: #ffffff; background: linear-gradient(135deg, #3498db, #2980b9); text-decoration: none; font-weight: 700; font-size: 18px; padding: 12px 30px; border-radius: 25px; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3); border: 2px solid transparent;" 
     href="${safeReferenceLink}" 
     target="_blank" 
     rel="noopener"
     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(52, 152, 219, 0.4)';"
     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(52, 152, 219, 0.3)';">
    ${safeReferenceSentence}
  </a>
  <p style="margin: 15px 0 0 0; color: #7f8c8d; font-size: 14px;">클릭하여 더 많은 유용한 정보를 확인해보세요!</p>
</div>

<p data-ke-size="size16">&nbsp;</p>`;
      
      finalContent = beforeTags + referenceLinkHtml + tagsSection;
      console.log('✅ 외부 링크가 태그 위에 성공적으로 추가됨');
    } else {
      // 태그가 없는 경우 </article> 태그 바로 앞에 추가
      const articleEndIndex = finalContent.lastIndexOf('</article>');
      if (articleEndIndex !== -1) {
        const beforeEnd = finalContent.substring(0, articleEndIndex);
        const afterEnd = finalContent.substring(articleEndIndex);
        
        const referenceLinkHtml = `
<div style="text-align: center; margin: 35px 0 25px 0; padding: 25px; background: linear-gradient(135deg, #f0f8ff, #e6f3ff); border-radius: 15px; border: 2px solid #3498db; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.2);">
  <h4 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">💡 이 글과 관련된 더 많은 정보가 궁금하다면?</h4>
  <a style="display: inline-block; color: #ffffff; background: linear-gradient(135deg, #3498db, #2980b9); text-decoration: none; font-weight: 700; font-size: 18px; padding: 12px 30px; border-radius: 25px; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3); border: 2px solid transparent;" 
     href="${safeReferenceLink}" 
     target="_blank" 
     rel="noopener"
     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(52, 152, 219, 0.4)';"
     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(52, 152, 219, 0.3)';">
    ${safeReferenceSentence}
  </a>
  <p style="margin: 15px 0 0 0; color: #7f8c8d; font-size: 14px;">클릭하여 더 많은 유용한 정보를 확인해보세요!</p>
</div>

<p data-ke-size="size16">&nbsp;</p>

`;
        
        finalContent = beforeEnd + referenceLinkHtml + afterEnd;
        console.log('✅ 외부 링크가 article 끝에 성공적으로 추가됨');
      }
    }
  }

  const currentDate = new Date().toLocaleDateString('ko-KR');
  
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${metaDescription ? `<meta name="description" content="${metaDescription}">` : ''}
    <meta name="keywords" content="${title.split(' ').slice(0, 5).join(', ')}">
    <meta property="og:title" content="${title}">
    ${metaDescription ? `<meta property="og:description" content="${metaDescription}">` : ''}
    <meta property="og:type" content="article">
    <style>
        body {
            font-family: 'Noto Sans KR', Arial, sans-serif;
            line-height: 1.8;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fafafa;
            color: #333;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            font-size: 2.2em;
            margin-bottom: 20px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            font-size: 1.6em;
            margin-top: 30px;
            margin-bottom: 15px;
            border-left: 4px solid #3498db;
            padding-left: 15px;
        }
        h3 {
            color: #2c3e50;
            font-size: 1.3em;
            margin-top: 25px;
            margin-bottom: 12px;
        }
        p {
            margin-bottom: 16px;
            text-align: justify;
        }
        ul, ol {
            margin-bottom: 16px;
            padding-left: 25px;
        }
        li {
            margin-bottom: 8px;
        }
        strong {
            color: #2c3e50;
            font-weight: 700;
        }
        .date {
            color: #7f8c8d;
            font-size: 0.9em;
            text-align: right;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
        }
        .pixabay-image-container {
            text-align: center;
            margin: 30px 0;
            padding: 25px;
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border-radius: 15px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }
        .pixabay-image {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            transition: all 0.3s ease;
            border: 3px solid #fff;
        }
        .pixabay-image:hover {
            transform: scale(1.05);
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
        }
        /* 특별한 빈 줄 스타일 */
        p[data-ke-size="size16"] {
            margin: 16px 0;
            line-height: 16px;
            font-size: 16px;
        }
        /* 외부 링크 호버 효과 개선 */
        .reference-link-enhanced {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .reference-link-enhanced:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 8px 25px rgba(52, 152, 219, 0.5) !important;
        }
    </style>
</head>
<body>
    <div class="container">
        ${finalContent}
        <div class="date">작성일: ${currentDate}</div>
    </div>
</body>
</html>`;

  console.log('✅ 블로그 HTML 템플릿 생성 완료 (외부링크 포함)');
  return htmlTemplate;
};
