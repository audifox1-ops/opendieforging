/**
 * AI 공정 추론 로직 — Gemini API 연동 + 폴백
 * ─────────────────────────────────────────────
 * Gemini API 호출 성공 시: 실시간 AI 추론 결과 사용
 * 실패 or 규격 미지원 시: mockAiData.ts 폴백 적용
 */
import { MOCK_AI_DATA, DEFAULT_AI_SUGGESTION, type AiSuggestion } from "@/constants/mockAiData";

export interface AiInferenceInput {
  material: string;
  shape: string;
  od_mm: number | null;
  height_mm: number | null;
  weight_kg: number | null;
  htType: string;
  htCoolingMedia: string;
}

export interface AiInferenceResult {
  suggestion: AiSuggestion;
  source: "gemini" | "mock";
  rawResponse?: string;
}

/**
 * Gemini API를 통한 AI 공정 추론 (서버/클라이언트 공용)
 * 실제 API 호출은 /api/ai-suggest 라우트를 통해 처리됩니다.
 */
export async function inferProcess(
  input: AiInferenceInput
): Promise<AiInferenceResult> {
  try {
    const res = await fetch("/api/ai-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) throw new Error(`API ${res.status}`);

    const data = await res.json();
    return {
      suggestion: data.suggestion,
      source: "gemini",
      rawResponse: data.rawResponse,
    };
  } catch (err) {
    console.warn("[aiInference] Gemini 호출 실패, Mock 데이터 폴백:", err);
    const mock = MOCK_AI_DATA[input.material] ?? DEFAULT_AI_SUGGESTION;
    const suggestion = { ...mock };

    // 중량 기반 작업 방식 보완 로직 (예: 50톤 이상)
    if (input.weight_kg && input.weight_kg >= 50000) {
      suggestion.workingMethod = `[대형 중량물 특이사항] ${suggestion.workingMethod} 추가로, 대형 중량물(50톤 이상)이므로 심부 가열을 위해 소킹 시간을 20% 상향하고, 핸들러 조작 시 관성 하중에 의한 장비 충격에 각별히 유의하십시오.`;
    }

    return { suggestion, source: "mock" };
  }
}
