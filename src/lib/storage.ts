/**
 * 브라우저 저장소(localStorage, sessionStorage) 안전 접근 유틸리티
 * ─────────────────────────────────────────────────────────────
 * Next.js SSR 환경에서 저장소 접근 시 발생하는 에러를 방지합니다.
 */

export const safeStorage = {
  get: (type: "local" | "session", key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      const storage = type === "local" ? window.localStorage : window.sessionStorage;
      if (storage && typeof storage.getItem === "function") {
        return storage.getItem(key);
      }
    } catch (e) {
      console.warn(`[safeStorage] Failed to get ${key} from ${type}Storage`, e);
    }
    return null;
  },

  set: (type: "local" | "session", key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      const storage = type === "local" ? window.localStorage : window.sessionStorage;
      if (storage && typeof storage.setItem === "function") {
        storage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`[safeStorage] Failed to set ${key} in ${type}Storage`, e);
    }
  },

  remove: (type: "local" | "session", key: string): void => {
    if (typeof window === "undefined") return;
    try {
      const storage = type === "local" ? window.localStorage : window.sessionStorage;
      if (storage && typeof storage.removeItem === "function") {
        storage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[safeStorage] Failed to remove ${key} from ${type}Storage`, e);
    }
  },
};
