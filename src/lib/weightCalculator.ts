/**
 * 소재 밀도 및 형상별 부피 계산 로직
 */
export const STEEL_DENSITY = 0.00000785; // kg/mm^3 (7.85 g/cm^3)

export interface AutoWeightParams {
  shape: string;
  od_mm: number | null;
  height_mm: number | null;
}

/**
 * 치수를 기반으로 예상 단조 중량(Rough Weight)을 산출합니다.
 */
export function calculateTargetWeight(params: AutoWeightParams): number | null {
  const { shape, od_mm, height_mm } = params;

  if (!od_mm || !height_mm || od_mm <= 0 || height_mm <= 0) {
    return null;
  }

  let volume_mm3 = 0;

  // DISC, BLOCK 등 기본 원기둥형 산출
  const radius = od_mm / 2;
  volume_mm3 = Math.PI * Math.pow(radius, 2) * height_mm;

  const weight_kg = volume_mm3 * STEEL_DENSITY;
  
  // 소수점 첫째자리에서 반올림 (현장 관리 정밀도)
  return Math.round(weight_kg * 10) / 10;
}
