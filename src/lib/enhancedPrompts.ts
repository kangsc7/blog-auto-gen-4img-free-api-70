import { AppState } from '@/types';
import { getColors } from './promptUtils';

// Define missing interfaces and functions
interface EnhancedArticlePromptParams {
  topic: string;
  keyword: string;
  selectedColorTheme: string;
  referenceLink?: string;
  referenceSentence?: string;
  apiKey: string;
}

const PROTECTED_GUIDELINES = {
  WORD_COUNT_LIMIT: "각 H2 섹션 190-250자",
  KEYWORD_EMPHASIS: "키워드 강조 필수",
  COLOR_THEME_MANDATORY: "컬러테마 엄격 적용",
  VISUALIZATION_CARD_REQUIRED: "시각화 카드 필수",
  WARNING_CARD_REQUIRED: "주의사항 카드 필수",
  TAG_GENERATION: "태그 7개 생성",
  EXTERNAL_LINK_INTEGRATION: "외부 링크 연동",
  TOPIC_STYLE: "H3 주제 스타일",
  EMPATHY_BOX: "공감 박스 필수",
  TEXT_ALIGNMENT: "텍스트 왼쪽 정렬",
  READABILITY_RULES: "140자 이상 시 줄바꿈 규칙",
  RESPONSIVE_DESIGN: "모바일 반응형 필수"
};

const validateGuidelines = (): boolean => {
  return true; // 임시 구현
};

const extractNaturalKeyword = (topic: string): string => {
  return topic.replace(/[^\w\s가-힣]/g, '').trim();
};

const generateNaturalContext = (naturalKeyword: string, keyword: string): string => {
  return `${naturalKeyword}와 관련된 ${keyword}`;
};

// 템플릿 변수 치환 함수 추가
const replaceTemplatePlaceholders = (text: string, variables: Record<string, string>): string => {
  let result = text;
  
  // 대괄호 형태의 자리 표시자 치환
  Object.entries(variables).forEach(([key, value]) => {
    const bracketPattern = new RegExp(`\\[${key}\\]`, 'g');
    const curlyPattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(bracketPattern, value);
    result = result.replace(curlyPattern, value);
  });
  
  // 미치환된 대괄호 패턴 감지 및 fallback 처리
  const unprocessedBrackets = result.match(/\[[^\]]+\]/g);
  if (unprocessedBrackets) {
    console.warn('미치환된 템플릿 변수 발견:', unprocessedBrackets);
    
    // 일반적인 fallback 값들
    const fallbackMap: Record<string, string> = {
      '[챗봇 이름]': '파코월드',
      '[설정 단계 1]': '첫 번째 단계',
      '[설정 단계 2]': '두 번째 단계',
      '[설정 단계 3]': '세 번째 단계',
      '[퍼센트]': '80',
      '[기간]': '1개월',
      '[금액]': '적정 금액',
      '[주요 내용 요약]': '핵심 포인트를 확인하세요',
      '[실제 활용 방법]': '단계별로 진행하세요',
      '[주의할 점]': '주의사항을 꼼꼼히 확인하세요',
      '[예상되는 효과]': '긍정적인 결과를 기대할 수 있습니다',
      '[추천 대상]': '관심 있는 모든 분들께 추천합니다'
    };
    
    // fallback 값으로 치환
    Object.entries(fallbackMap).forEach(([placeholder, fallback]) => {
      result = result.replace(new RegExp(placeholder.replace(/[[\]]/g, '\\$&'), 'g'), fallback);
    });
    
    // 여전히 남은 대괄호 패턴은 제거하거나 기본값으로 치환
    result = result.replace(/\[[^\]]+\]/g, '관련 정보');
  }
  
  return result;
};

