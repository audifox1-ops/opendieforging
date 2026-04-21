"use client";

import { useEffect, useCallback } from "react";
import { Ruler, Weight, Layers, FlaskConical, Thermometer, ShieldCheck } from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import CapaWarningBadge from "@/components/spec-form/CapaWarningBadge";
import {
  FORGING_SHAPES, NDT_STANDARDS, NDT_CLASSES,
  HT_COOLING_MEDIA, HT_TYPES, MATERIAL_STANDARDS,
  type ForgingShape, type NdtStandard, type HtCoolingMedia, type HtType, type MaterialStandard,
} from "@/constants/pressLimits";
import { validateForging, type ForgingInput, type CapaValidationResult } from "@/lib/capaValidator";
import { calculateTargetWeight } from "@/lib/weightCalculator";

export interface SpecFormData {
  productName: string;
  shape: ForgingShape | "";
  material: MaterialStandard | "";
  ndtStandard: NdtStandard | "";
  ndtClass: string;
  od_mm: string;
  height_mm: string;
  weight_kg: string;
  htCoolingMedia: HtCoolingMedia | "";
  htType: HtType | "";
  remarks: string;
}

interface InputSmartFormProps {
  data: SpecFormData;
  onChange: (data: SpecFormData) => void;
  capaResults: CapaValidationResult[];
  onCapaChange: (results: CapaValidationResult[]) => void;
}

export const INITIAL_FORM_DATA: SpecFormData = {
  productName: "", shape: "", material: "", ndtStandard: "", ndtClass: "",
  od_mm: "", height_mm: "", weight_kg: "", htCoolingMedia: "", htType: "", remarks: "",
};

