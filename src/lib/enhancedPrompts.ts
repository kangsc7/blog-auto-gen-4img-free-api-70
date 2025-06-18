
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
  
  // 동적 소제목 생성 (5개로 축소) - 40자 제한 적용
  console.log('동적 소제목 생성 시작 (40자 제한):', keyword, topic);
  const dynamicHeadings = await generateDynamicHeadings(keyword, topic, apiKey);
  console.log('생성된 동적 소제목 (40자 제한):', dynamicHeadings.map(h => `${h.title} (${h.title.length}자)`));
  
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

        === 동적 생성된 소제목 정보 (40자 제한 적용) ===
        다음은 해당 키워드에 대한 사용자 궁금증을 기반으로 생성된 5개의 핵심 소제목들입니다 (각 40자 이내):
        ${selectedHeadings.map((h, i) => `${i + 1}. ${h.title} ${h.emoji} (${h.title.length}자) - ${h.content}`).join('\n')}
        === 동적 소제목 정보 끝 ===

        ⚠️ 절대 지켜야 할 핵심 규칙:

        **🚨 주제와 내용 일치성 - 최우선 준수 사항 🚨**
        **글의 모든 내용은 반드시 주제 "${topic}"와 정확히 일치해야 합니다.**
        - 주제가 "금리인하 전망 분석"이면 금리인하에 대한 내용만 작성
        - 주제가 "투자 전략"이면 투자에 대한 내용만 작성
        - 주제가 "2025년 정부지원금"이면 해당 지원금에 대한 내용만 작성
        - 절대로 다른 주제의 내용(지원금, 혜택 등)을 억지로 끼워넣지 마세요
        - "이 지원금에 대해 궁금한 점이 많으시죠?" 같은 관련 없는 표현 절대 금지
        - 모든 문장이 선택된 주제와 직접적으로 연관되어야 합니다

        **🚨 자연스러운 글 작성 - 템플릿 표현 금지 🚨**
        - "이 지원금", "해당 혜택", "관련 제도" 등의 템플릿 표현을 남발하지 마세요
        - 주제에 맞는 구체적인 용어를 사용하세요
        - 예: 금리 주제라면 "금리 변동", "통화정책", "경제 상황" 등 사용
        - 억지로 키워드를 반복하지 말고 자연스럽게 작성하세요

        **🚨 전체 글자수 제한 - 절대 준수 사항 🚨**
        **전체 글자수는 공백 포함 4,350자를 절대 초과해서는 안 됩니다.**
        - HTML 태그를 제외한 순수 텍스트 기준으로 4,350자 이내
        - **각 H2 섹션의 본문은 200자에서 270자 사이로 작성** (기존 190~250자에서 상향 조정)
        - 간결하고 핵심적인 정보만 포함하되, 고급 정보 품질은 유지

        **🚨 6개 H2 섹션으로 구성 - FAQ 중복 절대 금지 🚨**
        기존 5개 섹션에 추가로 6번째 격려 섹션을 포함하여 총 6개의 섹션으로 구성됩니다.
        ⚠️ **FAQ 중복 생성 절대 금지**: 
        - 동적 소제목에 이미 FAQ 관련 내용이 포함되지 않도록 설계되었습니다
        - 5번째 섹션에만 FAQ를 추가하고, 다른 섹션에서는 FAQ 관련 내용을 절대 작성하지 마세요
        - "자주 묻는 질문", "FAQ", "Q&A" 등의 표현을 중복 사용하지 마세요
        모든 섹션은 선택된 주제 "${topic}"에 대한 내용만 포함해야 합니다.

        **🚨 문단 구성 및 가독성 규칙 🚨**
        - 140글자 내외에서 2-3문장이 끝나면 반드시 </p> 태그로 닫고 새로운 <p> 태그로 시작하세요
        - 각 <p> 태그 사이에는 반드시 공백 줄바꿈을 추가하세요: <p style="height: 20px;">&nbsp;</p>

        **🚨 FAQ와 주의사항 카드 필수 추가 🚨**
        - 3번째 섹션에는 반드시 주의사항 카드를 추가해주세요 (3개 항목으로 축소)
        - 5번째 섹션에만 FAQ 카드를 추가해주세요 (3개 질문과 답변으로 축소)
        - ⚠️ **5번째 섹션 이외의 다른 섹션에는 절대 FAQ를 추가하지 마세요**
        - 모든 FAQ와 주의사항은 주제 "${topic}"와 직접 관련된 내용이어야 합니다

        **🚨 6번째 섹션 - 격려와 용기 부여 🚨**
        - 6번째 섹션은 "더 자세한 세부 정보가 필요하시요? 🌟" 제목으로 고정됩니다
        - 이 섹션에서는 주제와 관련된 격려의 메시지를 담아주세요
        - 주제에 맞는 성공 사례나 긍정적인 전망을 언급해주세요

        **🚨 시각요약 카드 필수 포함 🚨**
        - 6번째 섹션 이후에 반드시 시각요약 카드가 포함됩니다
        - 이 카드는 주요 정보를 한눈에 볼 수 있도록 정리한 요약 섹션입니다
        - 템플릿에 이미 포함되어 있으므로 추가로 작성하지 마세요

        **🚨 공식 사이트 자동 링크 연결 - 복구됨 🚨**
        본문에 주제와 관련된 공식 사이트 링크를 3-5개 자연스럽게 포함해주세요.
        **반드시 다음 형식으로 작성하세요:**
        - 정부24: <a href="https://www.gov.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">정부24</a>
        - 복지로: <a href="https://www.bokjiro.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">복지로</a>
        - 보건복지부: <a href="https://www.mohw.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">보건복지부</a>
        - 고용노동부: <a href="https://www.moel.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">고용노동부</a>
        - 국세청: <a href="https://www.nts.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">국세청</a>
        **절대 사용 금지**: "정부24(https://www.gov.kr)" 형식이나 단순 URL만 쓰는 것은 절대 금지

        위의 크롤링된 최신 정보와 동적 생성된 소제목을 반드시 활용하여, 독자에게 실질적인 도움을 주는 완벽한 블로그 게시물을 작성해주세요.

        **🚨 고급 정보 제공 의무 🚨**
        각 섹션에서는 다음을 반드시 포함해야 합니다:
        - 구체적인 수치 데이터 (금액, 비율, 기간 등)
        - 실제 적용 사례 또는 예시
        - 단계별 실행 방법
        - 전문가만 아는 숨겨진 팁
        - 주의해야 할 함정이나 놓치기 쉬운 포인트

        다음 지침에 따라 작성해주세요:
        - 출력 형식: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요
        - **크롤링 정보 우선 활용**: 위에서 제공된 최신 웹 정보를 글의 근거로 최우선 활용해주세요
        - 대상 독자: 한국어 사용자
        - **시의성**: 크롤링된 최신 정보를 반영하여 현재 년도(${currentYear}년)의 최신 상황을 자연스럽게 언급하세요
        - 문체: 친근한 구어체('~해요', '~죠' 체)를 사용하고, 격식체('~입니다', '~습니다')는 사용하지 마세요
        - 가독성: 140글자마다 2-3문장 끝에서 </p> 태그로 닫고 새로운 <p> 태그로 시작하며, 각 <p> 태그 사이에는 공백 줄바꿈을 넣어주세요

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

        아래는 반드시 따라야 할 HTML 템플릿입니다 (6개 동적 소제목 + 시각요약 카드 포함).
        
        --- HTML TEMPLATE START ---
