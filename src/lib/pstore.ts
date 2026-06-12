import { useAuth } from "@clerk/tanstack-react-start";
import { useEffect } from "react";

let _uid: string | null = null;

// Expose the getter for non-react code like the localStorage helpers below.
// For React components, they should use `useUid()` which uses Clerk under the hood.
export const getUid = () => _uid;
export const isAuthReady = () => true;

export function useUid() {
  const { userId, isLoaded } = useAuth();
  
  useEffect(() => {
    _uid = userId ?? null;
  }, [userId]);

  return { uid: userId, ready: isLoaded };
}

const k = (key: string) => (_uid ? `u:${_uid}::${key}` : null);

export const pget = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  const kk = k(key);
  if (!kk) return null;
  return localStorage.getItem(kk);
};

export const pset = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  const kk = k(key);
  if (!kk) return;
  localStorage.setItem(kk, value);
};

export const premove = (key: string) => {
  if (typeof window === "undefined") return;
  const kk = k(key);
  if (!kk) return;
  localStorage.removeItem(kk);
};

// Convenience: JSON helpers.
export const pgetJSON = <T,>(key: string, fallback: T): T => {
  const raw = pget(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};
export const psetJSON = (key: string, value: unknown) =>
  pset(key, JSON.stringify(value));

// Wipe this user's namespace (sign-out housekeeping).
export const pclearAll = () => {
  if (typeof window === "undefined" || !_uid) return;
  const prefix = `u:${_uid}::`;
  const toDel: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) toDel.push(key);
  }
  toDel.forEach((k) => localStorage.removeItem(k));
};
