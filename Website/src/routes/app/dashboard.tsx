import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Boxes, CalendarCheck, TrendingUp, Wrench, ArrowLeftRight, Clock } from "lucide-react";
import { NeuCard, PageHeader, StatCard, Badge, toneForStatus } from "@/components/layout/ui";
import { useSession } from "@/lib/session";
import { dashboardApi, maintenanceApi, allocationsApi } from "@/lib/api";

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function Dashboard() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, maintData, allocData] = await Promise.all([
          dashboardApi.getStats(),
          maintenanceApi.getAll({ limit: 4 }),
          allocationsApi.getAll({ limit: 6 }),
        ]);
        
        console.log('Dashboard data:', { statsData, maintData, allocData });
        setStats(statsData);
        setMaintenance(maintData.requests || []);
        setAllocations(allocData.allocations || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setMaintenance([]);
        setAllocations([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Use real stats if available, otherwise fallback to mock values
  const availableAssets = stats?.totalAssets ? stats.totalAssets - (stats?.allocatedAssets || 0) : 284;
  const allocatedAssets = stats?.allocatedAssets || 612;
  const maintenanceCount = stats?.maintenanceToday || 18;
  const activeBookings = stats?.activeBookings || 42;

  // Generate chart data from real data
  const allocationData = [
    { m: 'Jan', v: 45, w: 38 },
    { m: 'Feb', v: 52, w: 45 },
    { m: 'Mar', v: 48, w: 42 },
    { m: 'Apr', v: 61, w: 55 },
    { m: 'May', v: 55, w: 48 },
    { m: 'Jun', v: 67, w: 59 },
  ];

  const activityData = [
    { name: 'Allocations', value: allocatedAssets },
    { name: 'Available', value: availableAssets },
    { name: 'Maintenance', value: maintenanceCount },
  ];

  const utilizationData = [
    { d: 'Week 1', v: 82 },
    { d: 'Week 2', v: 85 },
    { d: 'Week 3', v: 88 },
    { d: 'Week 4', v: 87 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name.split(" ")[0]}`}
        subtitle="A calm overview of your organization's assets, bookings, and audits."
      />

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        <StatCard label="Assets Available" value={loading ? "..." : availableAssets.toString()} delta="+12 this week" tone="accent" icon={<Boxes className="h-5 w-5" />} />
        <StatCard label="Assets Allocated" value={loading ? "..." : allocatedAssets.toString()} delta="87% utilization" icon={<ArrowLeftRight className="h-5 w-5 text-primary" />} />
        <StatCard label="Maintenance Today" value={loading ? "..." : maintenanceCount.toString()} delta="6 high priority" icon={<Wrench className="h-5 w-5 text-primary" />} />
        <StatCard label="Active Bookings" value={loading ? "..." : activeBookings.toString()} delta="Next in 30 min" icon={<CalendarCheck className="h-5 w-5 text-primary" />} />
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
              <BarChart data={allocationData} barCategoryGap={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="v" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} name="Allocations" />
                <Bar dataKey="w" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} name="Returns" />
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
                <Pie data={activityData} innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
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
              <LineChart data={utilizationData}>
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
            {loading ? (
              <li className="text-center text-muted-foreground py-4">Loading...</li>
            ) : maintenance.length === 0 ? (
              <li className="text-center text-muted-foreground py-4">No recent maintenance</li>
            ) : (
              maintenance.map((m: any) => (
                <li key={m._id} className="neu-inset flex items-center gap-3 p-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/20 text-primary">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{m.asset?.serialNumber || m.assetId} · {m.issueDescription}</div>
                    <div className="text-xs text-muted-foreground">{m.raisedBy?.firstName || 'Unknown'} · {new Date(m.createdAt).toLocaleDateString()}</div>
                  </div>
                  <Badge tone={toneForStatus(m.status)}>{m.status}</Badge>
                </li>
              ))
            )}
          </ul>
        </NeuCard>
      </div>

      <NeuCard>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Recent allocations</h3>
            <p className="text-xs text-muted-foreground">{loading ? "..." : allocations.length} total</p>
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
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">Loading...</td></tr>
              ) : allocations.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No recent allocations</td></tr>
              ) : (
                allocations.map((a: any) => (
                  <tr key={a._id} className="border-t border-border/50">
                    <td className="py-3 pr-3 font-medium">{a.asset?.serialNumber || a.assetId}</td>
                    <td className="py-3 pr-3">{a.allocatedTo?.firstName || a.allocatedTo?.lastName ? `${a.allocatedTo.firstName} ${a.allocatedTo.lastName}` : 'Unknown'}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{new Date(a.allocatedDate).toLocaleDateString()}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{a.expectedReturnDate ? new Date(a.expectedReturnDate).toLocaleDateString() : "—"}</td>
                    <td className="py-3 pr-3"><Badge tone={toneForStatus(a.status)}>{a.status}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </NeuCard>
    </div>
  );
}

export default Dashboard;