const generateDynamicHeadings = async (keyword: string, topic: string, apiKey: string) => {
  const prompt = `
당신은 블로그 콘텐츠 전문가입니다. 

주제: "${topic}"
핵심 키워드: "${keyword}"

위 키워드와 주제에 대해 사람들이 실제로 궁금해하고 검색할 만한 7개의 소제목을 생성해주세요.

**🚨 중요한 생성 규칙 🚨**
1. **기존 고정 템플릿 완전 금지**: "신청 방법", "자격 조건", "필요 서류", "기본 정보" 등 획일적인 템플릿은 절대 사용하지 마세요
2. **실제 검색 의도 반영**: 사용자가 구글에서 실제로 검색할 만한 자연스러운 질문형 또는 관심사 기반 제목
3. **검색 트렌드 고려**: 최신 검색 트렌드와 사용자 관심사를 반영한 소제목
4. **다양한 관점 제공**: 초보자, 경험자, 문제 해결, 비교 분석 등 다양한 관점의 소제목
5. **소제목 길이**: 공백 포함 40자 이내로 작성
6. **적절한 이모지**: 각 소제목에 어울리는 이모지 1개 포함
7. **대괄호 사용 금지**: [변수명] 형태의 자리 표시자는 절대 사용하지 마세요

**생성 예시** (청년 전세자금대출 주제의 경우):
❌ 잘못된 예시: "청년 전세자금대출 신청 방법", "[대출 종류] 자격 조건"
✅ 올바른 예시: "신용등급 낮아도 전세자금대출 가능할까?", "보증금 없이도 전세 계약이 가능한 방법"

**출력 형식:**
각 줄마다 다음 형식으로 출력해주세요:
제목|이모지|간단설명

지금 즉시 위 지침에 따라 7개의 창의적이고 검색 친화적인 소제목을 생성해주세요:
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('소제목 생성 API 요청 실패');
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('소제목 생성 응답이 비어있습니다');
    }

    const lines = generatedText.split('\n').filter(line => line.trim() && line.includes('|'));
    
    // 기존 템플릿 키워드가 포함된 소제목 필터링 및 40자 제한
    const filteredLines = lines.filter(line => {
      const title = line.split('|')[0]?.toLowerCase() || '';
      const titleLength = line.split('|')[0]?.trim().length || 0;
      
      // 기존 템플릿 키워드 및 대괄호 패턴 필터링
      const bannedKeywords = ['신청 방법', '자격 조건', '필요 서류', '기본 정보', '지원 대상', '혜택 내용'];
      const hasBannedKeyword = bannedKeywords.some(keyword => title.includes(keyword));
      const hasBrackets = title.includes('[') && title.includes(']');
      
      return !hasBannedKeyword && !hasBrackets && titleLength <= 40;
    });
    
    const headings = filteredLines.slice(0, 7).map(line => {
      const parts = line.split('|');
      let title = parts[0]?.trim() || `${keyword} 관련 정보`;
      
      // 제목이 40자를 초과하면 자르기
      if (title.length > 40) {
        title = title.substring(0, 37) + '...';
      }
      
      return {
        title,
        emoji: parts[1]?.trim() || '💡',
        content: parts[2]?.trim() || '관련 정보를 제공합니다'
      };
    });

    // 7개가 안 되면 창의적인 기본 소제목으로 채우기
    const creativeDefaultHeadings = [
      { title: `${keyword} 시작하기 전 꼭 알아야 할 점`, emoji: '💡', content: '기초 지식을 제공합니다' },
      { title: `전문가가 추천하는 ${keyword} 활용법`, emoji: '👨‍💼', content: '전문가 팁을 공유합니다' },
      { title: `${keyword} 실패 사례와 해결책`, emoji: '⚠️', content: '실패를 예방하는 방법을 알려드립니다' },
      { title: `${keyword} 최신 트렌드 분석`, emoji: '📈', content: '최근 동향을 분석합니다' },
      { title: `${keyword} 비용 절약하는 꿀팁`, emoji: '💰', content: '경제적인 활용법을 제공합니다' },
      { title: `${keyword} 실제 후기와 평가`, emoji: '📝', content: '실사용자 후기를 공유합니다' },
      { title: `${keyword} 향후 전망과 발전 방향`, emoji: '🔮', content: '미래 전망을 분석합니다' }
    ];
    
    while (headings.length < 7) {
      const missingIndex = headings.length;
      if (missingIndex < creativeDefaultHeadings.length) {
        let defaultTitle = creativeDefaultHeadings[missingIndex].title;
        // 기본 제목도 40자 제한 적용
        if (defaultTitle.length > 40) {
          defaultTitle = defaultTitle.substring(0, 37) + '...';
        }
        headings.push({
          ...creativeDefaultHeadings[missingIndex],
          title: defaultTitle
        });
      } else {
        break;
      }
    }

    return headings;
  } catch (error) {
    console.error('동적 소제목 생성 오류:', error);
    
    // 오류 시 창의적인 기본 소제목 반환
    const fallbackHeadings = [
      { title: `${keyword} 시작하기 전 준비사항`, emoji: '🚀', content: '시작 전 알아야 할 정보를 제공합니다' },
      { title: `${keyword} 선택할 때 고려사항`, emoji: '🤔', content: '올바른 선택을 위한 가이드입니다' },
      { title: `${keyword} 실제 사용 후기 분석`, emoji: '📊', content: '실사용자 경험을 분석합니다' },
      { title: `${keyword} 문제 발생 시 해결법`, emoji: '🔧', content: '문제 해결 방법을 제시합니다' },
      { title: `${keyword} 효과적인 활용 전략`, emoji: '💪', content: '효과를 극대화하는 방법입니다' },
      { title: `${keyword} 최신 업데이트 소식`, emoji: '📰', content: '최근 변화와 소식을 전달합니다' },
      { title: `${keyword} 향후 계획과 준비`, emoji: '📅', content: '미래를 위한 준비 방법입니다' }
    ].map(heading => ({
      ...heading,
      title: heading.title.length > 40 ? heading.title.substring(0, 37) + '...' : heading.title
    }));

    return fallbackHeadings;
  }
};

// 주제별 동적 주의사항 생성 함수
const generateTopicSpecificWarning = async (topic: string, keyword: string, apiKey: string): Promise<string[]> => {
  const prompt = `
주제: "${topic}"
키워드: "${keyword}"

위 주제에 특화된 실제적이고 구체적인 주의사항 3개를 생성해주세요.

**생성 규칙:**
1. 해당 주제와 직접 관련된 실용적인 주의사항만 작성
2. "공식 사이트 확인", "개인차 있음" 등 일반적인 내용 금지
3. 건강, 안전, 시간, 비용, 방법 등 구체적인 주의점 위주
4. 각 항목은 한 줄로 간결하게 작성
5. 실제 경험자가 알려주는 팁 형태로 작성

**출력 형식:**
각 줄마다 주의사항 하나씩만 출력 (번호나 불릿 없이)

**예시 (폭염 관련 주제인 경우):**
오전 11시부터 오후 3시까지는 실외 활동을 피하세요
30분마다 물 한 컵씩 마시고 땀으로 손실된 전해질을 보충하세요
에어컨 온도는 실외와 5도 이상 차이나지 않게 설정하세요

지금 즉시 위 주제에 맞는 구체적인 주의사항 3개를 생성해주세요:
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('주의사항 생성 API 요청 실패');
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('주의사항 생성 응답이 비어있습니다');
    }

    const warnings = generatedText.split('\n')
      .filter(line => line.trim() && !line.match(/^\d+\./) && !line.startsWith('-') && !line.startsWith('*'))
      .slice(0, 3);

    if (warnings.length < 3) {
      // 기본 주의사항으로 채우기
      const defaultWarnings = [
        `${keyword} 사용 전 충분한 정보를 수집하세요`,
        `개인의 상황에 맞는 방법을 선택하시기 바랍니다`,
        `전문가와 상담 후 진행하는 것을 추천합니다`
      ];
      
      while (warnings.length < 3 && warnings.length < defaultWarnings.length) {
        warnings.push(defaultWarnings[warnings.length]);
      }
    }

    return warnings;
  } catch (error) {
    console.error('주제별 주의사항 생성 오류:', error);
    
    // 오류 시 기본 주의사항 반환
    return [
      `${keyword} 관련 최신 정보를 확인하시기 바랍니다`,
      `개인의 상황에 따라 결과가 다를 수 있습니다`,
      `전문가의 조언을 구하는 것을 권장합니다`
    ];
  }
};

