"use client";

import { useState } from "react";
import { Sparkles, MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";
import { generateDraftFromChat } from "@/lib/aiInference";
import type { SpecFormData } from "@/components/spec-form/InputSmartForm";

interface AiDraftAssistantProps {
  onApply: (draft: Partial<SpecFormData>) => void;
}

export default function AiDraftAssistant({ onApply }: AiDraftAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setStatus("idle");
    try {
      const draft = await generateDraftFromChat(prompt);
      onApply(draft);
      setStatus("success");
      setPrompt("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("Draft failed:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    "A105 소재의 외경 1000, 내경 500, 높이 800 링",
    "F22 소재의 200톤급 대형 샤프트 설계",
    "F91 고압용 파이프, 두께 100mm 기준",
  ];

  return (
    <div className="factory-card overflow-hidden bg-gradient-to-br from-factory-900 to-factory-800 border-factory-500/30">
      <div className="px-6 py-4 border-b border-factory-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-factory-100">AI 스마트 초안 어시스턴트</h2>
            <p className="text-[10px] text-factory-400">대화하듯 입력하면 시방서가 자동 구성됩니다.</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 316L 소재의 대형 플랜지 하나 설계해줘. 외경은 2500mm 정도야."
            rows={3}
            className="factory-input w-full pr-12 resize-none bg-factory-900/60 border-factory-700/50 focus:border-blue-500/50"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="absolute right-3 bottom-3 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => setPrompt(ex)}
              className="text-[10px] px-2.5 py-1.5 rounded-full bg-factory-800 border border-factory-700 text-factory-400 hover:text-factory-200 hover:border-factory-600 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>

        {status === "success" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-900/20 border border-green-500/30 text-xs text-green-400 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            AI 초안이 성공적으로 폼에 적용되었습니다!
          </div>
        )}
        
        {status === "error" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-xs text-red-400 animate-fade-in">
            생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </div>
        )}
      </div>
    </div>
  );
}
