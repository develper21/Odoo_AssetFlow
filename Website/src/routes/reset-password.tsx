import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/reset-password" });
  const token = search.token as string;
  
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or expired reset token");
      navigate({ to: "/forgot-password" as any });
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setResetSuccess(true);
      toast.success("Password reset successfully");
    } catch (error: any) {
      console.error('Reset password failed:', error);
      toast.error(error.message || "Failed to reset password. The link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          {/* Left: brand */}
          <div className="neu relative flex flex-col justify-between p-8 md:p-12">
            <div className="flex items-center gap-3">
              <div className="neu-accent grid h-11 w-11 place-items-center font-bold">AF</div>
              <div>
                <div className="font-display text-xl font-semibold">AssetFlow</div>
                <div className="text-xs text-muted-foreground">Resource OS</div>
              </div>
            </div>

            <div className="my-10 space-y-5">
              <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
                Reset your password securely.
              </h1>
              <p className="max-w-md text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password and get you back into your workspace.
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
          <div className="neu p-8 md:p-12 text-center">
            <div className="text-red-500 mb-4">
              <Lock className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Invalid Reset Link</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
            <button
              onClick={() => navigate({ to: "/forgot-password" as any })}
              className="neu-accent w-full rounded-xl px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.99]"
            >
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        {/* Left: brand */}
        <div className="neu relative flex flex-col justify-between p-8 md:p-12">
          <div className="flex items-center gap-3">
            <div className="neu-accent grid h-11 w-11 place-items-center font-bold">AF</div>
            <div>
              <div className="font-display text-xl font-semibold">AssetFlow</div>
              <div className="text-xs text-muted-foreground">Resource OS</div>
            </div>
          </div>

          <div className="my-10 space-y-5">
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
              Create your new password.
            </h1>
            <p className="max-w-md text-muted-foreground">
              Enter your new password below. Make sure it's at least 6 characters long for security.
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
        {!resetSuccess ? (
          <div className="neu p-8 md:p-12">
            <div className="mb-8">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Reset password</div>
              <h2 className="mt-1 font-display text-2xl font-semibold">Create new password</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your new password below. Make sure it's at least 6 characters long.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">New Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="neu-inset w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Confirm New Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="neu-inset w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="neu-accent w-full rounded-xl px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button 
                  type="button" 
                  onClick={() => navigate({ to: "/" as any })}
                  className="hover:text-foreground"
                >
                  Remember your password? Sign in
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="neu p-8 md:p-12 text-center">
            <div className="neu-accent mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Password Reset Successful</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate({ to: "/" as any })}
              className="neu-accent w-full rounded-xl px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.99]"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
