import { type AiSuggestion } from "@/constants/mockAiData";

export interface WorkStep {
  id: number;
  title: string;
  description: string;
  target?: string;
  actual?: string;
  isCompleted: boolean;
  type: "HEATING" | "FORGING" | "HT" | "COOLING";
}

export interface SafetyNote {
  icon: string;
  title: string;
  content: string;
}

/**
 * 시방서 AI 제안 데이터를 작업자가 수행할 수 있는 단계별 공정으로 변환합니다.
 */
export function generateWorkSteps(suggestion: AiSuggestion): WorkStep[] {
  const steps: WorkStep[] = [];

  // Step 1: 가열 공정
  steps.push({
    id: 1,
    title: "가열 및 균열 (Heating & Soaking)",
    description: `제품을 목표 온도까지 가열한 후 소재 내부까지 온도가 전달되도록 유지합니다. (승온율: ${suggestion.heatingRate_mmPerHr}mm/hr)`,
    target: `${suggestion.forgingTempMax_C}°C`,
    isCompleted: false,
    type: "HEATING"
  });

  // Step 2: 1차 단조
  steps.push({
    id: 2,
    title: "1차 단조 작업 (1st Forging)",
    description: "매니퓰레이터를 사용하여 소재를 회전시키며 목표 형상으로 초기 성형을 진행합니다.",
    target: `${suggestion.forgingTempMax_C} ~ ${suggestion.forgingTempMin_C + 50}°C`,
    isCompleted: false,
    type: "FORGING"
  });

  // Step 3: 재가열 (필요 시)
  steps.push({
    id: 3,
    title: "재가열 및 보온 (Re-heating)",
    description: "온도 저하 시 재가열하여 최종 단조 온도를 확보합니다.",
    target: `${suggestion.forgingTempMin_C + 100}°C 이상`,
    isCompleted: false,
    type: "HEATING"
  });

  // Step 4: 최종 단조 및 치수 확인
  steps.push({
    id: 4,
    title: "최종 단조 (Final Forging)",
    description: "최종 치수 허용차를 확인하며 마무리 단조를 수행합니다.",
    target: `최저 ${suggestion.forgingTempMin_C}°C 유지`,
    isCompleted: false,
    type: "FORGING"
  });

  // Step 5: 열처리 준비
  steps.push({
    id: 5,
    title: "후열처리 및 냉각 (Post-process)",
    description: suggestion.heatTreatment.description,
    target: suggestion.heatTreatment.quenchMedia || "공냉(Air Cooling)",
    isCompleted: false,
    type: "HT"
  });

  return steps;
}

/**
 * 형상별 프레스 작업 안전 수칙 및 매니퓰레이터 조작 주의사항을 반환합니다.
 */
export function getSafetyNotes(shape: string): SafetyNote[] {
  const baseNotes: SafetyNote[] = [
    { icon: "⚠️", title: "공통 안전", content: "15,000T 프레스 작동 시 주변 5m 이내 접근 금지 및 비상정지 스위치 위치 확인" }
  ];

  if (shape === "RING") {
    baseNotes.push({ icon: "⚖️", title: "수평 유지", content: "링 단조 시 매니퓰레이터 평형을 유지하여 편심 하중 발생 방지" });
  } else if (shape === "SHELL") {
    baseNotes.push({ icon: "🔄", title: "회전 주의", content: "중공부 지지 시 매니퓰레이터 척킹 압력 과다로 인한 변형 주의" });
  } else {
    baseNotes.push({ icon: "📏", title: "중심 정렬", content: "블록/디스크 단조 시 가압 중심과 소재 중심 일치 확인" });
  }

  return baseNotes;
}
