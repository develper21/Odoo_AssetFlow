import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { User, ArrowLeft } from "lucide-react";
import { authApi, departmentsApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    role: "employee" as const,
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await departmentsApi.getAll();
        setDepartments(data.departments || []);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        role: formData.role,
      });
      toast.success("Registration successful! Please sign in.");
      navigate("/");
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast.error(error.message || "Registration failed. Please try again.");
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
              Join your team's asset management workspace.
            </h1>
            <p className="max-w-md text-muted-foreground">
              Create your account to start managing assets, bookings, and audits with your organization.
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
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Sign up</div>
            <h2 className="mt-1 font-display text-2xl font-semibold">Create your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Join your organization's asset management system.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">First Name</span>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                  className="neu-inset w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Last Name</span>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                  className="neu-inset w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                className="neu-inset w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Department</span>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={loadingDepartments}
                className="neu-inset w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
              >
                <option value="">Select department</option>
                {departments.map((dept: any) => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Password</span>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="neu-inset w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Confirm Password</span>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="neu-inset w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="neu-accent w-full rounded-xl px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <button 
                type="button" 
                onClick={() => navigate("/")}
                className="hover:text-foreground"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
