import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import api from "./api";

export type Role = "admin" | "asset_manager" | "department_head" | "employee";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatar?: string;
}

const KEY = "assetflow.session";
const THEME_KEY = "assetflow.theme";

interface Ctx {
  user: SessionUser | null;
  login: (u: SessionUser, token?: string) => void;
  logout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  hydrated: boolean;
}

const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const token = localStorage.getItem('assetflow_token');
      if (raw) setUser(JSON.parse(raw));
      if (token) api.setToken(token);
      const t = (localStorage.getItem(THEME_KEY) as "light" | "dark" | null) ?? "dark";
      setTheme(t);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme, hydrated]);

  const login = (u: SessionUser, token?: string) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
    if (token) {
      api.setToken(token);
      localStorage.setItem('assetflow_token', token);
    }
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    localStorage.removeItem('assetflow_token');
    api.clearToken();
    setUser(null);
  };
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <SessionCtx.Provider value={{ user, login, logout, theme, toggleTheme, hydrated }}>
      {children}
    </SessionCtx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
