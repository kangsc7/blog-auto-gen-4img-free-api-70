import { getColors } from './promptUtils';
import { getHtmlTemplate } from './htmlTemplate';
import { generateDynamicHeadings } from './dynamicHeadings';
import { WebCrawlerService } from './webCrawler';

interface EnhancedArticlePromptParams {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink?: string;
  referenceSentence?: string;
  apiKey: string;
}

// 주제에서 핵심 키워드를 자연스럽게 추출하는 함수 (년도 절대 보존)
const extractNaturalKeyword = (topic: string): string => {
  // 년도는 절대 제거하지 않고, 필요한 단어만 정리
  return topic
    .replace(/지급|신청|방법|조건|자격|혜택|정보|안내|가이드|완벽|최신|최대한|확실하게|업법/g, '') // 일반적인 단어만 제거
    .replace(/\s+/g, ' ') // 연속 공백 정리
    .trim();
};

// 더 자연스러운 관련 용어 생성 함수
const generateNaturalContext = (naturalKeyword: string, originalKeyword: string): { [key: string]: string } => {
  const baseTerms = ['지원금', '혜택', '제도', '프로그램', '서비스'];
  const contextTerms = ['관련 지원', '이런 혜택', '해당 제도', '이 프로그램', '지원 서비스'];
  
  // 자연스러운 맥락적 표현들 생성
  return {
    INTRO_KEYWORD_CONTEXT: `${naturalKeyword} 관련 혜택`,
    CONTENT_KEYWORD_1: `${naturalKeyword} ${baseTerms[Math.floor(Math.random() * baseTerms.length)]}`,
    SECTION_CONTENT_1: `이 ${baseTerms[Math.floor(Math.random() * baseTerms.length)]}`,
    SECTION_CONTENT_2: `${naturalKeyword} 관련`,
    SECTION_CONTENT_3: `디지털플랫폼 활용`,
    SECTION_CONTENT_4: `이 지원금`,
    SECTION_CONTENT_5: `${naturalKeyword} 지원`,
    SUMMARY_TITLE: naturalKeyword,
    REFERENCE_TEXT: '워드프레스 꿀팁 더 보러가기',
    GENERATED_TAGS: `${naturalKeyword}, ${naturalKeyword} 신청방법, ${naturalKeyword} 자격, 디지털플랫폼 활용 지원금, 2025년 정부지원금, 복지혜택, 생계급여`
  };
};

