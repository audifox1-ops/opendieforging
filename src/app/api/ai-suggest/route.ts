import { NextRequest, NextResponse } from "next/server";
import { MOCK_AI_DATA, DEFAULT_AI_SUGGESTION } from "@/constants/mockAiData";

export const runtime = "nodejs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL   = "gemini-2.0-flash";
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { material, shape, od_mm, height_mm, weight_kg, htType, htCoolingMedia } = body;

  if (!GEMINI_API_KEY) {
    const mock = MOCK_AI_DATA[material] ?? DEFAULT_AI_SUGGESTION;
    return NextResponse.json({ suggestion: mock, source: "mock" });
  }

  const prompt = `
당신은 오픈다이 단조 공정 전문가입니다. 아래 입력 데이터를 바탕으로 최적의 단조 공정 파라미터를 JSON 형식으로 추론하세요.

[입력 데이터]
- 소재/규격: ${material}
- 형상: ${shape}
- 외경(OD): ${od_mm ?? "미입력"} mm
- 높이(Height): ${height_mm ?? "미입력"} mm
- 중량(Weight): ${weight_kg ?? "미입력"} kg
- 열처리 유형: ${htType}
- 냉각 매질: ${htCoolingMedia}

[요구 출력 형식 — 반드시 아래 JSON만 출력, 설명 금지]
{
  "forgingTempMin_C": <number>,
  "forgingTempMax_C": <number>,
  "heatingRate_mmPerHr": <number>,
  "soakingTime_hrPer100mm": <number>,
  "heatTreatment": {
    "quenchTemp_C": <number | null>,
    "quenchMedia": "<string | null>",
    "temperTemp_C": <number | null>,
    "normalizingTemp_C": <number | null>,
    "description": "<string>"
  },
  "notes": ["<string>", ...]
}

규격 ${material}의 최신 산업 표준에 근거하여 정확한 수치를 제공하세요.
`.trim();

  try {
    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, topP: 0.8, topK: 40, maxOutputTokens: 1024 },
      }),
    });

    if (!geminiRes.ok) throw new Error(`Gemini API 오류: ${geminiRes.status}`);

    const geminiData = await geminiRes.json();
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) ?? rawText.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : rawText;
    const suggestion = JSON.parse(jsonStr.trim());

    return NextResponse.json({ suggestion, source: "gemini", rawResponse: rawText });
  } catch (err) {
    console.error("[api/ai-suggest] Gemini 파싱 실패:", err);
    const mock = MOCK_AI_DATA[material] ?? DEFAULT_AI_SUGGESTION;
    return NextResponse.json({ suggestion: mock, source: "mock" });
  }
}
