import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Plus, QrCode, Download } from "lucide-react";
import { NeuCard, PageHeader, Badge, toneForStatus } from "@/components/app/ui";
import { ASSETS, CATEGORIES, type AssetStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/assets")({
  component: AssetsPage,
});

const STATUSES: (AssetStatus | "All")[] = ["All", "Available", "Allocated", "Maintenance", "Retired"];

function AssetsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [cat, setCat] = useState<string>("All");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    return ASSETS.filter((a) => {
      if (status !== "All" && a.status !== status) return false;
      if (cat !== "All" && a.category !== cat) return false;
      if (q && !`${a.name} ${a.tag} ${a.assignee ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, status, cat]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Registry"
        subtitle={`${filtered.length} of ${ASSETS.length} assets`}
        actions={
          <>
            <button className="neu-sm inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm" onClick={() => toast("Scanning QR…")}>
              <QrCode className="h-4 w-4" /> Scan
            </button>
            <button className="neu-sm inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm" onClick={() => toast.success("Export queued")}>
              <Download className="h-4 w-4" /> Export
            </button>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" /> Register Asset
            </button>
          </>
        }
      />

      {showForm && (
        <NeuCard>
          <h3 className="mb-4 text-lg font-semibold">Register a new asset</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Asset registered (mock)");
              setShowForm(false);
            }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {[
              { l: "Asset tag", p: "AF-1050" },
              { l: "Name", p: "MacBook Pro 16" },
              { l: "Category", p: "Laptops" },
              { l: "Department", p: "Engineering" },
              { l: "Purchase date", p: "2026-07-12" },
              { l: "Value (USD)", p: "2499" },
            ].map((f) => (
              <label key={f.l} className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{f.l}</span>
                <input placeholder={f.p} className="neu-inset w-full rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none" />
              </label>
            ))}
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="neu-sm rounded-xl px-4 py-2.5 text-sm">Cancel</button>
              <button type="submit" className="neu-accent rounded-xl px-4 py-2.5 text-sm font-semibold">Save asset</button>
            </div>
          </form>
        </NeuCard>
      )}

      <NeuCard>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, tag or assignee…"
            className="neu-inset min-w-[220px] flex-1 rounded-xl bg-transparent px-4 py-2.5 text-sm outline-none"
          />
          <div className="flex items-center gap-2 text-xs">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "rounded-full px-3 py-1.5 transition-colors",
                  status === s ? "neu-accent font-semibold" : "neu-sm text-muted-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="neu-sm rounded-xl bg-transparent px-3 py-2 text-sm outline-none"
          >
            <option>All</option>
            {CATEGORIES.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 pr-3">Tag</th>
                <th className="py-3 pr-3">Name</th>
                <th className="py-3 pr-3">Category</th>
                <th className="py-3 pr-3">Department</th>
                <th className="py-3 pr-3">Assignee</th>
                <th className="py-3 pr-3">Value</th>
                <th className="py-3 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t border-border/50 hover:bg-muted/30">
                  <td className="py-3 pr-3 font-mono text-xs">{a.tag}</td>
                  <td className="py-3 pr-3 font-medium">{a.name}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{a.category}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{a.department}</td>
                  <td className="py-3 pr-3">{a.assignee ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="py-3 pr-3">${a.value.toLocaleString()}</td>
                  <td className="py-3 pr-3"><Badge tone={toneForStatus(a.status)}>{a.status}</Badge></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No assets match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </NeuCard>
    </div>
  );
}
