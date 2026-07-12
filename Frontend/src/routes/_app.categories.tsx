import { createFileRoute } from "@tanstack/react-router";
import { Tag, Plus } from "lucide-react";
import { NeuCard, PageHeader } from "@/components/app/ui";
import { CATEGORIES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Categories"
        subtitle="Classify assets to enable filtering, reporting, and lifecycle rules."
        actions={
          <button className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> New category
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((c) => (
          <NeuCard key={c.id} className="text-center">
            <div className="neu-inset mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl text-primary">
              <Tag className="h-5 w-5" />
            </div>
            <div className="font-semibold">{c.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{c.count} items</div>
          </NeuCard>
        ))}
      </div>
    </div>
  );
}
