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
  type?: string; // 검증 대상 필드 (od, height, weight 등)
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
  od_mm: number | null,
  targetType?: string
): ValidationResult {
  const limits = PRESS_15000T.SHELL;
  const errors: string[] = [];

  if (targetType === "weight" || !targetType) {
    if (weight_kg !== null && weight_kg > 0 && weight_kg > limits.MAX_WEIGHT_KG) {
      errors.push(
        `중량 ${weight_kg.toLocaleString()}kg > SHELL 최대 중량 ${limits.MAX_WEIGHT_KG.toLocaleString()}kg`
      );
    }
  }
  if (targetType === "height" || !targetType) {
    if (height_mm !== null && height_mm > 0 && height_mm > limits.MAX_LENGTH_MM) {
      errors.push(
        `길이 ${height_mm.toLocaleString()}mm > SHELL 최대 길이 ${limits.MAX_LENGTH_MM.toLocaleString()}mm`
      );
    }
  }
  if (targetType === "od" || !targetType) {
    if (od_mm !== null && od_mm > 0 && od_mm > limits.MAX_OD_MM) {
      errors.push(
        `외경 ${od_mm.toLocaleString()}mm > SHELL 최대 OD ${limits.MAX_OD_MM.toLocaleString()}mm`
      );
    }
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
 * 통합 CAPA 검증 함수 (장비 안전성 중심)
 * ─────────────────────────────────────────────
 * 현장 요청에 따라 높이/길이의 물리적 제한은 체크하지 않으며,
 * 크레인 및 프레스의 중량 한계(MAX_WEIGHT)만 검증합니다.
 */
export function validateForging(input: ForgingInput): CapaValidationResult[] {
  const results: CapaValidationResult[] = [];
  const limits = PRESS_15000T.SHELL; // 장비 한계 정보 (constants 참조)

  // 규칙 1: 전체 하중 한계 (프레스/크레인 안전을 위한 150톤 제한)
  if (input.weight_kg !== null && input.weight_kg > 0) {
    const MAX_PRESS_WEIGHT = 150000; 
    if (input.weight_kg > MAX_PRESS_WEIGHT) {
      results.push({
        rule: "프레스 하중 한계",
        type: "weight",
        result: {
          passed: false,
          errorCode: "MAX_WEIGHT_EXCEEDED",
          message: `입력된 중량 ${input.weight_kg.toLocaleString()}kg이 장비 최대 허용 하중(150,000kg)을 초과합니다.`,
          limit: `최대 허용: 150,000 kg`,
        }
      });
    } else {
      results.push({
        rule: "하중 검증 완료",
        type: "weight",
        result: { passed: true }
      });
    }
  }

  // 규칙 2: SHELL 형상 전용 중량 관리
  if (input.shape === "SHELL") {
    if (input.weight_kg !== null && input.weight_kg > limits.MAX_WEIGHT_KG) {
      results.push({
        rule: "SHELL 중량 한계",
        type: "weight",
        result: {
          passed: false,
          errorCode: "SHELL_WEIGHT_EXCEEDED",
          message: `SHELL 형상 최대 중량(${limits.MAX_WEIGHT_KG.toLocaleString()}kg)을 초과합니다.`,
          limit: `SHELL 최대: ${limits.MAX_WEIGHT_KG.toLocaleString()} kg`,
        }
      });
    }
  }

  return results;
}

/** 전체 검증 통과 여부 */
export function isCapaPassed(results: CapaValidationResult[]): boolean {
  return results.every((r) => r.result.passed);
}
