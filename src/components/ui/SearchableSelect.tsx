"use client";

import { useState, useCallback } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = "선택 또는 검색...",
  disabled = false,
  hasError = false,
}: SearchableSelectProps) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState("");

  const selected = options.find((o) => o.value === value);
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleSelect = useCallback((val: string) => {
    onChange(val);
    setOpen(false);
    setQuery("");
  }, [onChange]);

  return (
    <div className={cn("relative", open && "z-30")} id={id}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "factory-input flex items-center justify-between text-left cursor-pointer",
          hasError && "error",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={selected ? "text-factory-100" : "text-factory-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-factory-400 flex-shrink-0 ml-2 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setQuery(""); }} />
          <div
            className="absolute z-50 mt-1 w-full rounded-lg border border-factory-700/50 bg-factory-900 shadow-card-dark overflow-hidden animate-fade-in"
            style={{ maxHeight: 260 }}
          >
            {/* 검색 */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-factory-800/60">
              <Search className="w-3.5 h-3.5 text-factory-500 flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색..."
                className="flex-1 bg-transparent text-sm text-factory-200 placeholder:text-factory-600 outline-none"
              />
            </div>

            {/* 옵션 목록 */}
            <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-factory-500 text-center">
                  검색 결과 없음
                </div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm transition-colors duration-100",
                      opt.value === value
                        ? "bg-factory-700/60 text-factory-100 font-medium"
                        : "text-factory-300 hover:bg-factory-800/60 hover:text-factory-100"
                    )}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
