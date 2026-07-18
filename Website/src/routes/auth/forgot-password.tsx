import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setEmailSent(true);
      toast.success("Password reset email sent successfully");
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      toast.error(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="neu p-8 md:p-12">
          {!emailSent ? (
            <>
              <div className="mb-8">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Forgot password</div>
                <h2 className="mt-1 font-display text-2xl font-semibold">Reset your password</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Email Address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="neu-inset w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="neu-accent w-full rounded-xl px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <button 
                    type="button" 
                    onClick={() => navigate("/")}
                    className="hover:text-foreground"
                  >
                    Remember your password? Sign in
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="neu-accent mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Check your email</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>
              <button
                onClick={() => navigate("/")}
                className="neu-accent w-full rounded-xl px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.99]"
              >
                Back to Login
              </button>
              <p className="mt-4 text-xs text-muted-foreground">
                Didn't receive the email?{" "}
                <button
                  onClick={() => {
                    setEmailSent(false);
                    handleSubmit(new Event('submit') as any);
                  }}
                  className="hover:text-foreground font-medium"
                >
                  Resend
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