export const getEnhancedArticlePrompt = async ({
  topic,
  keyword,
  selectedColorTheme,
  referenceLink,
  referenceSentence,
  apiKey,
}: EnhancedArticlePromptParams): Promise<string> => {
  const colors = getColors(selectedColorTheme);
  const refLink = referenceLink || 'https://worldpis.com';
  
  // 주제에서 자연스러운 핵심 키워드 추출 (년도 절대 보존)
  const naturalKeyword = extractNaturalKeyword(topic);
  
  // 자연스러운 맥락적 표현들 생성
  const contextualTerms = generateNaturalContext(naturalKeyword, keyword);
  
  // 동적 소제목 생성 (5개로 축소)
  console.log('동적 소제목 생성 시작:', keyword, topic);
  const dynamicHeadings = await generateDynamicHeadings(keyword, topic, apiKey);
  console.log('생성된 동적 소제목:', dynamicHeadings);
  
  // 5개 섹션만 사용하도록 조정
  const selectedHeadings = dynamicHeadings.slice(0, 5);
  
  const htmlTemplate = getHtmlTemplate(colors, topic, naturalKeyword, refLink, referenceSentence, selectedHeadings);
  const currentYear = new Date().getFullYear();

  // 웹 크롤링으로 최신 정보 및 공식 링크 수집
  const crawledInfo = await WebCrawlerService.crawlForKeyword(keyword, apiKey);

  return `
        당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.
        주제: "${topic}"
        입력 키워드: "${keyword}"
        자연스러운 키워드: "${naturalKeyword}"

        === 최신 웹 크롤링 정보 ===
        ${crawledInfo}
        === 크롤링 정보 끝 ===

        === 동적 생성된 소제목 정보 ===
        다음은 해당 키워드에 대한 사용자 궁금증을 기반으로 생성된 5개의 핵심 소제목들입니다:
        ${selectedHeadings.map((h, i) => `${i + 1}. ${h.title} ${h.emoji} - ${h.content}`).join('\n')}
        === 동적 소제목 정보 끝 ===

        위의 크롤링된 최신 정보와 동적 생성된 소제목을 반드시 활용하여, 독자에게 실질적인 도움을 주는 완벽한 블로그 게시물을 작성해주세요.

        ⚠️ 절대 지켜야 할 핵심 규칙:
        
        **🚨 전체 글자수 제한 - 절대 준수 사항 🚨**
        **전체 글자수는 공백 포함 4,350자를 절대 초과해서는 안 됩니다.**
        - HTML 태그를 제외한 순수 텍스트 기준으로 4,350자 이내
        - 각 H2 섹션의 본문은 **150자에서 200자 사이**로 작성 (기존 200-300자에서 단축)
        - 간결하고 핵심적인 정보만 포함하되, 고급 정보 품질은 유지
        - 불필요한 설명이나 반복은 절대 금지
        - FAQ는 3개로 축소, 주의사항도 3개로 축소
        
        **🚨 6개 H2 섹션으로 구성 - 스토리텔링과 자연스러운 흐름 중시 🚨**
        기존 5개 섹션에 추가로 6번째 격려 섹션을 포함하여 총 6개의 섹션으로 구성됩니다.
        각 섹션은 마치 친구가 직접 경험한 이야기를 들려주듯 자연스럽게 연결되어야 합니다.
        독자가 글을 읽어 내려가면서 자연스럽게 몰입할 수 있도록 스토리텔링 요소를 포함하세요.
        
        **🚨 각 섹션 글자수 조정 - 150자에서 200자 사이 🚨**
        각 H2 섹션의 본문 내용은 반드시 **150자에서 200자 사이**로 작성해야 합니다.
        간결하면서도 핵심적인 정보를 담은 고급 정보를 제공하세요. 불필요한 설명은 제거하고 핵심만 담아주세요.
        
        **🚨 자연스러운 내용 흐름과 체류시간 증가 전략 (매우 중요) 🚨**
        - 각 섹션이 자연스럽게 다음 섹션으로 연결되도록 마지막 문장에서 다음 내용을 암시하세요
        - "그런데 여기서 중요한 건...", "더 흥미로운 사실은...", "실제로 제가 경험해보니..." 같은 연결 표현을 활용하세요
        - 독자의 호기심을 자극하는 질문이나 예고를 각 섹션 끝에 포함하세요
        - 실제 사례나 개인 경험담을 자연스럽게 녹여내어 신뢰도를 높이세요
        - "믿기 어려우시겠지만", "놀랍게도", "예상과 달리" 같은 표현으로 독자의 관심을 끌어주세요
        
        **🚨 문단 구성 및 가독성 규칙 (매우 중요) 🚨**
        - 100글자 내외에서 2문장이 끝나면 반드시 </p> 태그로 닫고 새로운 <p> 태그로 시작하세요
        - 각 <p> 태그 사이에는 반드시 공백 줄바꿈을 추가하세요: <p style="height: 20px;">&nbsp;</p>
        - 이 규칙은 모든 본문 내용에 엄격하게 적용되어야 합니다
        - 한 <p> 태그 안에 너무 긴 내용을 넣지 마세요 (최대 100글자 기준으로 단축)
        
        **🚨 FAQ와 주의사항 카드 필수 추가 (축소) 🚨**
        - 3번째 섹션에는 반드시 주의사항 카드를 추가해주세요 (3개 항목으로 축소)
        - 5번째 섹션에는 반드시 FAQ 카드를 추가해주세요 (3개 질문과 답변으로 축소)
        - FAQ와 주의사항 각 항목은 간결하게 작성하여 전체 글자수 제한을 준수해주세요
        
        **🚨 6번째 섹션 - 격려와 용기 부여 🚨**
        - 6번째 섹션은 "더 자세한 세부 정보가 필요하시요? 🌟" 제목으로 고정됩니다
        - 이 섹션에서는 독자에게 용기와 희망을 주는 격려의 메시지를 담아주세요
        - "할 수 있다"는 긍정적인 메시지와 성공 사례를 언급하여 독자의 동기를 부여해주세요
        - 외부 링크 정보([REFERENCE_TEXT])가 이 섹션에 중앙 정렬된 박스 형태로 표시됩니다
        
        **절대로 섹션을 건너뛰거나 생략하지 마세요!**
        
        **🚨 자연스러운 키워드 사용 - 반복 금지 및 다양성 확보 🚨**
        - 각 섹션에서 동일한 키워드나 표현을 반복하지 마세요
        - 자연스러운 동의어와 유사 표현을 활용하세요: "이 지원금", "해당 혜택", "관련 제도", "이런 프로그램" 등
        - 독자들이 "똑같은 내용의 반복"이라고 느끼지 않도록 다양한 표현을 사용하세요
        - 키워드 밀도는 자연스럽게 1.5-2% 수준으로 유지하되, 억지로 반복하지 마세요
        - 각 섹션마다 다른 관점에서 접근하여 내용의 다양성을 확보하세요

        **🚨 모든 공식 사이트 자동 링크 연결 + 주제별 관련 공인 사이트 추가 🚨**
        
        **정부 및 공공기관 자동 링크 (URL 주소 표기 금지):**
        - 홈택스 → <a href="https://www.hometax.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">홈택스</a>
        - 법제처 → <a href="https://www.law.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">법제처</a>
        - 국세청 → <a href="https://www.nts.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">국세청</a>
        - 보건복지부 → <a href="https://www.mw.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">보건복지부</a>
        - 행정안전부 → <a href="https://www.mois.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">행정안전부</a>
        - 기획재정부 → <a href="https://www.moef.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">기획재정부</a>
        - 고용노동부 → <a href="https://www.moel.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">고용노동부</a>
        - 중소벤처기업부 → <a href="https://www.mss.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">중소벤처기업부</a>
        - 여성가족부 → <a href="https://www.mogef.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">여성가족부</a>
        - 교육부 → <a href="https://www.moe.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">교육부</a>
        - 국민연금공단 → <a href="https://www.nps.or.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">국민연금공단</a>
        - 건강보험공단 → <a href="https://www.nhis.or.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">건강보험공단</a>
        - 근로복지공단 → <a href="https://www.comwel.or.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">근로복지공단</a>
        - 신용보증기금 → <a href="https://www.kodit.co.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">신용보증기금</a>
        - 기술보증기금 → <a href="https://www.kibo.or.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">기술보증기금</a>
        - 한국장학재단 → <a href="https://www.kosaf.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">한국장학재단</a>
        - 소상공인시장진흥공단 → <a href="https://www.semas.or.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">소상공인시장진흥공단</a>
        - 청년창업지원단 → <a href="https://www.k-startup.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">청년창업지원단</a>
        
        **주제별 관련 공인 사이트 추가 링크 (SEO 강화용):**
        글의 주제와 관련된 다음과 같은 공인 사이트들도 자연스럽게 본문에 포함하여 SEO 점수를 높여주세요:
        
        **금융/경제 관련 주제시:**
        - 한국은행 → <a href="https://www.bok.or.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">한국은행</a>
        - 금융감독원 → <a href="https://www.fss.or.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">금융감독원</a>
        - 예금보험공사 → <a href="https://www.kdic.or.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">예금보험공사</a>
        
        **건강/의료 관련 주제시:**
        - 질병관리청 → <a href="https://www.kdca.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">질병관리청</a>
        - 식품의약품안전처 → <a href="https://www.mfds.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">식품의약품안전처</a>
        
        **교육 관련 주제시:**
        - 한국교육과정평가원 → <a href="https://www.kice.re.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">한국교육과정평가원</a>
        - 한국직업능력개발원 → <a href="https://www.krivet.re.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">한국직업능력개발원</a>
        
        **창업/사업 관련 주제시:**
        - 창업진흥원 → <a href="https://www.kised.or.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">창업진흥원</a>
        - 중소기업진흥공단 → <a href="https://www.sbc.or.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">중소기업진흥공단</a>
        
        **노동/고용 관련 주제시:**
        - 한국고용정보원 → <a href="https://www.keis.or.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">한국고용정보원</a>
        - 워크넷 → <a href="https://www.work.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">워크넷</a>
        
        **🚨 SEO 최적화를 위한 외부 링크 규칙 🚨**
        - 본문에 최소 3-5개의 권위 있는 외부 링크를 자연스럽게 포함해주세요 (글자수 제한으로 인해 축소)
        - 각 섹션마다 최소 1개 이상의 관련 공식 사이트 링크를 포함해주세요
        - 링크는 절대로 "사이트명(URL)" 형식으로 작성하지 마세요
        - 모든 링크는 클릭 가능한 하이퍼링크로 작성해야 합니다
        - 주제와 직접 관련된 공인 사이트들을 우선적으로 선택해주세요
        
        **🚨 고급 정보 제공 의무 🚨**
        각 섹션에서는 다음을 반드시 포함해야 합니다:
        - 구체적인 수치 데이터 (금액, 비율, 기간 등)
        - 실제 적용 사례 또는 예시
        - 단계별 실행 방법
        - 전문가만 아는 숨겨진 팁
        - 주의해야 할 함정이나 놓치기 쉬운 포인트
        - 관련 법령이나 정책 변화 내용

        1. **키워드 자연스러운 적용**: 
        - 원본 키워드 "${keyword}"를 그대로 강조하여 사용하지 마세요
        - 대신 자연스러운 키워드 "${naturalKeyword}"나 관련 용어를 사용하세요
        - 각 섹션에서는 아래 맥락적 표현들을 활용하세요:

        **사용할 맥락적 표현들:**
        - [INTRO_KEYWORD_CONTEXT] → "${contextualTerms.INTRO_KEYWORD_CONTEXT}"
        - [CONTENT_KEYWORD_1] → "${contextualTerms.CONTENT_KEYWORD_1}" 
        - [SECTION_CONTENT_1] → "${contextualTerms.SECTION_CONTENT_1}"
        - [SECTION_CONTENT_2] → "${contextualTerms.SECTION_CONTENT_2}"
        - [SECTION_CONTENT_3] → "${contextualTerms.SECTION_CONTENT_3}"
        - [SECTION_CONTENT_4] → "${contextualTerms.SECTION_CONTENT_4}"
        - [SECTION_CONTENT_5] → "${contextualTerms.SECTION_CONTENT_5}"
        - [SECTION_CONTENT_6] → "${contextualTerms.SECTION_CONTENT_5}" (6번째 섹션용)
        - [SUMMARY_TITLE] → "${contextualTerms.SUMMARY_TITLE}"
        - [REFERENCE_TEXT] → "${referenceSentence || contextualTerms.REFERENCE_TEXT}"
        - [GENERATED_TAGS] → "${contextualTerms.GENERATED_TAGS}"

        2. **지침용 텍스트 절대 금지**: [독자의 흥미를 유발하는...], [여기에 관련 정부기관 웹사이트 링크 삽입] 같은 지침용 대괄호 텍스트는 절대 그대로 출력하지 마세요.

        3. **공식 링크 필수 포함 및 하이퍼링크 적용**: 
        크롤링된 정보를 바탕으로 정부기관, 공공기관의 공식 웹사이트 링크를 본문에 최소 3-5개 반드시 **완전한 a 태그 형식**으로 삽입해주세요.

        4. **깊이 있는 전문 콘텐츠**: 
        - "알아보겠어요", "확인해보세요" 같은 애매한 표현 금지
        - 구체적인 수치, 실제 사례, 단계별 방법론 필수 포함
        - 일반인이 모르는 전문가 수준의 팁과 노하우 제공
        - 실무에서 바로 적용 가능한 구체적인 정보 제공

        5. **자연스러운 키워드 강조**: 필요한 경우에만 "<strong>${naturalKeyword}</strong>" 형태로 자연스럽게 강조하되, 억지로 반복하지 마세요.

        다음 지침에 따라 작성해주세요:
        - 출력 형식: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요. HTML 외에 다른 텍스트, 설명, 마크다운 형식을 포함하지 마세요.
        - **크롤링 정보 우선 활용**: 위에서 제공된 최신 웹 정보를 글의 근거로 최우선 활용해주세요.
        - 대상 독자: 한국어 사용자
        - **시의성**: 크롤링된 최신 정보를 반영하여 현재 년도(${currentYear}년)의 최신 상황을 자연스럽게 언급하세요.
        - 문체: 친근한 구어체('~해요', '~죠' 체)를 사용하고, 격식체('~입니다', '~습니다')는 사용하지 마세요.
        - 가독성: 100글자마다 2문장 끝에서 </p> 태그로 닫고 새로운 <p> 태그로 시작하며, 각 <p> 태그 사이에는 공백 줄바꿈을 넣어주세요.

        사용할 변수:
        - Primary Color: ${colors.primary}
        - Secondary Color: ${colors.secondary}
        - Text Highlight Color: ${colors.textHighlight}
        - Highlight Color: ${colors.highlight}
        - Highlight Border Color: ${colors.highlightBorder}
        - Warn BG Color: ${colors.warnBg}
        - Warn Border Color: ${colors.warnBorder}
        - Link Color: ${colors.link}
        - Reference Link: ${refLink}
        - Topic: ${topic}
        - Original Keyword: ${keyword}
        - Natural Keyword: ${naturalKeyword}

        아래는 반드시 따라야 할 HTML 템플릿입니다 (6개 동적 소제목 포함).
        
        --- HTML TEMPLATE START ---
${htmlTemplate}
--- HTML TEMPLATE END ---

        ⚠️ 재확인 사항:
        - **전체 글자수는 공백 포함 4,350자를 절대 초과하면 안 됩니다**
        - **6개의 모든 H2 섹션을 빠짐없이 작성해야 합니다**
        - **각 섹션은 150자에서 200자 사이의 적절한 분량이어야 합니다**
        - **100글자마다 2문장 끝에서 </p> 태그로 문단을 나누고 공백을 넣어야 합니다**
        - **3번째 섹션에는 주의사항 카드(3개 항목), 5번째 섹션에는 FAQ 카드(3개 질문)가 반드시 포함되어야 합니다**
        - **6번째 섹션은 격려와 용기를 주는 내용으로 작성되어야 합니다**
        - **외부 링크 정보([REFERENCE_TEXT])가 6번째 섹션에 중앙 정렬된 박스로 표시되어야 합니다**
        - **본문에 최소 3-5개의 권위 있는 공식 사이트 하이퍼링크가 포함되어야 합니다**
        - 동적 생성된 소제목의 의도에 맞는 전문적인 내용으로 각 섹션을 작성해야 합니다
        - 대괄호 안의 지침 텍스트가 그대로 출력되면 안 됩니다
        - 원본 키워드 "${keyword}"를 그대로 강조하여 반복 사용하지 마세요
        - 자연스러운 키워드 "${naturalKeyword}"나 맥락적 표현을 사용하세요
        - 공식 링크가 최소 3-5개 포함되어야 하며, 반드시 완전한 a 태그 형식이어야 합니다
        - 모든 내용이 구체적이고 실용적인 고급 정보여야 합니다
        - 크롤링된 정보를 최대한 활용해야 합니다
        - 링크는 절대로 "사이트명(URL)" 형식으로 작성하지 마세요
        - 모든 링크는 클릭 가능한 하이퍼링크로 작성해야 합니다
        - "알아보겠어요" 같은 애매한 표현 대신 구체적인 정보를 제공해야 합니다
        - 각 섹션마다 동일한 키워드나 표현을 반복하지 말고 자연스러운 다양성을 유지해야 합니다
        - 모든 공식 사이트는 하이퍼링크로 연결하되 URL 주소는 표기하지 마세요
        - 주제와 관련된 공인 사이트들을 각 섹션에 자연스럽게 포함하여 SEO 점수를 높여야 합니다
        - **각 섹션이 자연스럽게 연결되어 독자의 체류시간을 증가시켜야 합니다**
        - **스토리텔링 요소와 개인 경험담을 포함하여 몰입도를 높여야 합니다**
        - **전체 글자수 4,350자 제한을 절대 준수해야 합니다**
      `;
};