export default function InputSmartForm({
  data, onChange, capaResults, onCapaChange,
}: InputSmartFormProps) {

  // 치수 변경 시 실시간 CAPA 검증 및 중량 자동 산출
  const runCapa = useCallback((formData: SpecFormData) => {
    const input: ForgingInput = {
      od_mm:     formData.od_mm     ? parseFloat(formData.od_mm)     : null,
      height_mm: formData.height_mm ? parseFloat(formData.height_mm) : null,
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
      shape:     (formData.shape as ForgingShape) || null,
    };

    // 중량 자동 산출 로직 (OD, Height, Shape가 모두 있을 때)
    if (input.od_mm && input.height_mm && input.shape) {
      const calculated = calculateTargetWeight({
        shape: input.shape,
        od_mm: input.od_mm,
        height_mm: input.height_mm
      });
      
      // 입력된 중량이 없거나 계산된 값과 차이가 있을 때 업데이트 (소수점 1자리 기준)
      if (calculated !== null && (!formData.weight_kg || Math.abs(parseFloat(formData.weight_kg) - calculated) > 0.05)) {
        onChange({ ...formData, weight_kg: calculated.toString() });
        return;
      }
    }

    const hasDimension = input.od_mm || input.height_mm || input.weight_kg;
    if (!hasDimension) { onCapaChange([]); return; }
    onCapaChange(validateForging(input));
  }, [onCapaChange, onChange]);

  useEffect(() => { 
    runCapa(data); 
  }, [data.od_mm, data.height_mm, data.shape, runCapa]);

  function set<K extends keyof SpecFormData>(key: K, value: SpecFormData[K]) {
    onChange({ ...data, [key]: value });
  }

  // 필드별 검증 상태 계산
  const getFieldStatus = (fieldName: string) => {
    const val = fieldName === "od" ? data.od_mm : fieldName === "height" ? data.height_mm : data.weight_kg;
    if (!val) return "";
    
    const fieldResult = capaResults.find(r => r.type === fieldName);
    if (!fieldResult) return "success"; // 결과는 없는데 값은 있으면 기본적으로 통과로 간주 (혹은 success)
    return fieldResult.result.passed ? "success" : "error";
  };

  return (
    <div className="space-y-8">
      {/* ── 섹션 1: 기본 정보 ── */}
      <section className="factory-card p-6">
        <div className="section-header mb-5">
          <Layers className="w-4 h-4 text-factory-400" />
          기본 정보
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 제품명 */}
          <div className="md:col-span-2">
            <label className="factory-label">제품명 / Item Description</label>
            <input
              id="field-product-name"
              type="text"
              value={data.productName}
              onChange={(e) => set("productName", e.target.value)}
              placeholder="예: Pressure Vessel Nozzle Forging"
              className="factory-input"
            />
          </div>

          {/* 형상 */}
          <div>
            <label className="factory-label">형상 Shape</label>
            <SearchableSelect
              id="field-shape"
              options={FORGING_SHAPES as unknown as { value: string; label: string }[]}
              value={data.shape}
              onChange={(v) => set("shape", v as ForgingShape)}
              placeholder="형상 선택..."
            />
          </div>

          {/* 소재/규격 */}
          <div>
            <label className="factory-label">소재 / 규격 Material Standard</label>
            <SearchableSelect
              id="field-material"
              options={MATERIAL_STANDARDS as unknown as { value: string; label: string }[]}
              value={data.material}
              onChange={(v) => set("material", v as MaterialStandard)}
              placeholder="규격 검색..."
            />
          </div>
        </div>
      </section>

      {/* ── 섹션 2: NDT 기준 ── */}
      <section className="factory-card p-6">
        <div className="section-header mb-5">
          <ShieldCheck className="w-4 h-4 text-factory-400" />
          NDT 검사 기준
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="factory-label">NDT 규격 Standard</label>
            <SearchableSelect
              id="field-ndt-standard"
              options={NDT_STANDARDS as unknown as { value: string; label: string }[]}
              value={data.ndtStandard}
              onChange={(v) => set("ndtStandard", v as NdtStandard)}
              placeholder="규격 선택..."
            />
          </div>
          <div>
            <label className="factory-label">등급 / Class</label>
            <SearchableSelect
              id="field-ndt-class"
              options={NDT_CLASSES as unknown as { value: string; label: string }[]}
              value={data.ndtClass}
              onChange={(v) => set("ndtClass", v)}
              placeholder="등급 선택..."
            />
          </div>
        </div>
      </section>

      {/* ── 섹션 3: 치수 & 중량 (CAPA 실시간 검증) ── */}
      <section className="factory-card p-6">
        <div className="section-header mb-5">
          <Ruler className="w-4 h-4 text-factory-400" />
          치수 & 중량 — 15,000T CAPA 실시간 검증
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {/* OD */}
          <div>
            <label className="factory-label">외경 OD (mm)</label>
            <div className="relative">
              <input
                id="field-od"
                type="number"
                min="0"
                step="1"
                value={data.od_mm}
                onChange={(e) => set("od_mm", e.target.value)}
                placeholder="0"
                className={`factory-input pr-12 ${getFieldStatus("od")}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-factory-500 font-mono pointer-events-none">
                mm
              </span>
            </div>
            <p className="text-xs text-factory-600 mt-1">
              한계: ≤ 3,500 mm (M.P-Die)
            </p>
          </div>

          {/* Height */}
          <div>
            <label className="factory-label">높이 / 길이 Height (mm)</label>
            <div className="relative">
              <input
                id="field-height"
                type="number"
                min="0"
                step="1"
                value={data.height_mm}
                onChange={(e) => set("height_mm", e.target.value)}
                placeholder="0"
                className={`factory-input pr-12 ${getFieldStatus("height")}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-factory-500 font-mono pointer-events-none">
                mm
              </span>
            </div>
            <p className="text-xs text-factory-600 mt-1">
              한계: ≤ 3,500 mm (M.P-Die)
            </p>
          </div>

          {/* Weight */}
          <div>
            <label className="factory-label">
              중량 Weight (kg)
              {data.shape === "SHELL" && (
                <span className="ml-2 text-amber-400 normal-case font-normal tracking-normal">
                  ⚠ SHELL 한계 적용
                </span>
              )}
            </label>
            <div className="relative">
              <input
                id="field-weight"
                type="number"
                min="0"
                step="1"
                value={data.weight_kg}
                onChange={(e) => set("weight_kg", e.target.value)}
                placeholder="0"
                className={`factory-input pr-12 ${getFieldStatus("weight")}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-factory-500 font-mono pointer-events-none">
                kg
              </span>
            </div>
            <p className="text-xs text-factory-600 mt-1 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-factory-500"></span>
              {data.od_mm && data.height_mm 
                ? "치수 기반 자동 산출됨 (Steel 7.85)" 
                : "치수 입력 시 자동 산출됩니다."}
              {data.shape === "SHELL" && " · SHELL 중량 한계 적용"}
            </p>
          </div>
        </div>

        {/* CAPA 검증 결과 */}
        <CapaWarningBadge results={capaResults} />
      </section>

      {/* ── 섹션 4: 열처리 ── */}
      <section className="factory-card p-6">
        <div className="section-header mb-5">
          <Thermometer className="w-4 h-4 text-factory-400" />
          열처리 조건 Heat Treatment
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="factory-label">냉각 매질 Cooling Media</label>
            <SearchableSelect
              id="field-ht-cooling"
              options={HT_COOLING_MEDIA as unknown as { value: string; label: string }[]}
              value={data.htCoolingMedia}
              onChange={(v) => set("htCoolingMedia", v as HtCoolingMedia)}
              placeholder="냉각 매질 선택..."
            />
          </div>
          <div>
            <label className="factory-label">열처리 유형 HT Type</label>
            <SearchableSelect
              id="field-ht-type"
              options={HT_TYPES as unknown as { value: string; label: string }[]}
              value={data.htType}
              onChange={(v) => set("htType", v as HtType)}
              placeholder="열처리 유형 선택..."
            />
          </div>
        </div>
      </section>

      {/* ── 섹션 5: 비고 ── */}
      <section className="factory-card p-6">
        <div className="section-header mb-5">
          <FlaskConical className="w-4 h-4 text-factory-400" />
          비고 / 특기사항
        </div>
        <textarea
          id="field-remarks"
          value={data.remarks}
          onChange={(e) => set("remarks", e.target.value)}
          placeholder="추가 주문 조건, 특이 사항 등을 입력하세요..."
          rows={4}
          className="factory-input resize-none"
        />
      </section>
    </div>
  );
}
