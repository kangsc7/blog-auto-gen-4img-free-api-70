import { getColors } from './promptUtils';
import { getHtmlTemplate } from './htmlTemplate';
import { generateDynamicHeadings } from './dynamicHeadings';

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
  
  const naturalKeyword = extractNaturalKeyword(topic);
  const contextualTerms = generateNaturalContext(naturalKeyword, keyword);
  
  console.log('동적 소제목 생성 시작 (40자 제한):', keyword, topic);
  const dynamicHeadings = await generateDynamicHeadings(keyword, topic, apiKey);
  console.log('생성된 동적 소제목 (40자 제한):', dynamicHeadings.map(h => `${h.title} (${h.title.length}자)`));
  
  const selectedHeadings = dynamicHeadings.slice(0, 5);
  
  const htmlTemplate = getHtmlTemplate(
    topic,
    `[콘텐츠가 여기에 들어갑니다]`,
    '',
    '',
    ''
  );
  const currentYear = new Date().getFullYear();

  return `
        당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.
        주제: "${topic}"
        입력 키워드: "${keyword}"
        자연스러운 키워드: "${naturalKeyword}"

        === 동적 생성된 소제목 정보 (40자 제한 적용) ===
        다음은 해당 키워드에 대한 사용자 궁금증을 기반으로 생성된 5개의 핵심 소제목들입니다 (각 40자 이내):
        ${selectedHeadings.map((h, i) => `${i + 1}. ${h.title} ${h.emoji} (${h.title.length}자) - ${h.content}`).join('\n')}
        === 동적 소제목 정보 끝 ===

        ⚠️ 절대 지켜야 할 핵심 규칙:

        **🚨 각 섹션 글자수와 가독성 - 최우선 준수 사항 🚨**
        **각 H2 섹션의 본문은 반드시 190자에서 240자 사이로 작성해야 합니다.**
        - 이 글자수 제한은 절대적이며, 240자를 초과하거나 190자 미만이 되어서는 안 됩니다
        - 각 섹션 작성 후 글자수를 카운트하여 정확히 190-240자 범위 내인지 확인하세요
        - 150자를 넘어서면 2문장의 마침표(.) 부분에서 반드시 줄바꿈
        - 줄바꿈 후에는 반드시 공백 줄 하나 추가: <p style="height: 20px;">&nbsp;</p>
        - 모든 문단은 <p> 태그로 감싸기
        - 각 <p> 태그 사이에는 공백 줄바꿈 추가

        **🚨 이미지 캡션 절대 금지 🚨**
        - 이미지 태그 아래에 절대로 캡션, 설명, 대체 텍스트를 추가하지 마세요
        - 이미지는 단독으로만 사용하고 추가 설명 없이 배치하세요

        **🚨 테이블 자동 삽입 - 스마트 배치 🚨**
        - 2-4번째 섹션 중 내용상 가장 적합한 위치에 고퀄리티 테이블 자동 삽입
        - 테이블은 단계별 정보, 비교 정보, 또는 체크리스트 형태로 구성
        - 반드시 content-table 클래스 사용
        - 테이블 내용은 주제와 직접 관련된 실용적 정보여야 함

        **🚨 FAQ 소제목 필수 추가 🚨**
        - 5번째 섹션에 반드시 "💬 자주 묻는 질문 (FAQ)" 소제목을 H3로 추가
        - FAQ 하위에 다음과 같은 실용적인 Q&A 세트 포함:
        
        Q: 가족월 건강 관리에 가장 중요한 것은 무엇인가요?
        A: 면역력 강화입니다. 충분한 수면, 균형 잡힌 영양 섭취, 규칙적인 운동을 통해 면역력을 높이는 것이 중요합니다.

        Q: 가족월 건강관을 예방하려면 어떻게 해야 하나요?
        A: 충분한 수분 섭취와 보습 관리가 중요합니다. 물을 충분히 마시고, 보습제를 사용하여 피부와 호흡기 점막을 촉촉하게 유지하세요.

        Q: 가족월 건강에 검침을 때 어떻게 대처해야 하나요?
        A: 충분한 휴식과 수분 섭취가 중요합니다. 증상이 심하거나 오래 지속되면 병원을 방문하여 진료를 받으세요.

        **🚨 주제와 내용 일치성 - 최우선 준수 사항 🚨**
        **글의 모든 내용은 반드시 주제 "${topic}"와 정확히 일치해야 합니다.**
        - 주제가 "금리인하 전망 분석"이면 금리인하에 대한 내용만 작성
        - 주제가 "투자 전략"이면 투자에 대한 내용만 작성
        - 주제가 "2025년 정부지원금"이면 해당 지원금에 대한 내용만 작성
        - 절대로 다른 주제의 내용을 억지로 끼워넣지 마세요

        **🚨 6개 H2 섹션으로 구성 🚨**
        기존 5개 섹션에 추가로 6번째 격려 섹션을 포함하여 총 6개의 섹션으로 구성됩니다.
        모든 섹션은 선택된 주제 "${topic}"에 대한 내용만 포함해야 합니다.

        **🚨 공식 사이트 자동 링크 연결 🚨**
        본문에 주제와 관련된 공식 사이트 링크를 3-5개 자연스럽게 포함해주세요.
        **반드시 다음 형식으로 작성하세요:**
        - 정부24: <a href="https://www.gov.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">정부24</a>
        - 복지로: <a href="https://www.bokjiro.go.kr" target="_blank" rel="noopener" style="color: ${colors.link}; text-decoration: underline;">복지로</a>

        다음 지침에 따라 작성해주세요:
        - 출력 형식: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요
        - 대상 독자: 한국어 사용자
        - **시의성**: 현재 년도(${currentYear}년)의 최신 상황을 자연스럽게 언급하세요
        - 문체: 친근한 구어체('~해요', '~죠' 체)를 사용하고, 격식체('~입니다', '~습니다')는 사용하지 마세요
        - 가독성: 190-240자 범위 내에서 150자마다 2-3문장 끝에서 </p> 태그로 닫고 새로운 <p> 태그로 시작하며, 각 <p> 태그 사이에는 공백 줄바꿈을 넣어주세요

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
        - **모든 내용이 주제 "${topic}"와 정확히 일치해야 합니다**
        - **각 섹션은 정확히 190자에서 240자 사이의 적절한 분량이어야 합니다**
        - **절대로 240자를 초과하거나 190자 미만이 되어서는 안 됩니다**
        - **150자 초과 시 마침표에서 줄바꿈 및 공백 줄 추가 필수**
        - **테이블은 2-4번째 섹션 중 최적 위치에 자동 배치**
        - **FAQ 소제목과 Q&A 세트 필수 포함**
        - **모든 문단은 <p> 태그로 감싸기**
        - **이미지 아래 캡션 절대 금지**
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