const getHtmlTemplate = (topic: string, content: string, ...args: string[]): string => {
  return `
<h3 style="color: #1a73e8; font-weight: bold; margin: 25px 0 20px 0; font-size: 1.8em; text-align: center; padding-bottom: 12px;">${topic}</h3>

<p style="height: 10px;">&nbsp;</p>

${content}
`;
};

const getRandomColorTheme = (): string => {
  const themes = ['blue-gray', 'green-orange', 'purple-yellow', 'teal-light-gray', 'classic-blue'];
  return themes[Math.floor(Math.random() * themes.length)];
};

export const createBlogPrompt = (
  appState: AppState,
  websiteContent?: string
): string => {
  const selectedTheme = appState.colorTheme || getRandomColorTheme();
  const colors = getColors(selectedTheme);

  const basePrompt = `
다음 요구사항에 따라 SEO 최적화된 블로그 글을 작성해주세요:

**주제**: ${appState.selectedTopic}
**키워드**: ${appState.keyword || '없음'}
**컬러 테마**: ${selectedTheme} (메인: ${colors.primary}, 보조: ${colors.secondary})

**블로그 글 작성 지침**:
1. 글 제목을 H3 태그로 작성 (이 제목은 화면에서 H4로 스타일 적용됨)
2. 주제를 나타내는 시각적 요약 카드 추가 (동적 색상 적용)
3. 시각화 요약카드 다음 줄에 공백 한줄 추가
4. 외부 링크 HTML 코드 추가:
<p style="text-align: center; font-size: 18px; margin-bottom: 30px;" data-ke-size="size16"><b>이 글과 관련된 다른 정보가 궁금하다면?</b><br />👉 <a style="color: #1a73e8; text-decoration: underline; font-weight: bold;" href="${appState.referenceLink || 'https://worldpis.com'}" target="_blank" rel="noopener"><b>${appState.referenceSentence || '워드프레스 꿀팁 더 보러가기'}</b></a></p>
5. 실용적이고 구체적인 내용으로 구성
6. 각 섹션별로 190-250자 내외로 작성
7. 픽사베이 이미지 3-4개를 적절히 배치 (관련 키워드로)
8. 글 하단에 관련 태그 5-7개를 중앙 정렬로 배치

**시각적 요약 카드 스타일**:
- 배경색: ${colors.secondary}
- 테두리색: ${colors.primary}
- 텍스트색: ${colors.primary}
- 글꼴: 굵게, 중앙 정렬
- 여백: 상하 20px

**구조**:
1. H3 제목
2. 시각적 요약 카드
3. 외부 링크 HTML
4. 도입부 (문제 제기 또는 흥미 유발)
5. 핵심 내용 3-4개 섹션 (각각 소제목과 상세 설명)
6. 픽사베이 이미지 포함
7. 실용적인 팁 또는 결론
8. 관련 태그

${websiteContent ? `\n**참고 자료**:\n${websiteContent.substring(0, 1000)}...` : ''}

**중요**: 모든 HTML은 완성된 형태로 제공하고, 픽사베이 이미지는 실제 검색 가능한 키워드를 사용하여 요청하세요.
`;

  return basePrompt;
};

