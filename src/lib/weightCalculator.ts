/**
 * 소재 밀도 및 형상별 부피 계산 로직
 */
export const STEEL_DENSITY = 0.00000785; // kg/mm^3 (7.85 g/cm^3)

export interface AutoWeightParams {
  shape: string;
  od_mm: number | null;
  id_mm?: number | null;
  height_mm: number | null;
}

/**
 * 치수를 기반으로 예상 단조 중량(Rough Weight)을 산출합니다.
 */
export function calculateTargetWeight(params: AutoWeightParams): number | null {
  const { shape, od_mm, id_mm, height_mm } = params;

  if (!od_mm || !height_mm || od_mm <= 0 || height_mm <= 0) {
    return null;
  }

  let volume_mm3 = 0;

  // 기본 원기둥형 산출 (외경 기준)
  const outerRadius = od_mm / 2;
  const totalVolume = Math.PI * Math.pow(outerRadius, 2) * height_mm;

  // 내경(ID)이 있는 경우 내측 부피를 뺌
  if (id_mm && id_mm > 0 && id_mm < od_mm) {
    const innerRadius = id_mm / 2;
    const innerVolume = Math.PI * Math.pow(innerRadius, 2) * height_mm;
    volume_mm3 = totalVolume - innerVolume;
  } else {
    volume_mm3 = totalVolume;
  }

  const weight_kg = volume_mm3 * STEEL_DENSITY;
  
  // 소수점 첫째자리에서 반올림 (현장 관리 정밀도)
  return Math.round(weight_kg * 10) / 10;
}
