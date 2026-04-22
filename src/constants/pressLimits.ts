/**
 * 태웅 15,000T 오픈다이 단조 프레스 물리적 제약 상수
 * ─────────────────────────────────────────────────
 * 장비 사양 변경 시 이 파일의 수치만 수정하면 전체 검증 로직에 반영됩니다.
 */

export const PRESS_15000T = {
  /** M.P(Moving Platen) ~ Die 사이의 최대 허용 거리 (mm) */
  MAX_MP_DIE_DISTANCE_MM: 3500,

  /** SHELL 형상 전용 추가 제약 */
  SHELL: {
    /** SHELL 형상 최대 허용 중량 (kg) */
    MAX_WEIGHT_KG: 100_000,
    /** SHELL 형상 최대 길이 (mm) */
    MAX_LENGTH_MM: 4_000,
    /** SHELL 형상 최대 외경 (mm) */
    MAX_OD_MM: 4_000,
  },
} as const;

/** 형상 종류 */
export const FORGING_SHAPES = [
  { value: "RING",     label: "Ring (링)" },
  { value: "SHELL",    label: "Shell (쉘)" },
  { value: "CYLINDER", label: "Cylinder (실린더)" },
  { value: "PIPE",     label: "Pipe (파이프)" },
  { value: "SHAFT",    label: "Shaft (샤프트)" },
] as const;

export type ForgingShape = typeof FORGING_SHAPES[number]["value"];

/** NDT 기준 규격 */
export const NDT_STANDARDS = [
  { value: "ASME",     label: "ASME" },
  { value: "ASTM",     label: "ASTM" },
  { value: "EN",       label: "EN (European Norm)" },
  { value: "KS",       label: "KS (한국산업표준)" },
  { value: "JIS",      label: "JIS (일본공업규격)" },
  { value: "ISO",      label: "ISO" },
  { value: "NORSOK",   label: "NORSOK" },
] as const;

export type NdtStandard = typeof NDT_STANDARDS[number]["value"];

/** NDT 등급(Class) 옵션 */
export const NDT_CLASSES = [
  { value: "CLASS_1", label: "Class 1" },
  { value: "CLASS_2", label: "Class 2" },
  { value: "CLASS_3", label: "Class 3" },
  { value: "LEVEL_A", label: "Level A" },
  { value: "LEVEL_B", label: "Level B" },
  { value: "LEVEL_C", label: "Level C" },
  { value: "GRADE_1", label: "Grade 1" },
  { value: "GRADE_2", label: "Grade 2" },
] as const;

/** 열처리 냉각 매질 */
export const HT_COOLING_MEDIA = [
  { value: "WATER", label: "Water (수냉)" },
  { value: "OIL",   label: "Oil (유냉)" },
  { value: "AIR",   label: "Air (공냉)" },
] as const;

export type HtCoolingMedia = typeof HT_COOLING_MEDIA[number]["value"];

/** 열처리 유형 */
export const HT_TYPES = [
  { value: "QT",            label: "Q/T (Quench & Temper)" },
  { value: "NORMALIZING",   label: "Normalizing (불림)" },
  { value: "ANNEALING",     label: "Annealing (풀림)" },
  { value: "STRESS_RELIEF", label: "Stress Relief (응력 제거)" },
  { value: "NONE",          label: "없음 (As Forged)" },
] as const;

export type HtType = typeof HT_TYPES[number]["value"];

/** 소재/규격 목록 */
export const MATERIAL_STANDARDS = [
  { value: "ASTM_A336_F22",  label: "ASTM A336 Gr.F22 (Cr-Mo Steel)" },
  { value: "ASTM_A336_F11",  label: "ASTM A336 Gr.F11 (1.25Cr-0.5Mo)" },
  { value: "ASTM_A336_F91",  label: "ASTM A336 Gr.F91 (9Cr-1Mo-V)" },
  { value: "ASTM_A105",      label: "ASTM A105 (Carbon Steel)" },
  { value: "ASTM_A182_F316", label: "ASTM A182 F316 (316 SS)" },
  { value: "ASTM_A182_F304", label: "ASTM A182 F304 (304 SS)" },
  { value: "ASTM_A266_CL4",  label: "ASTM A266 Cl.4 (Pressure Vessel)" },
  { value: "ASTM_A350_LF2",  label: "ASTM A350 LF2 (Low-Temp CS)" },
  { value: "ASME_SA182_F22", label: "ASME SA-182 F22" },
  { value: "ASME_SA336_F22", label: "ASME SA-336 F22" },
  { value: "EN_1.7380",      label: "EN 1.7380 (12CrMo9-10)" },
  { value: "EN_1.4923",      label: "EN 1.4923 (X22CrMoV12-1)" },
] as const;

export type MaterialStandard = typeof MATERIAL_STANDARDS[number]["value"];

/** 문서 상태 플로우 */
export const SPEC_STATUSES = [
  { value: "DRAFTING",         label: "작성 중",   color: "#64748b" },
  { value: "REVIEW_REQUESTED", label: "검토 요청", color: "#d97706" },
  { value: "APPROVED",         label: "승인 완료", color: "#16a34a" },
] as const;

export type SpecStatus = typeof SPEC_STATUSES[number]["value"];
