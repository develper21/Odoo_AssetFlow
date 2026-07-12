import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSession, type Role } from "@/lib/session";
import { DEMO_USERS } from "@/lib/mock-data";
import { Boxes, LayoutDashboard, ShieldCheck, User, Wrench, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

const ROLES: { role: Role; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { role: "admin", label: "Admin", desc: "Organization setup, employees, audits, reports.", icon: ShieldCheck },
  { role: "asset_manager", label: "Asset Manager", desc: "Registry, allocations, maintenance, bookings.", icon: Boxes },
  { role: "dept_head", label: "Department Head", desc: "Department assets, approvals, bookings.", icon: LayoutDashboard },
  { role: "employee", label: "Employee", desc: "My assets, requests, bookings, notifications.", icon: User },
];

function LoginPage() {
  const { login, user, hydrated, theme, toggleTheme } = useSession();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (hydrated && user) navigate({ to: "/dashboard" });
  }, [hydrated, user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const demo = DEMO_USERS.find((u) => u.role === selected)!;
    login({ ...demo, email: email || demo.email });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        {/* Left: brand */}
        <div className="neu relative flex flex-col justify-between p-8 md:p-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="neu-accent grid h-11 w-11 place-items-center font-bold">AF</div>
              <div>
                <div className="font-display text-xl font-semibold">AssetFlow</div>
                <div className="text-xs text-muted-foreground">Resource OS</div>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="neu-sm grid h-10 w-10 place-items-center"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          <div className="my-10 space-y-5">
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
              One workspace for every asset, booking, and audit.
            </h1>
            <p className="max-w-md text-muted-foreground">
              Register hardware, allocate to teams, book shared resources, track
              maintenance, and close audit cycles — from a single, calm interface.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { k: "Assets", v: "1,284" },
              { k: "Utilization", v: "87%" },
              { k: "Uptime", v: "99.9%" },
            ].map((s) => (
              <div key={s.k} className="neu-inset p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.k}</div>
                <div className="mt-1 font-display text-xl font-semibold">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="neu p-8 md:p-12">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Sign in</div>
            <h2 className="mt-1 font-display text-2xl font-semibold">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a demo role and continue. No password needed.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = selected === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => setSelected(r.role)}
                  className={cn(
                    "p-4 text-left transition-all",
                    active ? "neu-accent" : "neu-sm hover:opacity-90",
                  )}
                >
                  <Icon className="mb-2 h-5 w-5" />
                  <div className="text-sm font-semibold">{r.label}</div>
                  <div className={cn("mt-1 text-xs", active ? "opacity-90" : "text-muted-foreground")}>
                    {r.desc}
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={DEMO_USERS.find((u) => u.role === selected)?.email}
                className="neu-inset w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="neu-inset w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
              />
            </label>

            <button
              type="submit"
              className="neu-accent w-full rounded-xl px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.99]"
            >
              Continue as {ROLES.find((r) => r.role === selected)?.label}
            </button>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <button type="button" className="hover:text-foreground">Forgot password?</button>
              <button type="button" className="hover:text-foreground">
                <Wrench className="mr-1 inline h-3 w-3" />
                Employee sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