export const getEnhancedTopicPrompt = (keyword: string, count: number): string => {
  const currentYear = new Date().getFullYear();
  
  // 키워드에서 년도 정보 추출
  const yearMatch = keyword.match(/(\d{4})년?/);
  const hasYearInKeyword = yearMatch !== null;
  const extractedYear = yearMatch ? yearMatch[1] : null;
  
  if (hasYearInKeyword && extractedYear) {
    // 년도가 포함된 키워드인 경우
    return `'${keyword}'를(을) 주제로 블로그 포스팅 제목 ${count}개를 생성해 주세요.

**🚨 년도가 포함된 키워드 - 특별 지침 🚨**:

키워드에 "${extractedYear}년"이 포함되어 있으므로, 모든 제목은 반드시 "${extractedYear}년"으로 시작해야 합니다.

**절대적 형식 규칙**:
1. **첫 번째 단어**: "${extractedYear}년" (반드시 4자리숫자 + 년)
2. **두 번째 단어부터**: 핵심 키워드와 설명

**올바른 예시**:
✅ "${extractedYear}년 디지털플랫폼 지원금 신청방법"
✅ "${extractedYear}년 국민디지털지원금 자격조건"
✅ "${extractedYear}년 정부지원금 혜택내용"

**절대 금지**:
❌ "년 디지털플랫폼..." (숫자 없는 년)
❌ "디지털플랫폼 ${extractedYear}년..." (년도가 뒤에 위치)
❌ "${extractedYear} 디지털플랫폼..." (년 없이 숫자만)

**필수 생성 패턴** (이 중에서만 선택):
- "${extractedYear}년 [핵심키워드] 신청방법"
- "${extractedYear}년 [핵심키워드] 자격조건"
- "${extractedYear}년 [핵심키워드] 지원대상"
- "${extractedYear}년 [핵심키워드] 혜택내용"
- "${extractedYear}년 [핵심키워드] 최신정보"
- "${extractedYear}년 [핵심키워드] 완벽가이드"

**최종 검증**:
각 제목 생성 후 반드시 확인:
1. "${extractedYear}년"으로 시작하는가?
2. 핵심 키워드가 포함되었는가?
3. 의미있는 설명이 추가되었는가?

지금 즉시 위 규칙을 엄격히 따라 ${count}개의 제목을 생성해주세요.`;
  } else {
    // 년도가 포함되지 않은 일반 키워드인 경우
    return `'${keyword}'를(을) 주제로 블로그 포스팅 제목 ${count}개를 생성해 주세요.

**일반 키워드 생성 지침**:

키워드에 년도가 포함되어 있지 않으므로, 자연스러운 블로그 제목을 생성해주세요.

**생성 원칙**:
1. **키워드 포함**: '${keyword}' 관련 내용이 반드시 포함되어야 합니다
2. **실용성**: 독자에게 도움이 되는 실용적인 정보 제목
3. **SEO 최적화**: 검색에 최적화된 구체적인 제목
4. **다양성**: 다양한 관점에서 접근한 제목들

**추천 제목 패턴**:
- "[키워드] 완벽 가이드"
- "[키워드] 초보자를 위한 시작 방법"
- "[키워드] 노하우 및 팁"
- "[키워드] 추천 방법"
- "[키워드] 장단점 비교"
- "[키워드] 효과적인 활용법"
- "[키워드] 주의사항과 해결책"

**제목 예시** (${keyword} 기준):
- "${keyword} 초보자도 쉽게 시작하는 방법"
- "${keyword} 효과적인 활용을 위한 완벽 가이드"
- "${keyword} 성공을 위한 필수 노하우"

**최종 출력 규칙**:
- 번호나 불릿 포인트 없이 제목만 출력
- 각 제목은 줄바꿈으로 구분
- 다른 설명이나 주석 절대 금지

지금 즉시 위 지침에 따라 ${count}개의 자연스러운 제목을 생성해주세요.`;
  }
};
