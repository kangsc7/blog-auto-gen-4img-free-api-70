
import { SYSTEM_PROMPTS } from './systemPrompts';

export const generateEnhancedBlogContent = async (
  topic: string,
  keyword: string,
  apiKey: string,
  referenceLink?: string,
  referenceSentence?: string
): Promise<string> => {
  
  const prompt = `다음 주제로 한국어 블로그 글을 작성해주세요: "${topic}"

핵심 키워드: "${keyword}"

다음 구조와 지침을 반드시 준수해주세요:

**구조 및 지침:**

1. **도입부 (120-150자 제한)**
   - 독자의 관심을 끌 수 있는 흥미로운 질문이나 통계로 시작
   - 본문에서 다룰 핵심 내용 간략 예고

2. **H2 소제목 7개 구성 (각 400-500자)**
   - 각 H2는 서로 다른 관점이나 단계별 접근
   - 실용적이고 구체적인 정보 위주

3. **시각화 요약 카드 (7번째 H2 바로 위에 배치)**
   - 다음 HTML 구조 사용:

<style>
  .single-summary-card-container {
    font-family: 'Noto Sans KR', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 25px 15px;
    background-color: #fdf6ff;
    margin: 25px 0;
  }

  .single-summary-card {
    width: 100%;
    max-width: 700px;
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    padding: 30px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 3px solid #a965e5;
    box-sizing: border-box;
  }

  .card-header {
    display: flex;
    align-items: center;
    border-bottom: 2px solid #a965e5;
    padding-bottom: 15px;
    margin-bottom: 15px;
  }

  .card-header-icon {
    font-size: 32px;
    color: #a965e5;
    margin-right: 16px;
  }

  .card-header h3 {
    font-size: 22px;
    color: #a965e5;
    margin: 0;
    line-height: 1.4;
    font-weight: 700;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    font-size: 17px;
    line-height: 1.7;
    color: #333;
  }

  .section {
    margin-bottom: 12px;
  }

  .section strong {
    color: #a965e5;
    font-weight: 600;
    display: inline-block;
    width: 100px;
  }

  .highlight {
    background-color: #f3e5ff;
    padding: 3px 8px;
    border-radius: 6px;
    font-weight: bold;
    color: #6a1b9a;
  }

  .card-footer {
    font-size: 14px;
    color: #777;
    text-align: center;
    padding-top: 15px;
    border-top: 1px dashed #a965e5;
    margin-top: 15px;
  }

  @media (max-width: 768px) {
    .single-summary-card {
      padding: 22px;
    }
    .card-header h3 {
      font-size: 20px;
    }
    .highlight {
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .single-summary-card {
      padding: 18px;
    }
    .card-header h3 {
      font-size: 18px;
    }
    .highlight {
      font-size: 15px;
    }
  }
</style>

<div class="single-summary-card-container">
  <div class="single-summary-card">
    <div class="card-header">
      <span class="card-header-icon">💡</span>
      <h3>[주제 핵심 요약]</h3>
    </div>
    <div class="card-content">
      <div class="section"><strong>핵심 포인트:</strong> <span class="highlight">[구체적인 핵심 내용]</span></div>
      <div class="section"><strong>활용 방법:</strong> <span class="highlight">[실용적인 활용법]</span></div>
      <div class="section"><strong>주의사항:</strong> <span class="highlight">[꼭 알아야 할 주의점]</span></div>
      <div class="section"><strong>기대 효과:</strong> <span class="highlight">[예상되는 효과]</span></div>
      <div class="section"><strong>추천 대상:</strong> <span class="highlight">[대상 독자층]</span></div>
    </div>
    <div class="card-footer">💡 [주제에 맞는 마무리 메시지]</div>
  </div>
</div>

4. **테이블 (2-6번째 H2 사이 중 한 곳에 배치)**
   - 비교, 단계별 설명, 또는 체크리스트 형태
   - 3-5행, 2-4열 구성

5. **주의사항 카드 (2-6번째 H2 사이 중 한 곳에 배치)**
   - 경고 아이콘과 함께 중요한 주의점 강조
   - 노란색 배경의 카드 형태

6. **키워드 강조**
   - 각 H2 섹션당 중요 키워드 1개에만 컬러 적용
   - 색상: #e74c3c (빨간색)

7. **외부 링크 통합**
   - 본문 중간에 공식/공인 사이트 2-3개를 자연스럽게 하이퍼링크로 추가
   - 맥락에 맞게 자연스럽게 삽입

8. **태그 (7개, 쉼표로 구분)**
   - "관련 태그" 텍스트 없이 태그만 나열
   - 예: 키워드1, 키워드2, 키워드3, 키워드4, 키워드5, 키워드6, 키워드7

**중요 사항:**
- 결론 및 참고 자료 섹션은 절대 포함하지 마세요
- 시각화 요약 카드의 모든 내용은 실제 글 내용을 반영해야 합니다
- 단순한 형식 채우기가 아닌 실질적이고 구체적인 정보 제공
- HTML 구조와 스타일을 정확히 준수해주세요

이제 "${topic}" 주제로 위 지침에 따라 블로그 글을 작성해주세요.`;

  try {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.8,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
    }

    let content = data.candidates[0].content.parts[0].text;
    
    // HTML 구조 정리
    content = content.replace(/```html\n?/g, '').replace(/```\n?/g, '');
    
    return content;
    
  } catch (error) {
    console.error('블로그 콘텐츠 생성 오류:', error);
    throw error;
  }
};