${htmlTemplate}
--- HTML TEMPLATE END ---

        ⚠️ 재확인 사항:
        - **모든 내용이 주제 "${topic}"와 정확히 일치해야 합니다**
        - **관련 없는 지원금이나 혜택 내용을 억지로 끼워넣지 마세요**
        - **"이 지원금에 대해..." 같은 템플릿 표현을 사용하지 마세요**
        - **전체 글자수는 4,350자를 절대 초과하면 안 됩니다**
        - **6개의 모든 H2 섹션을 빠짐없이 작성해야 합니다**
        - **각 섹션은 200자에서 270자 사이의 적절한 분량이어야 합니다**
        - **주제와 관련된 구체적이고 실용적인 고급 정보여야 합니다**
        - **크롤링된 정보를 최대한 활용해야 합니다**
        - **⚠️ FAQ는 5번째 섹션에만 추가하고, 다른 섹션에서는 절대 중복 생성하지 마세요**
        - **🚨 소제목은 40자 이내로 제한되었습니다**
        - **🚨 공식 링크는 반드시 하이퍼링크 형태로 포함해야 합니다**
        - **🚨 시각요약 카드가 자동으로 포함되므로 별도 작성하지 마세요**
      `;
};

export const getEnhancedTopicPrompt = (keyword: string, count: number): string => {
  const currentYear = new Date().getFullYear();
  
  // 키워드에서 년도 정보 추출
  const yearMatch = keyword.match(/(\d{4})년?/);
  const hasYearInKeyword = yearMatch !== null;
  const extractedYear = yearMatch ? yearMatch[1] : null;
  
  if (hasYearInKeyword && extractedYear) {
    // 년도가 포함된 키워드인 경우 - 2025년만 허용
    const finalYear = extractedYear === '2023' || extractedYear === '2024' ? '2025' : extractedYear;
    
    return `'${keyword}'를(을) 주제로 블로그 포스팅 제목 ${count}개를 생성해 주세요.