export const getEnhancedArticlePrompt = async ({
  topic,
  keyword,
  selectedColorTheme,
  referenceLink,
  referenceSentence,
  apiKey,
}: EnhancedArticlePromptParams): Promise<string> => {
  
  // 지침 무결성 검증 - 필수
  if (!validateGuidelines()) {
    console.error('🚨 블로그 글 지침 무결성 검증 실패! 복구 시도 중...');
    // 여기서 복구 로직 실행 가능
  }
  
  const colors = getColors(selectedColorTheme);
  const refLink = referenceLink || 'https://worldpis.com';
  const refText = referenceSentence || '👉 워드프레스 꿀팁 더 보러가기';
  
  const naturalKeyword = extractNaturalKeyword(topic);
  const contextualTerms = generateNaturalContext(naturalKeyword, keyword);
  
  // 🎨 창의적 변주를 위한 랜덤 요소들
  const selectedPerspective = getRandomPerspective();
  const selectedWritingStyle = getRandomWritingStyle();
  const alternativeExpression = generateAlternativeExpressions(keyword);
  const variedExamples = generateVariedExamples(topic, keyword);
  
  console.log('🎭 선택된 글쓰기 관점:', selectedPerspective.name);
  console.log('✍️ 선택된 문체:', selectedWritingStyle.name);
  console.log('📝 대체 표현:', alternativeExpression);
  console.log('💡 예시 유형:', variedExamples.type);
  
  console.log('동적 소제목 생성 시작 (창의적 방식):', keyword, topic);
  const dynamicHeadings = await generateDynamicHeadings(keyword, topic, apiKey);
  console.log('생성된 창의적 동적 소제목:', dynamicHeadings.map(h => `${h.title} (${h.title.length}자)`));
  
  // 주제별 동적 주의사항 생성
  console.log('주제별 동적 주의사항 생성 시작:', topic, keyword);
  const topicWarnings = await generateTopicSpecificWarning(topic, keyword, apiKey);
  console.log('생성된 주제별 주의사항:', topicWarnings);
  
  const selectedHeadings = dynamicHeadings.slice(0, 5);
  
  const htmlTemplate = getHtmlTemplate(
    topic,
    `[콘텐츠가 여기에 들어갑니다]`,
    '',
    '',
    ''
  );
  const currentYear = new Date().getFullYear();

  // 템플릿 변수 정의
  const templateVariables = {
    '챗봇 이름': '파코월드',
    '설정 단계 1': '첫 번째 단계',
    '설정 단계 2': '두 번째 단계', 
    '설정 단계 3': '세 번째 단계',
    '퍼센트': '80',
    '기간': '1개월',
    '금액': '적정 금액',
    '주요 내용 요약': `${keyword}의 핵심 포인트를 확인하세요`,
    '실제 활용 방법': `${keyword}을 단계별로 진행하세요`,
    '주의할 점': `${keyword} 사용 시 주의사항을 꼼꼼히 확인하세요`,
    '예상되는 효과': `${keyword}을 통해 긍정적인 결과를 기대할 수 있습니다`,
    '추천 대상': `${keyword}에 관심 있는 모든 분들께 추천합니다`
  };

  // 🛡️ 절대 삭제/변경 금지 구역 시작
  const basePrompt = `
당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.
주제: "${topic}"
입력 키워드: "${keyword}"
자연스러운 키워드: "${naturalKeyword}"

=== 🎭 창의적 글쓰기 변주 시스템 - 최우선 적용 ===
**선택된 글쓰기 관점**: ${selectedPerspective.name}
- 설명: ${selectedPerspective.description}
- 스타일: ${selectedPerspective.style}

**선택된 문체**: ${selectedWritingStyle.name} (${selectedWritingStyle.pattern})

**예시 접근법**: ${variedExamples.type} 위주로 구성
- 가능한 예시: ${variedExamples.examples.join(', ')}

**🚨 창의적 변주 필수 규칙 🚨**
1. **70% 이상 문장 구조 변경**: 기존과 완전히 다른 문장 구조, 접속어, 표현 방식 사용
2. **관점 변화**: ${selectedPerspective.name} 관점으로 전체 글 구성
3. **문체 일관성**: ${selectedWritingStyle.name} 스타일로 통일
4. **예시 다양화**: ${variedExamples.type} 중심의 새로운 사례와 비유 사용
5. **구조적 변주**: 소제목 순서와 강조점을 기존과 다르게 배치
6. **표현 창의성**: "${alternativeExpression}" 같은 새로운 표현 방식 적극 활용

=== 🛡️ 절대 변경 금지 지침 - 방어 시스템 활성화 ===
다음 지침들은 절대로 삭제, 변경, 누락되어서는 안 됩니다:
- 글자수 제한: ${PROTECTED_GUIDELINES.WORD_COUNT_LIMIT}
- 키워드 강조: ${PROTECTED_GUIDELINES.KEYWORD_EMPHASIS}
- 컬러테마: ${PROTECTED_GUIDELINES.COLOR_THEME_MANDATORY}
- 시각화 카드: ${PROTECTED_GUIDELINES.VISUALIZATION_CARD_REQUIRED}
- 주의사항 카드: ${PROTECTED_GUIDELINES.WARNING_CARD_REQUIRED}
- 태그 생성: ${PROTECTED_GUIDELINES.TAG_GENERATION}
- 외부 링크: ${PROTECTED_GUIDELINES.EXTERNAL_LINK_INTEGRATION}
- 주제 스타일: ${PROTECTED_GUIDELINES.TOPIC_STYLE}
- 공감 박스: ${PROTECTED_GUIDELINES.EMPATHY_BOX}
- 텍스트 정렬: ${PROTECTED_GUIDELINES.TEXT_ALIGNMENT}
- 가독성 규칙: ${PROTECTED_GUIDELINES.READABILITY_RULES}
- 반응형 디자인: ${PROTECTED_GUIDELINES.RESPONSIVE_DESIGN}
=== 🛡️ 방어 시스템 종료 ===

=== 🚨 최우선 핵심 규칙 - 반드시 준수 🚨 ===

**1️⃣ 텍스트 정렬 및 구조 (최우선 적용)**
- **모든 소제목(H2, H3)과 본문 텍스트는 반드시 왼쪽 정렬(text-align: left)로 설정**
- **H2 태그**: style="color: ${colors.primary}; font-weight: bold; margin: 25px 0 15px 0; font-size: 1.5em; border-bottom: 2px solid ${colors.primary}; padding-bottom: 8px; text-align: left;"
- **H3 태그**: style="color: ${colors.primary}; font-weight: 600; margin: 20px 0 12px 0; font-size: 1.3em; text-align: left;"
- **모든 본문 문단**: style="text-align: left; line-height: 1.7; font-size: 18px; margin-bottom: 18px;"

**2️⃣ 가독성 향상 규칙 (강제 적용)**
- **140자 이상 연속 문장 시**: 두 번째 마침표(.) 뒤에서 반드시 </p> 태그 닫고 공백 줄바꿈 추가 후 새로운 <p> 태그 시작
- **모든 문단은 <p> 태그로 래핑**: <p style="text-align: left; line-height: 1.7; font-size: 18px; margin-bottom: 18px;">
- **4-5줄 이상 연속 시**: 중간에 시각적 단락 구분 추가

**3️⃣ 섹션별 글자수 제한 (엄격 준수)**
- **각 H2 섹션 본문: 정확히 190-250자 범위 내**
- **250자 초과 금지, 190자 미만 금지**
- **글자수 카운트 후 범위 확인 필수**

**4️⃣ 반응형 디자인 (모바일 최적화)**
- **데스크탑**: font-size: 18px, line-height: 1.7
- **모바일 대응**: max-width: 680px, padding: 16px
- **모든 요소에 반응형 스타일 적용**

=== 🚨 템플릿 변수 사용 금지 경고 🚨 ===
**절대로 대괄호 형태의 자리 표시자를 사용하지 마세요:**
❌ 금지: [챗봇 이름], [설정 단계 1], [퍼센트]%, [주요 내용 요약] 등
✅ 사용: 구체적이고 완성된 텍스트만 사용하세요

**모든 내용은 완성된 형태로 작성해야 합니다:**
- "파코월드가 도움을 드릴게요" (O)
- "[챗봇 이름]가 도움을 드릴게요" (X)
- "첫 번째 단계에서 확인하세요" (O)  
- "[설정 단계 1]에서 확인하세요" (X)
=== 🚨 템플릿 변수 금지 경고 종료 🚨 ===

=== 동적 생성된 소제목 정보 (창의적 검색 기반 40자 제한) ===
다음은 해당 키워드에 대한 실제 사용자 검색 의도를 기반으로 생성된 5개의 창의적 소제목들입니다:
${selectedHeadings.map((h, i) => `${i + 1}. ${h.title} ${h.emoji} (${h.title.length}자) - ${h.content}`).join('\n')}
=== 동적 소제목 정보 끝 ===

=== 주제별 동적 주의사항 (${topic} 특화) ===
다음은 해당 주제에 특화된 실제적인 주의사항들입니다:
${topicWarnings.map((warning, i) => `${i + 1}. ${warning}`).join('\n')}
=== 주제별 주의사항 끝 ===

⚠️ 절대 지켜야 할 핵심 규칙:

**🚨 블로그 글 구조 - 최우선 준수 사항 🚨**

1. **주제 제목** (글 시작 부분에 반드시 포함):
<h3 style="color: ${colors.primary}; font-weight: bold; margin: 25px 0 20px 0; font-size: 1.8em; text-align: center; padding-bottom: 12px;">${topic}</h3>

2. **간단한 공감 박스** (주제 제목 바로 다음에 반드시 포함 - 테두리 제거):
<div style="background: linear-gradient(135deg, ${colors.highlight} 0%, #ffffff 100%); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
  <p style="color: #333; line-height: 1.6; font-size: 16px; margin: 0;">
    ${selectedPerspective.name} 관점에서 접근하여, ${naturalKeyword}에 대해 ${selectedWritingStyle.name}로 자세히 알아보겠어요. 
    많은 분들이 궁금해하시는 내용을 ${variedExamples.type}를 통해 쉽게 설명드릴게요.
  </p>
</div>

3. **공감 후킹 문단** (공감 박스 바로 다음):
${selectedPerspective.name} 관점에서 ${selectedWritingStyle.pattern} 톤으로 독자의 공감을 이끌어내는 친근한 문장으로 시작

**🚨 글자수 제한 - 절대 준수 사항 🚨**
**각 H2 섹션의 본문은 반드시 공백 포함 190자에서 250자 사이로 작성해야 합니다.**
- 이 글자수 제한은 절대적이며, 250자를 초과하거나 190자 미만이 되어서는 안 됩니다
- **140자를 초과하면 두 번째 문장의 마침표(.) 부분에서 반드시 줄바꿈을 하고 공백 줄 하나를 추가하세요**
- **모든 문단은 반드시 <p> 태그로 감싸서 작성하세요**
- **각 <p> 태그 사이에는 공백 줄바꿈을 추가하여 가독성을 높이세요**
- 섹션 작성 후 반드시 공백 포함 글자수를 카운트하여 190-250자 범위 내인지 확인하세요

**🚨 각 H2 섹션별 핵심 키워드 강조 - 필수 적용 🚨**
**모든 H2 소제목 아래 본문에서 핵심 키워드 '${keyword}'는 문맥에 맞게 자연스럽게 사용하되, 정확히 1번만 <strong>${keyword}</strong> 와 같이 <strong> 태그로 강조해주세요.**
- 이 규칙은 모든 H2 섹션에 예외 없이 엄격하게 적용됩니다
- 각 섹션당 정확히 1개의 키워드만 강조하세요
- 키워드 강조는 문맥상 자연스러운 위치에 배치하세요

**예시 구조:**
<p style="text-align: left; line-height: 1.7; font-size: 18px; margin-bottom: 18px;">${selectedWritingStyle.name} 스타일로 첫 번째 문장과 두 번째 문장입니다. (140자 기준 체크 - 여기서 줄바꿈)</p>

<p style="height: 20px;">&nbsp;</p>

<p style="text-align: left; line-height: 1.7; font-size: 18px; margin-bottom: 18px;">세 번째 문장과 <strong>${keyword}</strong>을(를) 포함한 네 번째 문장입니다.</p>

**🚨 PC와 모바일 SEO 가독성 최적화 🚨**
- **문장 길이**: 각 문장은 25-35자 이내로 제한
- **문단 구조**: 최대 3문장으로 구성, 필요시 별도 문단으로 분리
- **키워드 밀도**: 자연스럽게 1.5-2.5% 유지
- **내부 링크**: 주제와 관련이 있는 경우에만 포함 (억지로 넣지 말 것)
- **모바일 최적화**: 짧은 문장, 명확한 구조, 충분한 여백
- **스캔 가능성**: 중요 정보는 굵게 표시, 리스트 활용

**🚨 컬러테마 엄격 적용 - 최우선 준수 사항 🚨**
**선택된 컬러테마 "${selectedColorTheme}"를 반드시 모든 스타일에 정확히 적용해야 합니다.**
- Primary Color: ${colors.primary}
- Secondary Color: ${colors.secondary}  
- Text Highlight Color: ${colors.textHighlight}
- Highlight Color: ${colors.highlight}
- Link Color: ${colors.link}
**모든 H2, H3 소제목도 반드시 다음 스타일을 적용하세요 (번호 없이):**
- H2 태그: <h2 style="color: ${colors.primary}; font-weight: bold; margin: 25px 0 15px 0; font-size: 1.5em; border-bottom: 2px solid ${colors.primary}; padding-bottom: 8px; text-align: left;">
- H3 태그: <h3 style="color: ${colors.primary}; font-weight: 600; margin: 20px 0 12px 0; font-size: 1.3em; text-align: left;">

**🚨 티스토리 호환 시각화 요약 카드 필수 삽입 🚨**
- 6번째 섹션의 내용 끝에 반드시 다음과 같은 시각화 요약 카드를 그대로 삽입하세요:
- ⚠️ **티스토리 호환성**: script 태그나 복잡한 JavaScript 사용 금지, 인라인 스타일만 사용

<div style="font-family: 'Noto Sans KR', sans-serif; display: flex; justify-content: center; align-items: center; padding: 25px 15px; background-color: ${colors.secondary}; margin: 25px 0;">
    <div style="width: 100%; max-width: 700px; background-color: #ffffff; border-radius: 15px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); padding: 30px; display: flex; flex-direction: column; overflow: hidden; border: 3px solid ${colors.primary}; box-sizing: border-box;">
        <div style="display: flex; align-items: center; border-bottom: 2px solid ${colors.primary}; padding-bottom: 15px; margin-bottom: 15px;">
            <span style="font-size: 38px; color: ${colors.primary}; margin-right: 16px;">💡</span>
            <h3 style="font-size: 28px; color: ${colors.primary}; margin: 0; line-height: 1.3; font-weight: 700; background: linear-gradient(45deg, ${colors.textHighlight}, ${colors.secondary}); padding: 8px 16px; border-radius: 15px; border: 1px solid ${colors.primary};">${topic} 핵심 요약</h3>
        </div>
        <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: flex-start; font-size: 18px; line-height: 1.7; color: #333;">
            <div style="margin-bottom: 12px; line-height: 1.7;"><strong style="color: ${colors.primary}; font-weight: 600;">핵심 포인트:</strong> <span style="background-color: ${colors.textHighlight}; padding: 3px 8px; border-radius: 4px; font-weight: bold; color: ${colors.primary};">${keyword}의 핵심 포인트를 확인하세요</span></div>
            <div style="margin-bottom: 12px; line-height: 1.7;"><strong style="color: ${colors.primary}; font-weight: 600;">활용 방법:</strong> <span style="background-color: ${colors.textHighlight}; padding: 3px 8px; border-radius: 4px; font-weight: bold; color: ${colors.primary};">${keyword}을 단계별로 진행하세요</span></div>
            <div style="margin-bottom: 12px; line-height: 1.7;"><strong style="color: ${colors.primary}; font-weight: 600;">주의사항:</strong> <span style="background-color: ${colors.textHighlight}; padding: 3px 8px; border-radius: 4px; font-weight: bold; color: ${colors.primary};">${keyword} 사용 시 주의사항을 꼼꼼히 확인하세요</span></div>
            <div style="margin-bottom: 12px; line-height: 1.7;"><strong style="color: ${colors.primary}; font-weight: 600;">기대 효과:</strong> <span style="background-color: ${colors.textHighlight}; padding: 3px 8px; border-radius: 4px; font-weight: bold; color: ${colors.primary};">${keyword}을 통해 긍정적인 결과를 기대할 수 있습니다</span></div>
            <div style="margin-bottom: 0; line-height: 1.7;"><strong style="color: ${colors.primary}; font-weight: 600;">추천 대상:</strong> <span style="background-color: ${colors.textHighlight}; padding: 3px 8px; border-radius: 4px; font-weight: bold; color: ${colors.primary};">${keyword}에 관심 있는 모든 분들께 추천합니다</span></div>
        </div>
        <div style="font-size: 15px; color: #777; text-align: center; padding-top: 15px; border-top: 1px dashed ${colors.primary}; margin-top: auto;">💡 성공적인 활용을 위한 필수 체크리스트!</div>
    </div>
</div>

**🚨 외부 참조 링크 스타일 적용 🚨**
${referenceLink ? `
- 글 하단에 다음과 같은 스타일로 참조 링크를 포함하고 바로 아래에 태그 7개를 추가하세요:

<p style="text-align: center; font-size: 18px; margin-bottom: 30px;" data-ke-size="size16">
  <b>이 글과 관련된 다른 정보가 궁금하다면?</b><br />
  <a style="color: #009688; text-decoration: underline; font-weight: bold;" href="${referenceLink}" target="_blank" rel="noopener">
    <b>${refText}</b>
  </a>
</p>

<p style="height: 40px;">&nbsp;</p>

<p style="height: 20px;">&nbsp;</p>

<p style="text-align: center; font-size: 16px; color: #666; line-height: 1.8;">
[각 소제목의 핵심 키워드 기반 태그 7개를 여기에 쉼표로 구분하여 배치]
</p>` : ''}

**🚨 주제별 동적 주의사항 카드 필수 삽입 (컬러테마 연동된 배경과 진한 테두리) 🚨**
- 4번째 섹션의 내용 끝에 반드시 다음과 같은 주제별 주의사항 카드를 삽입하세요:
<div style="background: linear-gradient(135deg, ${colors.secondary}, ${colors.highlight}); border: 3px solid ${colors.primary}; padding: 20px; margin: 25px 0; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
  <h4 style="color: ${colors.primary}; font-weight: bold; margin-bottom: 15px; font-size: 1.1em;">⚠️ 주의사항</h4>
  <ul style="color: ${colors.primary}; line-height: 1.6; margin: 0; padding-left: 20px;">
    <li style="margin-bottom: 8px;">${topicWarnings[0] || '정확한 정보는 반드시 공식 사이트에서 확인하세요'}</li>
    <li style="margin-bottom: 8px;">${topicWarnings[1] || '개인의 상황에 따라 결과가 다를 수 있습니다'}</li>
    <li>${topicWarnings[2] || '최신 정보와 변경사항을 주기적으로 확인하시기 바랍니다'}</li>
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
        <td style="padding: 12px 15px; font-weight: 600; color: ${colors.primary};">주요 항목</td>
        <td style="padding: 12px 15px; color: #4a5568;">상세 내용</td>
      </tr>
      [추가 행들...]
    </tbody>
  </table>
</div>

**🚨 외부 참조 링크 및 문장 필수 적용 🚨**
${referenceSentence ? `
**참조 문장 적용**: 제공된 참조 문장 "${referenceSentence}"을 글의 맥락에 맞게 자연스럽게 포함하세요.` : ''}

**🚨 주제와 내용 일치성 - 최우선 준수 사항 🚨**
**글의 모든 내용은 반드시 주제 "${topic}"와 정확히 일치해야 합니다.**

**🚨 6개 H2 섹션으로 구성 (번호 넘버링 금지) 🚨**
기존 5개 섹션에 추가로 6번째 격려 섹션을 포함하여 총 6개의 섹션으로 구성됩니다.
**모든 H2 소제목에는 절대로 번호(1., 2., 3. 등)를 넣지 마세요.**

**🚨 공식 사이트 자동 링크 연결 - 주제 관련성 우선 🚨**
**주제와 실제로 관련이 있는 경우에만** 공식 사이트 링크를 자연스럽게 포함해주세요.
**억지로 링크를 넣지 말세요. 도움이 되는 경우에만 사용하세요.**

**🚨 각 소제목별 핵심 키워드 기반 태그 생성 - 짧은 키워드만 🚨**
생성된 5개의 동적 소제목에서 각각 핵심 키워드를 추출하여 7개의 **짧은** 태그를 만들어주세요:
- 동적 소제목들: ${selectedHeadings.map(h => h.title).join(', ')}
- **긴 주제 문장은 태그에 포함하지 마세요**
- **단어 단위의 짧고 실용적인 키워드만 태그로 사용하세요**
- 예시: "${naturalKeyword}, 활용법, 주의사항, 효과, 방법, 팁, 가이드" 형태로 7개 태그 생성

다음 지침에 따라 작성해주세요:
- 출력 형식: 반드시 HTML 코드 블록 하나로만 결과를 제공해주세요
- 대상 독자: 한국어 사용자
- **시의성**: 현재 년도(${currentYear}년)의 최신 상황을 자연스럽게 언급하세요
- 문체: ${selectedWritingStyle.name} (${selectedWritingStyle.pattern})를 일관되게 사용하세요
- **관점**: ${selectedPerspective.name} 관점으로 전체 글을 구성하세요
- **가독성 최우선**: 공백 포함 190-250자 범위 내에서 140자 도달 시 두 번째 문장 마침표에서 </p> 태그로 닫고 공백 줄바꿈 추가 후 새로운 <p> 태그로 시작
- **창의성**: 기존과 70% 이상 다른 문장 구조와 표현 방식 사용
- **예시 활용**: ${variedExamples.type} 중심의 사례 포함

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
- Reference Text: ${refText}
- Topic: ${topic}
- Original Keyword: ${keyword}
- Natural Keyword: ${naturalKeyword}

아래는 반드시 따라야 할 HTML 템플릿입니다 (6개 창의적 동적 소제목 포함).

--- HTML TEMPLATE START ---
${htmlTemplate}
--- HTML TEMPLATE END ---

⚠️ 재확인 사항:
- **모든 내용이 주제 "${topic}"와 정확히 일치해야 합니다**
- **각 섹션은 정확히 공백 포함 190자에서 250자 사이의 적절한 분량이어야 합니다**
- **절대로 250자를 초과하거나 190자 미만이 되어서는 안 됩니다**
- **140자 도달 시 두 번째 문장 마침표에서 반드시 줄바꿈 및 공백 줄 추가**
- **모든 문단은 <p> 태그로 감싸고 각 <p> 태그 사이에 공백 줄바꿈 추가**
- **모든 소제목과 본문 텍스트는 반드시 왼쪽 정렬(text-align: left) 적용**
- **컬러테마 "${selectedColorTheme}" 색상을 모든 요소에 정확히 적용**
- **H2, H3 소제목에 컬러테마 스타일 필수 적용 (번호 넘버링 절대 금지)**
- **각 H2 섹션별로 핵심 키워드 '${keyword}'를 <strong> 태그로 정확히 1번만 강조**
- **티스토리 호환 시각화 요약 카드 정확한 HTML로 필수 포함 (script 태그 금지)**
- **주제별 동적 주의사항 카드, 테이블 필수 포함 (컬러테마 연동된 배경과 진한 테두리)**
- **외부 참조 링크는 도움이 되는 경우에만 적용: 가운데 정렬, 태그 위에 배치**
- **주제는 H3로 글 상단에, 간단한 공감 박스 포함 (테두리 제거)**
- **주의사항 카드는 4번째 섹션 끝에 배치 (주제별 동적 내용으로 구성)**
- **시각화 요약 카드는 6번째 섹션 끝에 배치**
- **참조 링크 스타일: 사용자가 제공한 정확한 HTML 스타일 적용**
- **태그는 짧은 키워드만 쉼표로 구분하여 "태그:" 같은 텍스트 없이 배치**
- **대괄호 형태의 자리 표시자는 절대 사용하지 마세요**
- **반응형 디자인: font-size: 18px, line-height: 1.7, max-width: 680px 모바일 대응**

🛡️ **지침 방어 시스템 최종 확인**: 이 모든 규칙들은 절대로 삭제, 변경, 누락되어서는 안 됩니다.
  `;

  // 최종 프롬프트에서 템플릿 변수 치환
  return replaceTemplatePlaceholders(basePrompt, templateVariables);
};

export const getEnhancedTopicPrompt = (keyword: string, count: number): string => {
  const currentYear = new Date().getFullYear();
  
  const yearMatch = keyword.match(/(\d{4})년?/);
  const hasYearInKeyword = yearMatch !== null;
  const extractedYear = yearMatch ? yearMatch[1] : null;
  
  if (hasYearInKeyword && extractedYear) {
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
    return `'${keyword}'를(을) 주제로 블로그 포스팅 제목 ${count}개를 생성해 주세요.

**일반 키워드 생성 지침**:

키워드에 년도가 포함되어 있지 않으므로, 자연스러운 블로그 제목을 생성해주세요.

**생성 원칙**:
1. **키워드 포함**: '${keyword}' 관련 내용이 반드시 포함되어야 합니다
2. **실용성**: 독자에게 도움이 되는 실용적인 정보 제목
3. **SEO 최적화**: 검색에 최적화
