
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

        **🚨 컬러테마 엄격 적용 - 최우선 준수 사항 🚨**
        **선택된 컬러테마 "${selectedColorTheme}"를 반드시 모든 스타일에 정확히 적용해야 합니다.**
        - Primary Color: ${colors.primary}
        - Secondary Color: ${colors.secondary}  
        - Text Highlight Color: ${colors.textHighlight}
        - Highlight Color: ${colors.highlight}
        - Link Color: ${colors.link}
        **모든 H2, H3 소제목도 반드시 다음 스타일을 적용하세요:**
        - H2 태그: <h2 style="color: ${colors.primary}; font-weight: bold; margin: 25px 0 15px 0; font-size: 1.5em; border-bottom: 2px solid ${colors.primary}; padding-bottom: 8px;">
        - H3 태그: <h3 style="color: ${colors.primary}; font-weight: 600; margin: 20px 0 12px 0; font-size: 1.3em;">

        **🚨 각 섹션 글자수와 가독성 - 최우선 준수 사항 🚨**
        **각 H2 섹션의 본문은 반드시 190자에서 250자 사이로 작성해야 합니다.**
        - 이 글자수 제한은 절대적이며, 250자를 초과하거나 190자 미만이 되어서는 안 됩니다
        - 각 섹션 작성 후 글자수를 카운트하여 정확히 190-250자 범위 내인지 확인하세요
        - 150자를 넘어서면 2문장의 마침표(.) 부분에서 반드시 줄바꿈
        - 줄바꿈 후에는 반드시 공백 줄 하나 추가: <p style="height: 20px;">&nbsp;</p>
        - 모든 문단은 <p> 태그로 감싸기
        - 각 <p> 태그 사이에는 공백 줄바꿈 추가

        **🚨 시각화 요약 카드 필수 삽입 - 정확한 HTML 적용 🚨**
        - 1번째 섹션 끝에 반드시 다음과 같은 시각화 요약 카드를 그대로 삽입하세요 (컬러테마 연동):
        
        <style>
        .single-summary-card-container {
            font-family: 'Noto Sans KR', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 25px 15px;
            background-color: ${colors.secondary};
            margin: 25px 0;
        }
        .single-summary-card {
            width: 100%;
            max-width: 700px;
            background-color: #ffffff;
            border-radius: 15px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            padding: 30px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid ${colors.primary};
            box-sizing: border-box;
        }
        .single-summary-card .card-header {
            display: flex;
            align-items: center;
            border-bottom: 2px solid ${colors.primary};
            padding-bottom: 15px;
            margin-bottom: 15px;
        }
        .single-summary-card .card-header-icon {
            font-size: 38px;
            color: ${colors.primary};
            margin-right: 16px;
        }
        .single-summary-card .card-header h3 {
            font-size: 28px;
            color: ${colors.primary};
            margin: 0;
            line-height: 1.3;
            font-weight: 700;
        }
        .single-summary-card .card-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            font-size: 18px;
            line-height: 1.7;
            color: #333;
        }
        .single-summary-card .card-content .section {
            margin-bottom: 12px;
            line-height: 1.7;
        }
        .single-summary-card .card-content .section:last-child {
            margin-bottom: 0;
        }
        .single-summary-card .card-content strong {
            color: ${colors.primary};
            font-weight: 600;
        }
        .single-summary-card .card-content .highlight {
            background-color: ${colors.textHighlight};
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: bold;
        }
        .single-summary-card .card-content .formula {
            background-color: ${colors.highlight};
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.95em;
            text-align: center;
            margin-top: 8px;
            color: ${colors.primary};
        }
        .single-summary-card .card-footer {
            font-size: 15px;
            color: #777;
            text-align: center;
            padding-top: 15px;
            border-top: 1px dashed ${colors.primary};
            margin-top: auto;
        }
        @media (max-width: 768px) {
            .single-summary-card-container { padding: 20px 10px; }
            .single-summary-card { padding: 22px; border-radius: 10px; }
            .single-summary-card .card-header-icon { font-size: 32px; margin-right: 12px; }
            .single-summary-card .card-header h3 { font-size: 24px; }
            .single-summary-card .card-content { font-size: 16px; line-height: 1.6; }
            .single-summary-card .card-content .section { margin-bottom: 10px; line-height: 1.6; }
            .single-summary-card .card-content .highlight { padding: 2px 5px; }
            .single-summary-card .card-content .formula { padding: 7px 10px; font-size: 0.9em; }
            .single-summary-card .card-footer { font-size: 14px; padding-top: 12px; }
        }
        @media (max-width: 480px) {
            .single-summary-card { padding: 18px; border-radius: 8px; }
            .single-summary-card .card-header-icon { font-size: 28px; margin-right: 10px; }
            .single-summary-card .card-header h3 { font-size: 20px; }
            .single-summary-card .card-content { font-size: 15px; line-height: 1.5; }
            .single-summary-card .card-content .section { margin-bottom: 8px; line-height: 1.5; }
            .single-summary-card .card-content .formula { padding: 6px 8px; font-size: 0.85em; }
            .single-summary-card .card-footer { font-size: 13px; padding-top: 10px; }
        }
        </style>
        
        <div class="single-summary-card-container">
            <div class="single-summary-card">
                <div class="card-header"><span class="card-header-icon">💡</span>
                    <h3 data-ke-size="size23">${topic} 핵심 요약</h3>
                </div>
                <div class="card-content">
                    <div class="section"><b>대상:</b> <span class="highlight">[구체적인 대상]</span></div>
                    <div class="section"><b>혜택:</b> <span class="highlight">[핵심 혜택]</span></div>
                    <div class="section"><b>신청방법:</b>
                        <div class="formula">[간단한 신청 절차]</div>
                    </div>
                    <div class="section"><b>주의사항:</b> <span class="highlight">[중요한 주의사항]</span></div>
                </div>
                <div class="card-footer">💡 더 자세한 정보는 아래 내용을 확인하세요</div>
            </div>
        </div>

        **🚨 주의사항 카드 필수 삽입 🚨**
        - 4번째 섹션 끝에 반드시 다음과 같은 주의사항 카드를 삽입하세요:
        <div style="background: linear-gradient(135deg, ${colors.warnBg}, #fff3cd); border: 2px solid ${colors.warnBorder}; padding: 20px; margin: 25px 0; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h4 style="color: ${colors.warnBorder}; font-weight: bold; margin-bottom: 15px; font-size: 1.1em;">⚠️ 주의사항</h4>
          <ul style="color: #856404; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">정확한 정보는 반드시 공식 사이트에서 확인하세요</li>
            <li style="margin-bottom: 8px;">신청 기한과 자격 요건을 미리 확인하시기 바랍니다</li>
            <li>개인정보 보호를 위해 안전한 사이트에서만 신청하세요</li>
          </ul>
        </div>

        **🚨 테이블 자동 삽입 - 스마트 배치 🚨**
        - 2-3번째 섹션 중 내용상 가장 적합한 위치에 고퀄리티 테이블 자동 삽입
        - 테이블은 단계별 정보, 비교 정보, 또는 체크리스트 형태로 구성
        - 반드시 다음과 같은 고급 스타일로 작성:
        <div style="overflow-x: auto; margin: 25px 0;">
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});">
                <th style="padding: 15px; color: white; font-weight: bold; text-align: left; border-bottom: 2px solid ${colors.primary};">항목</th>
                <th style="padding: 15px; color: white; font-weight: bold; text-align: left; border-bottom: 2px solid ${colors.primary};">내용</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px 15px; font-weight: 600; color: ${colors.primary};">[항목1]</td>
                <td style="padding: 12px 15px; color: #4a5568;">[내용1]</td>
              </tr>
              [추가 행들...]
            </tbody>
          </table>
        </div>

        **🚨 외부 참조 링크 및 문장 필수 적용 🚨**
        ${referenceLink ? `
        **참조 링크 적용**: 제공된 참조 링크 "${referenceLink}"를 글 하단에 다음 형식으로 반드시 포함하세요:
        <p style="text-align: center; margin: 30px 0; padding: 20px; background: ${colors.secondary}; border-radius: 8px;">
          <a href="${referenceLink}" target="_blank" rel="noopener" style="color: ${colors.primary}; font-weight: bold; text-decoration: underline;">📎 참조 링크: 더 자세한 정보 보기</a>
        </p>` : ''}
        
        ${referenceSentence ? `
        **참조 문장 적용**: 제공된 참조 문장 "${referenceSentence}"을 글의 맥락에 맞게 자연스럽게 포함하세요.` : ''}

        **🚨 주제와 내용 일치성 - 최우선 준수 사항 🚨**
        **글의 모든 내용은 반드시 주제 "${topic}"와 정확히 일치해야 합니다.**

        **🚨 6개 H2 섹션으로 구성 🚨**
        기존 5개 섹션에 추가로 6번째 격려 섹션을 포함하여 총 6개의 섹션으로 구성됩니다.

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
        - 가독성: 190-250자 범위 내에서 150자마다 2-3문장 끝에서 </p> 태그로 닫고 새로운 <p> 태그로 시작하며, 각 <p> 태그 사이에는 공백 줄바꿈을 넣어주세요

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
        - **각 섹션은 정확히 190자에서 250자 사이의 적절한 분량이어야 합니다**
        - **절대로 250자를 초과하거나 190자 미만이 되어서는 안 됩니다**
        - **컬러테마 "${selectedColorTheme}" 색상을 모든 요소에 정확히 적용**
        - **H2, H3 소제목에 컬러테마 스타일 필수 적용**
        - **시각화 요약 카드 정확한 HTML로 필수 포함**
        - **주의카드, 테이블 필수 포함**
        - **외부 참조 링크와 문장 필수 적용**
        - **150자 초과 시 마침표에서 줄바꿈 및 공백 줄 추가 필수**
        - **모든 문단은 <p> 태그로 감싸기**
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
