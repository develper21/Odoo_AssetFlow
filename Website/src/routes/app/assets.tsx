import { useEffect, useMemo, useState } from "react";
import { Filter, Plus, QrCode, Download } from "lucide-react";
import { NeuCard, PageHeader, Badge, toneForStatus } from "@/components/layout/ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { assetsApi, categoriesApi, departmentsApi } from "@/lib/api";

const STATUSES: ("Available" | "Allocated" | "Maintenance" | "Retired" | "All")[] = ["All", "Available", "Allocated", "Maintenance", "Retired"];

function AssetsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [cat, setCat] = useState<string>("All");
  const [showForm, setShowForm] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, categoriesData, departmentsData] = await Promise.all([
          assetsApi.getAll(),
          categoriesApi.getAll(),
          departmentsApi.getAll(),
        ]);
        
        setAssets(assetsData.assets || []);
        setCategories(categoriesData.categories || []);
        setDepartments(departmentsData.departments || []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const assetStatus = a.status || 'Available';
      const assetCategory = a.category?.name || a.category || '';
      const assetTag = a.serialNumber || a.assetTag || a.tag || '';
      const assetName = a.name || '';
      const assigneeName = a.currentHolder?.firstName && a.currentHolder?.lastName 
        ? `${a.currentHolder.firstName} ${a.currentHolder.lastName}` 
        : a.assignee || '';
      
      if (status !== "All" && assetStatus !== status) return false;
      if (cat !== "All" && assetCategory !== cat) return false;
      if (q && !`${assetName} ${assetTag} ${assigneeName}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, status, cat, assets]);

  const handleCreateAsset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data: any = Object.fromEntries(formData.entries());
      
      // Convert types for FormData
      if (data.acquisitionCost) data.acquisitionCost = Number(data.acquisitionCost);
      if (data.acquisitionDate) data.acquisitionDate = new Date(data.acquisitionDate).toISOString();
      
      await assetsApi.create(data);
      toast.success("Asset registered successfully");
      setShowForm(false);
      // Refresh assets
      const assetsData = await assetsApi.getAll();
      setAssets(assetsData.assets || []);
    } catch (error: any) {
      console.error('Failed to create asset:', error);
      toast.error(error.message || "Failed to register asset");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Registry"
        subtitle={`${filtered.length} of ${assets.length} assets`}
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
            onSubmit={handleCreateAsset}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {[
              { l: "Asset tag", p: "AF-1050", n: "serialNumber" },
              { l: "Name", p: "MacBook Pro 16", n: "name" },
              { l: "Category", p: "Laptops", n: "category", isSelect: true, options: categories },
              { l: "Department", p: "Engineering", n: "department", isSelect: true, options: departments },
              { l: "Location", p: "Building A, Floor 2", n: "location" },
              { l: "Purchase date", p: "2026-07-12", n: "acquisitionDate", type: "date" },
              { l: "Value (USD)", p: "2499", n: "acquisitionCost", type: "number" },
            ].map((f) => (
              <label key={f.n} className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{f.l}</span>
                {f.isSelect ? (
                  <select 
                    name={f.n}
                    className="neu-inset w-full rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="">Select {f.l.toLowerCase()}</option>
                    {f.options.map((opt: any) => (
                      <option key={opt._id} value={opt._id}>{opt.name}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    name={f.n}
                    type={f.type || "text"}
                    placeholder={f.p} 
                    className="neu-inset w-full rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none" 
                  />
                )}
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
            {categories.map((c: any) => <option key={c._id}>{c.name}</option>)}
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
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.map((a: any) => (
                <tr key={a._id} className="border-t border-border/50 hover:bg-muted/30">
                  <td className="py-3 pr-3 font-mono text-xs">{a.serialNumber || a.assetTag}</td>
                  <td className="py-3 pr-3 font-medium">{a.name}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{a.category?.name || a.category}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{a.department?.name || a.department}</td>
                  <td className="py-3 pr-3">{a.currentHolder?.firstName && a.currentHolder?.lastName ? `${a.currentHolder.firstName} ${a.currentHolder.lastName}` : <span className="text-muted-foreground">—</span>}</td>
                  <td className="py-3 pr-3">${(a.acquisitionCost || a.value || 0).toLocaleString()}</td>
                  <td className="py-3 pr-3"><Badge tone={toneForStatus(a.status)}>{a.status}</Badge></td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No assets match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </NeuCard>
    </div>
  );
}

export default AssetsPage;
