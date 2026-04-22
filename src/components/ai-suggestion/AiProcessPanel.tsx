"use client";

import { useState } from "react";
import {
  Thermometer, Clock, Zap, AlertCircle,
  ChevronDown, ChevronUp, Loader2, Sparkles, Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiSuggestion } from "@/constants/mockAiData";
import type { AiInferenceResult } from "@/lib/aiInference";

interface AiProcessPanelProps {
  result: AiInferenceResult | null;
  isLoading: boolean;
  onRequest: () => void;
  canRequest: boolean;
  onApply?: (suggestion: AiSuggestion) => void;
}

export default function AiProcessPanel({
  result, isLoading, onRequest, canRequest, onApply,
}: AiProcessPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const s = result?.suggestion;

  return (
    <section className="factory-card overflow-hidden">
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-factory-800/50 cursor-pointer select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-factory-600/20 border border-factory-500/30">
            <Sparkles className="w-4 h-4 text-factory-300" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-factory-100">
              AI 공정 추론 엔진
            </h2>
            <p className="text-xs text-factory-500">
              Powered by Gemini 2.0 Flash
            </p>
          </div>
          {result && (
            <span
              className={cn(
                "ml-2 px-2 py-0.5 text-xs rounded-full border font-medium",
                result.source === "gemini"
                  ? "bg-factory-700/40 text-factory-300 border-factory-600/40"
                  : "bg-amber-900/30 text-amber-400 border-amber-700/30"
              )}
            >
              {result.source === "gemini" ? "Gemini Live" : "Mock Fallback"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!result && !isLoading && (
            <button
              id="btn-ai-suggest"
              onClick={(e) => { e.stopPropagation(); onRequest(); }}
              disabled={!canRequest}
              className="btn-primary text-xs px-4 py-2"
            >
              <Zap className="w-3.5 h-3.5" />
              추론 실행
            </button>
          )}
          {result && !isLoading && (
            <button
              id="btn-ai-refresh"
              onClick={(e) => { e.stopPropagation(); onRequest(); }}
              className="btn-secondary text-xs px-3 py-2"
            >
              <Zap className="w-3.5 h-3.5" />
              재추론
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-factory-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-factory-400" />
          )}
        </div>
      </div>

      {/* 바디 */}
      {expanded && (
        <div className="px-6 py-5">
          {/* 로딩 */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 animate-fade-in">
              <Loader2 className="w-8 h-8 text-factory-400 animate-spin" />
              <p className="text-sm text-factory-400">Gemini AI 분석 중...</p>
              <p className="text-xs text-factory-600">단조 공정 최적화 파라미터 추론 중</p>
            </div>
          )}

          {/* 초기 상태 */}
          {!isLoading && !result && (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              {!canRequest ? (
                <>
                  <AlertCircle className="w-8 h-8 text-factory-600" />
                  <p className="text-sm text-factory-500">
                    소재 규격과 치수를 입력한 후<br />
                    AI 추론을 실행하세요.
                  </p>
                </>
              ) : (
                <>
                  <Sparkles className="w-8 h-8 text-factory-500" />
                  <p className="text-sm text-factory-400">
                    입력 데이터 준비 완료 — AI 추론을 실행하세요.
                  </p>
                  <button
                    id="btn-ai-suggest-center"
                    onClick={onRequest}
                    className="btn-primary mt-2"
                  >
                    <Zap className="w-4 h-4" />
                    AI 공정 추론 실행
                  </button>
                </>
              )}
            </div>
          )}

          {/* 결과 */}
          {!isLoading && s && (
            <div className="space-y-5 animate-fade-in">
              {/* 소스 표시 */}
              {result?.source === "mock" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-950/30 border border-amber-700/30 text-xs text-amber-400">
                  <Database className="w-3.5 h-3.5 flex-shrink-0" />
                  Gemini API 키 미설정 — Mock 데이터 사용 중 (.env.local에 GEMINI_API_KEY 추가 필요)
                </div>
              )}

              {/* 핵심 수치 카드들 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  icon={<Thermometer className="w-4 h-4" />}
                  label="단조 온도"
                  value={`${s.forgingTempMin_C}°C`}
                  sub={`~ ${s.forgingTempMax_C}°C`}
                  color="blue"
                />
                <StatCard
                  icon={<Clock className="w-4 h-4" />}
                  label="가열 속도"
                  value={`${s.heatingRate_mmPerHr}`}
                  sub="mm / hr"
                  color="teal"
                />
                <StatCard
                  icon={<Clock className="w-4 h-4" />}
                  label="유지 시간"
                  value={`${s.soakingTime_hrPer100mm}`}
                  sub="hr / 100mm"
                  color="purple"
                />
                <StatCard
                  icon={<Zap className="w-4 h-4" />}
                  label="열처리"
                  value={s.heatTreatment.quenchTemp_C ? `${s.heatTreatment.quenchTemp_C}°C` : "정규화"}
                  sub={s.heatTreatment.temperTemp_C ? `템퍼 ${s.heatTreatment.temperTemp_C}°C` : ""}
                  color="orange"
                />
              </div>

              {/* 작업 방식 제안 */}
              <div className="p-4 rounded-lg bg-factory-900/60 border border-factory-500/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-factory-300 uppercase tracking-wide">
                    작업 방식 제안 (Working Method)
                  </p>
                  {onApply && (
                    <button
                      onClick={() => onApply(s)}
                      className="text-[10px] px-2 py-1 bg-factory-700 hover:bg-factory-600 text-factory-100 rounded transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      폼에 적용
                    </button>
                  )}
                </div>
                <p className="text-sm text-factory-100 leading-relaxed">
                  {s.workingMethod}
                </p>
              </div>

              {/* 열처리 설명 */}
              <div className="p-4 rounded-lg bg-factory-900/40 border border-factory-800/40">
                <p className="text-xs font-semibold text-factory-400 uppercase tracking-wide mb-1">
                  열처리 사이클
                </p>
                <p className="text-sm text-factory-200">{s.heatTreatment.description}</p>
              </div>

              {/* 주의사항 */}
              {s.notes?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-factory-400 uppercase tracking-wide">
                    공정 주의사항
                  </p>
                  <ul className="space-y-1.5">
                    {s.notes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-factory-300">
                        <span className="text-factory-500 mt-0.5 flex-shrink-0">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function StatCard({
  icon, label, value, sub, color,
}: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue:   "text-factory-300 bg-factory-700/30 border-factory-600/30",
    teal:   "text-teal-300 bg-teal-900/20 border-teal-700/30",
    purple: "text-purple-300 bg-purple-900/20 border-purple-700/30",
    orange: "text-orange-300 bg-orange-900/20 border-orange-700/30",
  };
  return (
    <div className={cn("p-4 rounded-lg border", colorMap[color] ?? colorMap.blue)}>
      <div className="flex items-center gap-1.5 mb-2 opacity-70">{icon}<span className="text-xs">{label}</span></div>
      <div className="text-xl font-bold font-mono">{value}</div>
      {sub && <div className="text-xs opacity-60 mt-0.5">{sub}</div>}
    </div>
  );
}
