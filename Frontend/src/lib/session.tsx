import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "asset_manager" | "dept_head" | "employee";

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
  login: (u: SessionUser) => void;
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
      if (raw) setUser(JSON.parse(raw));
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

  const login = (u: SessionUser) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };
  const logout = () => {
    localStorage.removeItem(KEY);
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
