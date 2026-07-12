import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Boxes, CalendarCheck, TrendingUp, Wrench, ArrowLeftRight, Clock } from "lucide-react";
import { NeuCard, PageHeader, StatCard, Badge, toneForStatus } from "@/components/app/ui";
import { ACTIVITY_BREAKDOWN, ALLOCATIONS, MAINTENANCE, SALES_ANALYTICS, UTILIZATION_TREND } from "@/lib/mock-data";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function Dashboard() {
  const { user } = useSession();
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name.split(" ")[0]}`}
        subtitle="A calm overview of your organization's assets, bookings, and audits."
      />

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        <StatCard label="Assets Available" value="284" delta="+12 this week" tone="accent" icon={<Boxes className="h-5 w-5" />} />
        <StatCard label="Assets Allocated" value="612" delta="87% utilization" icon={<ArrowLeftRight className="h-5 w-5 text-primary" />} />
        <StatCard label="Maintenance Today" value="18" delta="6 high priority" icon={<Wrench className="h-5 w-5 text-primary" />} />
        <StatCard label="Active Bookings" value="42" delta="Next in 30 min" icon={<CalendarCheck className="h-5 w-5 text-primary" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <NeuCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Allocations vs Returns</h3>
              <p className="text-xs text-muted-foreground">Monthly volume, current year</p>
            </div>
            <Badge tone="primary">Monthly</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={SALES_ANALYTICS} barCategoryGap={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="v" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="w" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </NeuCard>

        <NeuCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Activity</h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={ACTIVITY_BREAKDOWN} innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                  {ACTIVITY_BREAKDOWN.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {ACTIVITY_BREAKDOWN.map((a, i) => (
              <div key={a.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS[i] }} />
                <span className="flex-1 text-muted-foreground">{a.name}</span>
                <span className="font-semibold">{a.value}</span>
              </div>
            ))}
          </div>
        </NeuCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <NeuCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Utilization trend</h3>
            <Badge tone="primary">Last 30 days</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={UTILIZATION_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="v" stroke="var(--color-chart-1)" strokeWidth={3} dot={{ fill: "var(--color-chart-1)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </NeuCard>

        <NeuCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live activity</h3>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <ul className="space-y-3">
            {MAINTENANCE.slice(0, 4).map((m) => (
              <li key={m.id} className="neu-inset flex items-center gap-3 p-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/20 text-primary">
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{m.asset} · {m.issue}</div>
                  <div className="text-xs text-muted-foreground">{m.reporter} · {m.updated}</div>
                </div>
                <Badge tone={toneForStatus(m.stage)}>{m.stage}</Badge>
              </li>
            ))}
          </ul>
        </NeuCard>
      </div>

      <NeuCard>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Recent allocations</h3>
            <p className="text-xs text-muted-foreground">{ALLOCATIONS.length} total</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Asset</th>
                <th className="py-2 pr-3">Employee</th>
                <th className="py-2 pr-3">From</th>
                <th className="py-2 pr-3">To</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {ALLOCATIONS.slice(0, 6).map((a) => (
                <tr key={a.id} className="border-t border-border/50">
                  <td className="py-3 pr-3 font-medium">{a.asset}</td>
                  <td className="py-3 pr-3">{a.employee}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{a.from}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{a.to ?? "—"}</td>
                  <td className="py-3 pr-3"><Badge tone={toneForStatus(a.status)}>{a.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeuCard>
    </div>
  );
}
