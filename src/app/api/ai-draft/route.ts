import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL   = "gemini-2.0-flash";
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  const { prompt: userPrompt } = await req.json();

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
  }

  const systemPrompt = `
당신은 태웅(Taewoong) 15,000T 프레스 공정 전문가입니다. 
사용자의 자연어 설명을 분석하여 단조 시방서 초안 데이터(JSON)를 생성하세요.

[분석 규칙]
1. 제품명(productName): 핵심 키워드 추출.
2. 형상(shape): 다음 중 하나 선택 [RING, SHAFT, SHELL, PIPE, DISK, BLOCK, OTHER].
3. 소재(material): 다음 중 가장 유사한 규격 선택 [ASTM_A336_F22, ASTM_A336_F11, ASTM_A336_F91, ASTM_A105, ASTM_A182_F316, ASTM_A182_F304, ASTM_A266_CL4, ASTM_A350_LF2].
4. 치수: mm 단위로 숫지만 추출 (예: 2미터 -> 2000).
5. 상세 공정(steps): 형상과 소재에 맞는 3~5단계 단조 시퀀스 자동 생성. 각 단계는 { stepName, targetDimension, temp_C, notes } 구조.

[요구 출력 형식 — 반드시 아래 JSON만 출력, 설명 금지]
{
  "productName": "<string>",
  "shape": "<string>",
  "material": "<string>",
  "od_mm": "<string>",
  "id_mm": "<string>",
  "height_mm": "<string>",
  "workingMethod": "<string>",
  "steps": [
    { "id": "1", "stepName": "<string>", "targetDimension": "<string>", "temp_C": "<string>", "notes": "<string>" },
    ...
  ]
}
`.trim();

  try {
    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n사용자 입력: ${userPrompt}` }] }],
        generationConfig: { temperature: 0.1, topP: 0.8, topK: 40, maxOutputTokens: 2048 },
      }),
    });

    if (!geminiRes.ok) throw new Error(`Gemini API 오류: ${geminiRes.status}`);

    const geminiData = await geminiRes.json();
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) ?? rawText.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : rawText;
    const draft = JSON.parse(jsonStr.trim());

    return NextResponse.json({ draft });
  } catch (err) {
    console.error("[api/ai-draft] Gemini 호출 실패:", err);
    return NextResponse.json({ error: "Draft generation failed" }, { status: 500 });
  }
}
