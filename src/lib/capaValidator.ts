/**
 * 태웅 15,000T 프레스 CAPA 검증 순수 함수 모듈
 * ─────────────────────────────────────────────
 * 모든 물리적 제약 수치는 constants/pressLimits.ts에서 가져옵니다.
 * 이 파일은 UI에 의존하지 않는 순수 비즈니스 로직만 포함합니다.
 */
import { PRESS_15000T, type ForgingShape } from "@/constants/pressLimits";

export interface ValidationResult {
  passed: boolean;
  errorCode?: string;
  message?: string;
  limit?: string;
}

export interface ForgingInput {
  od_mm: number | null;
  height_mm: number | null;
  weight_kg: number | null;
  shape: ForgingShape | null;
}

export interface CapaValidationResult {
  rule: string;
  result: ValidationResult;
}

/**
 * 검증 1: M.P - Die 최대 거리 한계
 * OD 또는 Height 중 큰 값이 최대 거리를 초과하는지 확인합니다.
 */
export function validateMpDieDistance(
  od_mm: number | null,
  height_mm: number | null
): ValidationResult {
  const limit = PRESS_15000T.MAX_MP_DIE_DISTANCE_MM;
  const maxDimension = Math.max(od_mm ?? 0, height_mm ?? 0);

  if (maxDimension <= 0) {
    return { passed: true };
  }

  if (maxDimension > limit) {
    const which = (od_mm ?? 0) > (height_mm ?? 0) ? "외경(OD)" : "높이(Height)";
    return {
      passed: false,
      errorCode: "MP_DIE_EXCEEDED",
      message: `${which} ${maxDimension.toLocaleString()}mm 가 M.P-Die 최대 거리(${limit.toLocaleString()}mm)를 초과합니다.`,
      limit: `최대 허용: ${limit.toLocaleString()} mm`,
    };
  }

  return { passed: true };
}

/**
 * 검증 2: SHELL 형상 전용 한계
 * 형상이 SHELL일 경우 중량, 길이, OD에 추가 제약을 적용합니다.
 */
export function validateShellLimits(
  weight_kg: number | null,
  height_mm: number | null,
  od_mm: number | null
): ValidationResult {
  const limits = PRESS_15000T.SHELL;
  const errors: string[] = [];

  if (weight_kg !== null && weight_kg > 0 && weight_kg > limits.MAX_WEIGHT_KG) {
    errors.push(
      `중량 ${weight_kg.toLocaleString()}kg > SHELL 최대 중량 ${limits.MAX_WEIGHT_KG.toLocaleString()}kg`
    );
  }
  if (height_mm !== null && height_mm > 0 && height_mm > limits.MAX_LENGTH_MM) {
    errors.push(
      `길이 ${height_mm.toLocaleString()}mm > SHELL 최대 길이 ${limits.MAX_LENGTH_MM.toLocaleString()}mm`
    );
  }
  if (od_mm !== null && od_mm > 0 && od_mm > limits.MAX_OD_MM) {
    errors.push(
      `외경 ${od_mm.toLocaleString()}mm > SHELL 최대 OD ${limits.MAX_OD_MM.toLocaleString()}mm`
    );
  }

  if (errors.length > 0) {
    return {
      passed: false,
      errorCode: "SHELL_LIMIT_EXCEEDED",
      message: `SHELL 형상 한계 초과: ${errors.join(" / ")}`,
      limit: `중량 ≤ ${limits.MAX_WEIGHT_KG.toLocaleString()}kg, 길이/OD ≤ ${limits.MAX_LENGTH_MM.toLocaleString()}mm`,
    };
  }

  return { passed: true };
}

/**
 * 통합 CAPA 검증 함수
 * 모든 규칙을 순서대로 검증하고 결과 배열을 반환합니다.
 */
export function validateForging(input: ForgingInput): CapaValidationResult[] {
  const results: CapaValidationResult[] = [];

  // 규칙 1: M.P - Die 거리 한계
  results.push({
    rule: "M.P - Die 거리 한계",
    result: validateMpDieDistance(input.od_mm, input.height_mm),
  });

  // 규칙 2: SHELL 형상 한계 (SHELL일 때만)
  if (input.shape === "SHELL") {
    results.push({
      rule: "SHELL 형상 한계",
      result: validateShellLimits(input.weight_kg, input.height_mm, input.od_mm),
    });
  }

  return results;
}

/** 전체 검증 통과 여부 */
export function isCapaPassed(results: CapaValidationResult[]): boolean {
  return results.every((r) => r.result.passed);
}