**🚨 년도가 포함된 키워드 - 특별 지침 🚨**:

키워드에 "${extractedYear}년"이 포함되어 있지만, 최신 이슈를 위해 "${finalYear}년"으로 업데이트하여 생성합니다.

**절대적 형식 규칙**:
1. **첫 번째 단어**: "${finalYear}년" (반드시 4자리숫자 + 년)
2. **두 번째 단어부터**: 핵심 키워드와 설명
3. **🚨 2023년, 2024년은 절대 사용 금지 - 모두 2025년으로 변경 🚨**

**올바른 예시**:
✅ "${finalYear}년 디지털플랫폼 지원금 신청방법"
✅ "${finalYear}년 국민디지털지원금 자격조건"
✅ "${finalYear}년 정부지원금 혜택내용"

**절대 금지**:
❌ "2023년 디지털플랫폼..." (2023년 사용 금지)
❌ "2024년 디지털플랫폼..." (2024년 사용 금지)
❌ "년 디지털플랫폼..." (숫자 없는 년)
❌ "디지털플랫폼 ${finalYear}년..." (년도가 뒤에 위치)

**필수 생성 패턴** (이 중에서만 선택):
- "${finalYear}년 [핵심키워드] 신청방법"
- "${finalYear}년 [핵심키워드] 자격조건"
- "${finalYear}년 [핵심키워드] 지원대상"
- "${finalYear}년 [핵심키워드] 혜택내용"
- "${finalYear}년 [핵심키워드] 최신정보"
- "${finalYear}년 [핵심키워드] 완벽가이드"

**최종 검증**:
각 제목 생성 후 반드시 확인:
1. "${finalYear}년"으로 시작하는가?
2. 2023년, 2024년이 포함되지 않았는가?
3. 핵심 키워드가 포함되었는가?
4. 의미있는 설명이 추가되었는가?

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
5. **최신성**: 필요시 2025년을 자연스럽게 포함

**추천 제목 패턴**:
- "[키워드] 완벽 가이드"
- "[키워드] 초보자를 위한 시작 방법"
- "[키워드] 노하우 및 팁"
- "[키워드] 추천 방법"
- "[키워드] 장단점 비교"
- "[키워드] 효과적인 활용법"
- "[키워드] 주의사항과 해결책"
- "2025년 [키워드] 최신 동향"

**제목 예시** (${keyword} 기준):
- "${keyword} 초보자도 쉽게 시작하는 방법"
- "${keyword} 효과적인 활용을 위한 완벽 가이드"
- "2025년 ${keyword} 성공을 위한 필수 노하우"

**최종 출력 규칙**:
- 번호나 불릿 포인트 없이 제목만 출력
- 각 제목은 줄바꿈으로 구분
- 다른 설명이나 주석 절대 금지

지금 즉시 위 지침에 따라 ${count}개의 자연스러운 제목을 생성해주세요.`;
  }
};
