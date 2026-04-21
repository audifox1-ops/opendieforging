"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Factory, ChevronRight, AlertCircle } from "lucide-react";
import { safeStorage } from "@/lib/storage";

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 이미 이름이 저장되어 있으면 대시보드로 이동
  useEffect(() => {
    const stored = safeStorage.get("session", "tw_operator_name");
    if (stored) router.replace("/dashboard");
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (trimmed.length < 2) {
      setError("이름은 2자 이상 입력해 주세요.");
      return;
    }
    setIsLoading(true);
    safeStorage.set("session", "tw_operator_name", trimmed);
    safeStorage.set("session", "tw_login_time", new Date().toISOString());
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* 배경 그래픽 */}
      <div className="absolute inset-0 bg-factory-gradient" />
      <div className="absolute inset-0">
        {/* 그리드 패턴 */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(30,95,170,1) 1px, transparent 1px), linear-gradient(90deg, rgba(30,95,170,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* 글로우 효과 */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-factory-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-factory-800/20 rounded-full blur-3xl" />
      </div>

      {/* 메인 카드 */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* 로고 섹션 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-factory-600/20 border border-factory-500/30 mb-5 shadow-factory-glow">
            <Factory className="w-10 h-10 text-factory-300" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.3em] text-factory-400 uppercase">
              Taewoong Co., Ltd.
            </p>
            <h1 className="text-3xl font-bold text-white leading-tight">
              15,000T 단조
              <span className="block text-factory-300 text-2xl font-semibold mt-0.5">
                시방서 관리 시스템
              </span>
            </h1>
            <p className="text-sm text-factory-400 mt-2">
              Open-Die Forging Press Edition
            </p>
          </div>
        </div>

        {/* 로그인 카드 */}
        <div className="factory-card p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-factory-100">
              작업자 확인
            </h2>
            <p className="text-sm text-factory-400 mt-1">
              시스템 접속을 위해 이름을 입력해 주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="operator-name" className="factory-label">
                작업자 이름
              </label>
              <input
                id="operator-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="예: 홍길동"
                autoFocus
                autoComplete="name"
                className={`factory-input ${error ? "error" : ""}`}
                disabled={isLoading}
                maxLength={30}
              />
              {error && (
                <div className="flex items-center gap-1.5 mt-2 text-red-400 text-xs animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading || !name.trim()}
              className="btn-primary w-full text-base py-3"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>접속 중...</span>
                </>
              ) : (
                <>
                  <span>시스템 접속</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* 하단 정보 */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-xs text-factory-600">
            주식회사 태웅 | Smart Factory Division
          </p>
          <p className="text-xs text-factory-700">
            15,000T Open-Die Forging Press · CAPA Validation System v1.0
          </p>
        </div>

        {/* 프레스 스펙 하이라이트 */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "프레스 용량", value: "15,000T" },
            { label: "최대 경간", value: "3,500mm" },
            { label: "SHELL 한계", value: "100,000kg" },
          ].map((spec) => (
            <div
              key={spec.label}
              className="text-center p-3 rounded-lg bg-factory-900/40 border border-factory-800/50"
            >
              <div className="text-base font-bold text-factory-300">
                {spec.value}
              </div>
              <div className="text-xs text-factory-500 mt-0.5">{spec.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
