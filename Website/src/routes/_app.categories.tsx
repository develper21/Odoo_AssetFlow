import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Tag, Plus } from "lucide-react";
import { NeuCard, PageHeader } from "@/components/app/ui";
import { toast } from "sonner";
import { categoriesApi } from "@/lib/api";

export const Route = createFileRoute("/_app/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data.categories || []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data: any = Object.fromEntries(formData.entries());
      
      await categoriesApi.create(data);
      toast.success("Category created successfully");
      setShowForm(false);
      // Refresh categories
      const categoriesData = await categoriesApi.getAll();
      setCategories(categoriesData.categories || []);
    } catch (error: any) {
      console.error('Failed to create category:', error);
      toast.error(error.message || "Failed to create category");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Categories"
        subtitle="Classify assets to enable filtering, reporting, and lifecycle rules."
        actions={
          <button onClick={() => setShowForm((v) => !v)} className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> New category
          </button>
        }
      />

      {showForm && (
        <NeuCard>
          <h3 className="mb-4 text-lg font-semibold">Create new category</h3>
          <form
            onSubmit={handleCreateCategory}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {[
              { l: "Category name", p: "Laptops", n: "name" },
              { l: "Category code", p: "LAP", n: "code" },
              { l: "Description", p: "Category description", n: "description" },
            ].map((f) => (
              <label key={f.n} className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{f.l}</span>
                <input 
                  name={f.n}
                  type="text"
                  placeholder={f.p} 
                  className="neu-inset w-full rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none" 
                />
              </label>
            ))}
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="neu-sm rounded-xl px-4 py-2.5 text-sm">Cancel</button>
              <button type="submit" className="neu-accent rounded-xl px-4 py-2.5 text-sm font-semibold">Create category</button>
            </div>
          </form>
        </NeuCard>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c: any) => (
            <NeuCard key={c._id} className="text-center">
              <div className="neu-inset mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl text-primary">
                <Tag className="h-5 w-5" />
              </div>
              <div className="font-semibold">{c.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.assetCount || c.count || 0} items</div>
            </NeuCard>
          ))}
        </div>
      )}
    </div>
  );
}
