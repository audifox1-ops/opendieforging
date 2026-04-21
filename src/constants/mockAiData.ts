/**
 * Gemini API 폴백용 ASTM 단조 공정 목업 데이터
 * ─────────────────────────────────────────────
 * Gemini API 호출 실패 또는 네트워크 없는 환경에서 사용됩니다.
 * 실제 업무에서는 Gemini API 응답이 우선 적용됩니다.
 */

export interface AiSuggestion {
  forgingTempMin_C: number;
  forgingTempMax_C: number;
  heatingRate_mmPerHr: number;
  soakingTime_hrPer100mm: number;
  heatTreatment: {
    quenchTemp_C?: number;
    quenchMedia?: string;
    temperTemp_C?: number;
    normalizingTemp_C?: number;
    description: string;
  };
  notes: string[];
}

export const MOCK_AI_DATA: Record<string, AiSuggestion> = {
  ASTM_A336_F22: {
    forgingTempMin_C: 1100,
    forgingTempMax_C: 1250,
    heatingRate_mmPerHr: 80,
    soakingTime_hrPer100mm: 1.0,
    heatTreatment: {
      quenchTemp_C: 900,
      quenchMedia: "Water or Oil",
      temperTemp_C: 680,
      description: "Q/T: 900°C 담금질 → 680°C 템퍼링 (ASTM A336 F22 표준)",
    },
    notes: [
      "단조 완료 후 즉시 후열처리(PWHT) 권장",
      "단조온도 1,100°C 미만에서의 작업 금지",
      "냉각 속도: 최소 28°C/hr (공냉 이하)",
      "최종 조직: 베이나이트 or 마르텐사이트 + 템퍼링",
    ],
  },
  ASTM_A336_F11: {
    forgingTempMin_C: 1100,
    forgingTempMax_C: 1250,
    heatingRate_mmPerHr: 80,
    soakingTime_hrPer100mm: 1.0,
    heatTreatment: {
      quenchTemp_C: 900,
      quenchMedia: "Water or Oil",
      temperTemp_C: 650,
      description: "Q/T: 900°C 담금질 → 650°C 템퍼링",
    },
    notes: [
      "1.25Cr-0.5Mo 강 — 크리프 저항성 우수",
      "고온 서비스 헤더/드럼 형상에 적합",
      "수소 취화 방지를 위해 냉각 속도 제어 필수",
    ],
  },
  ASTM_A336_F91: {
    forgingTempMin_C: 1100,
    forgingTempMax_C: 1230,
    heatingRate_mmPerHr: 60,
    soakingTime_hrPer100mm: 1.2,
    heatTreatment: {
      normalizingTemp_C: 1050,
      temperTemp_C: 760,
      description: "정규화(1,050°C) + 템퍼링(760°C) — F91 표준 처리",
    },
    notes: [
      "⚠️ 마르텐사이트 변태온도(Ms) 주의: 약 400°C",
      "냉각 후 230°C 이하에서 즉시 템퍼링 필수",
      "델타 페라이트 형성 방지 위해 과열 금지",
      "ASME Code Case 2327 참조",
    ],
  },
  ASTM_A105: {
    forgingTempMin_C: 1100,
    forgingTempMax_C: 1250,
    heatingRate_mmPerHr: 100,
    soakingTime_hrPer100mm: 0.8,
    heatTreatment: {
      normalizingTemp_C: 870,
      description: "정규화(870°C) — ASTM A105 탄소강 표준 처리",
    },
    notes: [
      "탄소 함량 최대 0.35% 준수",
      "단조 후 서냉(공냉) 또는 정규화 처리",
      "중온 서비스(≤425°C) 플랜지/피팅 용도",
    ],
  },
  ASTM_A182_F316: {
    forgingTempMin_C: 1150,
    forgingTempMax_C: 1280,
    heatingRate_mmPerHr: 50,
    soakingTime_hrPer100mm: 1.5,
    heatTreatment: {
      normalizingTemp_C: 1040,
      quenchMedia: "Water (급냉)",
      description: "고용화 열처리(1,040~1,150°C) + 급수냉 — 316 SS 표준",
    },
    notes: [
      "예열 불필요 (오스테나이트계 STS)",
      "단조 후 고용화 처리로 예민화 방지",
      "850~500°C 구간 신속 통과 필수 (탄화물 석출 방지)",
      "델타 페라이트 ≤10% 관리",
    ],
  },
  ASTM_A182_F304: {
    forgingTempMin_C: 1150,
    forgingTempMax_C: 1280,
    heatingRate_mmPerHr: 50,
    soakingTime_hrPer100mm: 1.5,
    heatTreatment: {
      normalizingTemp_C: 1040,
      quenchMedia: "Water (급냉)",
      description: "고용화 열처리(1,040~1,150°C) + 급수냉 — 304 SS 표준",
    },
    notes: [
      "304 SS — 일반 부식 환경 적용",
      "Cl 이온 환경 SCC 주의",
      "고용화 처리 후 급냉으로 탄화물 고용 유지",
    ],
  },
  ASTM_A266_CL4: {
    forgingTempMin_C: 1100,
    forgingTempMax_C: 1250,
    heatingRate_mmPerHr: 80,
    soakingTime_hrPer100mm: 1.0,
    heatTreatment: {
      quenchTemp_C: 870,
      quenchMedia: "Water or Oil",
      temperTemp_C: 620,
      description: "Q/T: 870°C 담금질 → 620°C 템퍼링 — 압력용기용",
    },
    notes: [
      "ASME Sec. VIII 압력용기 플랜지 적용",
      "Charpy 충격 시험 요구값 확인 필수",
      "최소 항복강도 485 MPa (Class 4)",
    ],
  },
  ASTM_A350_LF2: {
    forgingTempMin_C: 1100,
    forgingTempMax_C: 1230,
    heatingRate_mmPerHr: 80,
    soakingTime_hrPer100mm: 1.0,
    heatTreatment: {
      normalizingTemp_C: 900,
      temperTemp_C: 620,
      description: "정규화(900°C) + 템퍼링(620°C) — 저온용 탄소강",
    },
    notes: [
      "저온 서비스용 (-46°C까지)",
      "Charpy CVN @ -46°C: ≥27 J 필수",
      "두께 증가 시 Q/T 처리 권장",
    ],
  },
  ASME_SA182_F22: {
    forgingTempMin_C: 1100,
    forgingTempMax_C: 1250,
    heatingRate_mmPerHr: 80,
    soakingTime_hrPer100mm: 1.0,
    heatTreatment: {
      quenchTemp_C: 900,
      quenchMedia: "Water or Oil",
      temperTemp_C: 680,
      description: "Q/T: 900°C → 680°C (ASME SA-182 F22 — ASTM A336 F22 동등)",
    },
    notes: [
      "ASME Boiler & Pressure Vessel Code 적용",
      "ASTM A336 F22와 화학/기계적 성질 동일",
      "Code Stamp 요구 시 ASME 인증 밀 사용",
    ],
  },
  ASME_SA336_F22: {
    forgingTempMin_C: 1100,
    forgingTempMax_C: 1250,
    heatingRate_mmPerHr: 80,
    soakingTime_hrPer100mm: 1.0,
    heatTreatment: {
      quenchTemp_C: 900,
      quenchMedia: "Water or Oil",
      temperTemp_C: 680,
      description: "Q/T: 900°C → 680°C (SA-336 F22)",
    },
    notes: [
      "압력용기 단조품 전용 ASME 규격",
      "PWHT: 690~760°C 범위 적용",
    ],
  },
  "EN_1.7380": {
    forgingTempMin_C: 1100,
    forgingTempMax_C: 1250,
    heatingRate_mmPerHr: 80,
    soakingTime_hrPer100mm: 1.0,
    heatTreatment: {
      quenchTemp_C: 900,
      quenchMedia: "Water or Oil",
      temperTemp_C: 680,
      description: "Q/T: 900°C → 680°C (EN 1.7380 = 12CrMo9-10)",
    },
    notes: [
      "유럽 EN 규격 크롬-몰리브덴강",
      "ASTM A336 F22와 근접한 특성",
      "EN 10222-2 압력용기 반제품 적용",
    ],
  },
  "EN_1.4923": {
    forgingTempMin_C: 1050,
    forgingTempMax_C: 1200,
    heatingRate_mmPerHr: 60,
    soakingTime_hrPer100mm: 1.2,
    heatTreatment: {
      normalizingTemp_C: 1050,
      temperTemp_C: 750,
      description: "정규화(1,050°C) + 템퍼링(750°C) — EN 1.4923 마르텐사이트 STS",
    },
    notes: [
      "고온 터빈 블레이드/디스크 단조용",
      "예열 300~400°C 권장",
      "단조 후 즉시 열처리 필수",
    ],
  },
};

/** 기본 AI 제안값 (규격 미식별 시 폴백) */
export const DEFAULT_AI_SUGGESTION: AiSuggestion = {
  forgingTempMin_C: 1100,
  forgingTempMax_C: 1250,
  heatingRate_mmPerHr: 80,
  soakingTime_hrPer100mm: 1.0,
  heatTreatment: {
    description: "규격에 따른 열처리 조건을 별도 확인하세요.",
  },
  notes: ["선택된 규격에 대한 상세 데이터를 Gemini AI에 문의하세요."],
};
