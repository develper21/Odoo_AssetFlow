import { NeuCard, PageHeader } from "@/components/layout/ui";
import { useSession } from "@/lib/session";

function ProfilePage() {
  const { user } = useSession();
  if (!user) return null;
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Your account and preferences." />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <NeuCard className="text-center md:col-span-1">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-primary/20 font-display text-3xl font-semibold text-primary">
            {user.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
          </div>
          <h3 className="mt-4 text-lg font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">{user.department}</p>
        </NeuCard>
        <NeuCard className="md:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Account settings</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { l: "Full name", v: user.name },
              { l: "Email", v: user.email },
              { l: "Department", v: user.department },
              { l: "Role", v: user.role.replace("_", " ") },
            ].map((f) => (
              <label key={f.l} className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{f.l}</span>
                <input defaultValue={f.v} className="neu-inset w-full rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none" />
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button className="neu-accent rounded-xl px-4 py-2.5 text-sm font-semibold">Save changes</button>
          </div>
        </NeuCard>
      </div>
    </div>
  );
}

export default ProfilePage;
