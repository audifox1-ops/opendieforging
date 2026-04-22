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
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export interface ForgingStep {
  id: string;
  stepName: string;
  targetDimension: string;
  temp_C: string;
  notes: string;
}

export interface SpecFormData {
  productName: string;
  shape: ForgingShape | "";
  material: MaterialStandard | "";
  ndtStandard: NdtStandard | "";
  ndtClass: string;
  od_mm: string;
  od_tol_plus: string;
  od_tol_minus: string;
  id_mm: string;
  id_tol_plus: string;
  id_tol_minus: string;
  height_mm: string;
  height_tol_plus: string;
  height_tol_minus: string;
  weight_kg: string;
  htCoolingMedia: HtCoolingMedia | "";
  htType: HtType | "";
  workingMethod: string;
  steps: ForgingStep[];
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
  od_mm: "", od_tol_plus: "", od_tol_minus: "",
  id_mm: "", id_tol_plus: "", id_tol_minus: "",
  height_mm: "", height_tol_plus: "", height_tol_minus: "",
  weight_kg: "", htCoolingMedia: "", htType: "", workingMethod: "", 
  steps: [], remarks: "",
};

export default function InputSmartForm({
  data, onChange, capaResults, onCapaChange,
}: InputSmartFormProps) {

  // 치수 변경 시 실시간 CAPA 검증 및 중량 자동 산출
  const runCapa = useCallback((formData: SpecFormData) => {
    const input: ForgingInput = {
      od_mm:     formData.od_mm     ? parseFloat(formData.od_mm)     : null,
      id_mm:     formData.id_mm     ? parseFloat(formData.id_mm)     : null,
      height_mm: formData.height_mm ? parseFloat(formData.height_mm) : null,
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
      shape:     (formData.shape as ForgingShape) || null,
    };

    // 중량 자동 산출 로직 (OD, Height, Shape가 모두 있을 때)
    if (input.od_mm && input.height_mm && input.shape) {
      const calculated = calculateTargetWeight({
        shape: input.shape,
        od_mm: input.od_mm,
        id_mm: input.id_mm,
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
  }, [data.od_mm, data.id_mm, data.height_mm, data.shape, runCapa]);

  function set<K extends keyof SpecFormData>(key: K, value: SpecFormData[K]) {
    onChange({ ...data, [key]: value });
  }

  const addStep = () => {
    const newStep: ForgingStep = {
      id: Math.random().toString(36).substr(2, 9),
      stepName: "", targetDimension: "", temp_C: "", notes: ""
    };
    set("steps", [...data.steps, newStep]);
  };

  const removeStep = (id: string) => {
    set("steps", data.steps.filter(s => s.id !== id));
  };

  const updateStep = (id: string, updates: Partial<ForgingStep>) => {
    set("steps", data.steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...data.steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    set("steps", newSteps);
  };

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
          <div className="space-y-2">
            <label className="factory-label">외경 OD (mm)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="field-od"
                  type="number"
                  value={data.od_mm}
                  onChange={(e) => set("od_mm", e.target.value)}
                  placeholder="0"
                  className={`factory-input pr-12 ${getFieldStatus("od")}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-factory-500 font-mono">mm</span>
              </div>
              <div className="flex flex-col gap-1 w-20">
                <div className="relative">
                  <input
                    type="text"
                    value={data.od_tol_plus}
                    onChange={(e) => set("od_tol_plus", e.target.value)}
                    placeholder="+0"
                    className="factory-input h-7 text-[10px] px-2"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={data.od_tol_minus}
                    onChange={(e) => set("od_tol_minus", e.target.value)}
                    placeholder="-0"
                    className="factory-input h-7 text-[10px] px-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ID (내경) */}
          {(data.shape === "RING" || data.shape === "SHELL" || data.shape === "PIPE") && (
            <div className="space-y-2">
              <label className="factory-label">내경 ID (mm)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="field-id"
                    type="number"
                    value={data.id_mm}
                    onChange={(e) => set("id_mm", e.target.value)}
                    placeholder="0"
                    className="factory-input pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-factory-500 font-mono">mm</span>
                </div>
                <div className="flex flex-col gap-1 w-20">
                  <input
                    type="text"
                    value={data.id_tol_plus}
                    onChange={(e) => set("id_tol_plus", e.target.value)}
                    placeholder="+0"
                    className="factory-input h-7 text-[10px] px-2"
                  />
                  <input
                    type="text"
                    value={data.id_tol_minus}
                    onChange={(e) => set("id_tol_minus", e.target.value)}
                    placeholder="-0"
                    className="factory-input h-7 text-[10px] px-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Height */}
          <div className="space-y-2">
            <label className="factory-label">높이 / 길이 Height (mm)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="field-height"
                  type="number"
                  value={data.height_mm}
                  onChange={(e) => set("height_mm", e.target.value)}
                  placeholder="0"
                  className={`factory-input pr-12 ${getFieldStatus("height")}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-factory-500 font-mono">mm</span>
              </div>
              <div className="flex flex-col gap-1 w-20">
                <input
                  type="text"
                  value={data.height_tol_plus}
                  onChange={(e) => set("height_tol_plus", e.target.value)}
                  placeholder="+0"
                  className="factory-input h-7 text-[10px] px-2"
                />
                <input
                  type="text"
                  value={data.height_tol_minus}
                  onChange={(e) => set("height_tol_minus", e.target.value)}
                  placeholder="-0"
                  className="factory-input h-7 text-[10px] px-2"
                />
              </div>
            </div>
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

      {/* ── 섹션 5: 작업 방식 ── */}
      <section className="factory-card p-6">
        <div className="section-header mb-5 text-factory-300 font-bold">
          <Zap className="w-4 h-4 text-factory-300" />
          작업 방식 (Working Method) — 소재 및 중량 기반
        </div>
        <textarea
          id="field-working-method"
          value={data.workingMethod}
          onChange={(e) => set("workingMethod", e.target.value)}
          placeholder="소재 특성 및 중량에 따른 단조 작업 지침을 입력하세요."
          rows={3}
          className="factory-input resize-none border-factory-500/30 focus:border-factory-400 bg-factory-900/40"
        />
      </section>

      {/* ── 섹션 6: 상세 단조 공정 (Sequence) ── */}
      <section className="factory-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="section-header !mb-0 text-factory-100 font-bold">
            상세 단조 공정 (Forging Sequence)
          </div>
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-factory-700 hover:bg-factory-600 text-factory-100 text-xs rounded-lg transition-colors border border-factory-500/30"
          >
            <Plus className="w-3.5 h-3.5" />
            공정 단계 추가
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-factory-900/60 text-factory-400 border-b border-factory-800">
                <th className="p-3 font-medium w-12 text-center">순서</th>
                <th className="p-3 font-medium w-40">공정명 (Step)</th>
                <th className="p-3 font-medium w-48">목표 치수 (Target)</th>
                <th className="p-3 font-medium w-32">온도 (°C)</th>
                <th className="p-3 font-medium">비고 및 주의사항</th>
                <th className="p-3 font-medium w-24 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-factory-800/50">
              {data.steps.map((step, index) => (
                <tr key={step.id} className="group hover:bg-factory-800/20 transition-colors">
                  <td className="p-3 text-center text-factory-500 font-mono">{index + 1}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={step.stepName}
                      onChange={(e) => updateStep(step.id, { stepName: e.target.value })}
                      placeholder="예: Upsetting"
                      className="factory-input py-1.5 bg-transparent border-transparent hover:border-factory-700 focus:bg-factory-900"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={step.targetDimension}
                      onChange={(e) => updateStep(step.id, { targetDimension: e.target.value })}
                      placeholder="예: OD 1200 / H 800"
                      className="factory-input py-1.5 bg-transparent border-transparent hover:border-factory-700 focus:bg-factory-900"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={step.temp_C}
                      onChange={(e) => updateStep(step.id, { temp_C: e.target.value })}
                      placeholder="1200"
                      className="factory-input py-1.5 bg-transparent border-transparent hover:border-factory-700 focus:bg-factory-900 font-mono"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={step.notes}
                      onChange={(e) => updateStep(step.id, { notes: e.target.value })}
                      placeholder="주의사항 입력..."
                      className="factory-input py-1.5 bg-transparent border-transparent hover:border-factory-700 focus:bg-factory-900"
                    />
                  </td>
                  <td className="p-2">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveStep(index, "up")} className="p-1 text-factory-500 hover:text-factory-300"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => moveStep(index, "down")} className="p-1 text-factory-500 hover:text-factory-300"><ArrowDown className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeStep(step.id)} className="p-1 text-red-400/70 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.steps.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-factory-600 italic">
                    등록된 공정 단계가 없습니다. '공정 단계 추가' 버튼을 눌러 작업을 구성하세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 섹션 7: 비고 ── */}
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
