"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, ArrowLeft, Send, CheckCircle, Loader2 } from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import InputSmartForm, { INITIAL_FORM_DATA, type SpecFormData } from "@/components/spec-form/InputSmartForm";
import AiProcessPanel from "@/components/ai-suggestion/AiProcessPanel";
import AiDraftAssistant from "@/components/ai-suggestion/AiDraftAssistant";
import { isCapaPassed, type CapaValidationResult } from "@/lib/capaValidator";
import { inferProcess, type AiInferenceResult } from "@/lib/aiInference";
import { MATERIAL_STANDARDS, FORGING_SHAPES, HT_TYPES, HT_COOLING_MEDIA } from "@/constants/pressLimits";
import { safeStorage } from "@/lib/storage";
import { specService } from "@/lib/supabase/specService";

function generateDocNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `TW-${y}${m}${d}-${rand}`;
}

function NewSpecContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const cloneFrom    = searchParams.get("cloneFrom");

  const [formData, setFormData]       = useState<SpecFormData>(INITIAL_FORM_DATA);
  const [capaResults, setCapaResults] = useState<CapaValidationResult[]>([]);
  const [aiResult, setAiResult]       = useState<AiInferenceResult | null>(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [saveStatus, setSaveStatus]   = useState<"idle" | "saving" | "saved">("idle");
  const [isCloning, setIsCloning]     = useState(false);
  const docNumber = useState(() => generateDocNumber())[0];

  // 복제 데이터 로딩 로직
  useEffect(() => {
    if (cloneFrom) {
      async function loadClone() {
        setIsCloning(true);
        try {
          if (!cloneFrom) return;
          const original = await specService.getSpecById(cloneFrom);
          if (original) {
            setFormData(original.form_data);
            if (original.ai_suggestion) {
              setAiResult({ source: "mock", suggestion: original.ai_suggestion });
            }
          }
        } catch (err) {
          console.error("복제 로딩 실패:", err);
        } finally {
          setIsCloning(false);
        }
      }
      loadClone();
    }
  }, [cloneFrom]);

  const canRequestAi =
    formData.material !== "" &&
    (formData.od_mm !== "" || formData.height_mm !== "" || formData.weight_kg !== "");

  const capaOk   = isCapaPassed(capaResults);
  const hasError = capaResults.length > 0 && !capaOk;

  const handleAiRequest = useCallback(async () => {
    setAiLoading(true);
    setAiResult(null);
    const result = await inferProcess({
      material:       formData.material,
      shape:          formData.shape,
      od_mm:          formData.od_mm     ? parseFloat(formData.od_mm)     : null,
      height_mm:      formData.height_mm ? parseFloat(formData.height_mm) : null,
      weight_kg:      formData.weight_kg ? parseFloat(formData.weight_kg) : null,
      htType:         formData.htType,
      htCoolingMedia: formData.htCoolingMedia,
    });
    setAiResult(result);
    setAiLoading(false);
  }, [formData]);

  async function handleSave(status: "DRAFTING" | "REVIEW_REQUESTED") {
    if (hasError) return;
    setSaveStatus("saving");

    try {
      const operator = safeStorage.get("session", "tw_operator_name") ?? "Unknown";
      
      await specService.createSpec({
        doc_number: docNumber,
        product_name: formData.productName,
        status,
        current_revision: 1,
        form_data: formData,
        ai_suggestion: aiResult?.suggestion ?? null,
        created_by: operator,
      });

      setSaveStatus("saved");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      console.error("저장 실패:", err);
      setSaveStatus("idle");
      alert("시방서 저장 중 오류가 발생했습니다. DB 설정을 확인해 주세요.");
    }
  }

  const materialLabel  = MATERIAL_STANDARDS.find((m) => m.value === formData.material)?.label ?? "";
  const shapeLabel     = FORGING_SHAPES.find((s) => s.value === formData.shape)?.label ?? "";
  const htTypeLabel    = HT_TYPES.find((h) => h.value === formData.htType)?.label ?? "";
  const htCoolLabel    = HT_COOLING_MEDIA.find((h) => h.value === formData.htCoolingMedia)?.label ?? "";

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <button
              id="btn-back"
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-xs text-factory-500 hover:text-factory-300 mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              돌아가기
            </button>
            <h1 className="text-2xl font-bold text-factory-100 flex items-center gap-2">
              신규 시방서 작성
              {isCloning && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-900/40 border border-amber-600/30 text-[10px] text-amber-300 animate-pulse">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  복제 중...
                </span>
              )}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-factory-400">문서 번호:</span>
              <span className="text-sm font-mono font-semibold text-factory-200 bg-factory-900/60 px-2 py-0.5 rounded border border-factory-700/40 shadow-sm">
                {docNumber}
              </span>
              <span className="status-badge drafting">작성 중 · Rev.1</span>
            </div>
          </div>

          {/* 저장 버튼 그룹 */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-save-draft"
              onClick={() => handleSave("DRAFTING")}
              disabled={hasError || saveStatus !== "idle"}
              className="btn-secondary"
            >
              {saveStatus === "saving" ? (
                <div className="w-4 h-4 border-2 border-factory-400/30 border-t-factory-400 rounded-full animate-spin" />
              ) : saveStatus === "saved" ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saveStatus === "saved" ? "저장 완료" : "임시 저장"}
            </button>
            <button
              id="btn-submit-review"
              onClick={() => handleSave("REVIEW_REQUESTED")}
              disabled={hasError || !formData.productName || saveStatus !== "idle"}
              className="btn-primary"
            >
              <Send className="w-4 h-4" />
              검토 요청
            </button>
          </div>
        </div>

        {/* CAPA 전체 경고 배너 */}
        {hasError && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-sm text-red-300 animate-fade-in">
            ⛔ <strong>CAPA 검증 실패</strong> — 아래 치수를 수정하지 않으면 저장할 수 없습니다.
          </div>
        )}

        {/* AI 스마트 어시스턴트 (최상단) */}
        <AiDraftAssistant
          onApply={(draft) => {
            setFormData((prev) => ({
              ...prev,
              ...draft,
              // 문자열로 올 수 있는 숫자 필드 보정 (API 응답에 따라)
              od_mm: draft.od_mm?.toString() ?? prev.od_mm,
              id_mm: draft.id_mm?.toString() ?? prev.id_mm,
              height_mm: draft.height_mm?.toString() ?? prev.height_mm,
            }));
          }}
        />

        {/* 스마트 입력 폼 */}
        <InputSmartForm
          data={formData}
          onChange={setFormData}
          capaResults={capaResults}
          onCapaChange={setCapaResults}
        />

        {/* AI 공정 추론 패널 */}
        <AiProcessPanel
          result={aiResult}
          isLoading={aiLoading}
          onRequest={handleAiRequest}
          canRequest={canRequestAi}
          onApply={(s) => setFormData(prev => ({ ...prev, workingMethod: s.workingMethod }))}
        />

        {/* 요약 미리보기 */}
        {formData.productName && (
          <section className="factory-card p-6 animate-fade-in">
            <div className="section-header mb-4">문서 요약 미리보기</div>
            <table className="data-table w-full">
              <tbody>
                {[
                  ["문서 번호", docNumber],
                  ["제품명", formData.productName],
                  ["형상", shapeLabel],
                  ["소재/규격", materialLabel],
                  ["OD × Height", `${formData.od_mm || "-"} mm × ${formData.height_mm || "-"} mm`],
                  ["중량", formData.weight_kg ? `${Number(formData.weight_kg).toLocaleString()} kg` : "-"],
                  ["열처리", `${htTypeLabel} / ${htCoolLabel}`],
                  ["CAPA 상태", capaResults.length === 0 ? "미검증" : capaOk ? "✅ 통과" : "⛔ 초과"],
                  ["AI 추론", aiResult ? (aiResult.source === "gemini" ? "Gemini Live" : "Mock Fallback") : "미실행"],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="text-factory-400 font-medium w-40">{k}</td>
                    <td className="text-factory-100">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}

export default function NewSpecPage() {
  return (
    <Suspense fallback={
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-factory-800 border-t-factory-500 rounded-full animate-spin" />
        </div>
      </DashboardShell>
    }>
      <NewSpecContent />
    </Suspense>
  );
}
