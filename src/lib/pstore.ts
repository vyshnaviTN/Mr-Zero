// Per-user namespaced localStorage. Every key is prefixed with the signed-in
// user's UID so two accounts on the same device never see each other's data.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

let _uid: string | null = null;
let _email: string | null = null;
let _ready = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data }) => {
    _uid = data.session?.user?.id ?? null;
    _email = data.session?.user?.email ?? null;
    _ready = true;
    notify();
  });
  supabase.auth.onAuthStateChange((_evt, session) => {
    _uid = session?.user?.id ?? null;
    _email = session?.user?.email ?? null;
    _ready = true;
    notify();
  });
}

export const getUid = () => _uid;
export const getEmail = () => _email;
export const isAuthReady = () => _ready;

export function useUid() {
  const [u, setU] = useState(_uid);
  const [ready, setReady] = useState(_ready);
  useEffect(() => {
    const fn = () => {
      setU(_uid);
      setReady(_ready);
    };
    listeners.add(fn);
    fn();
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return { uid: u, ready };
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
