import type { Role } from "./session";

export const DEMO_USERS: { id: string; name: string; email: string; role: Role; department: string }[] = [
  { id: "u1", name: "Ava Sinclair", email: "ava@assetflow.io", role: "admin", department: "Operations" },
  { id: "u2", name: "Marcus Reid", email: "marcus@assetflow.io", role: "asset_manager", department: "IT" },
  { id: "u3", name: "Priya Anand", email: "priya@assetflow.io", role: "dept_head", department: "Engineering" },
  { id: "u4", name: "Noah Chen", email: "noah@assetflow.io", role: "employee", department: "Design" },
];

export const DEPARTMENTS = [
  { id: "d1", name: "Engineering", head: "Priya Anand", employees: 42, assets: 128 },
  { id: "d2", name: "Design", head: "Isla Moreno", employees: 18, assets: 47 },
  { id: "d3", name: "Operations", head: "Ava Sinclair", employees: 24, assets: 63 },
  { id: "d4", name: "IT", head: "Marcus Reid", employees: 12, assets: 210 },
  { id: "d5", name: "Finance", head: "Rohan Kapoor", employees: 9, assets: 22 },
];

export const CATEGORIES = [
  { id: "c1", name: "Laptops", count: 142, icon: "Laptop" },
  { id: "c2", name: "Monitors", count: 96, icon: "Monitor" },
  { id: "c3", name: "Vehicles", count: 12, icon: "Car" },
  { id: "c4", name: "Furniture", count: 210, icon: "Armchair" },
  { id: "c5", name: "Projectors", count: 18, icon: "Projector" },
  { id: "c6", name: "Tools", count: 74, icon: "Wrench" },
];

export type AssetStatus = "Available" | "Allocated" | "Maintenance" | "Retired";
export interface Asset {
  id: string;
  tag: string;
  name: string;
  category: string;
  status: AssetStatus;
  assignee?: string;
  department: string;
  purchased: string;
  value: number;
}

const rand = (arr: string[], seed: number) => arr[seed % arr.length];
const names = ["MacBook Pro 16", "Dell Latitude 7440", "Lenovo ThinkPad X1", "iMac 24", "iPad Air", "LG UltraFine 27", "Sony A7 IV", "DJI Mavic 3", "Herman Miller Aeron", "Epson EB-2250U", "Ford Transit", "Toyota Hilux", "Bosch Drill Kit", "Cisco Router", "Ubiquiti AP"];
const cats = ["Laptops", "Monitors", "Vehicles", "Furniture", "Projectors", "Tools"];
const statuses: AssetStatus[] = ["Available", "Allocated", "Maintenance", "Retired"];
const depts = ["Engineering", "Design", "Operations", "IT", "Finance"];
const people = ["Ava Sinclair", "Marcus Reid", "Priya Anand", "Noah Chen", "Isla Moreno", "Rohan Kapoor", "Yuki Tanaka", "Leo Park", "Maya Iyer"];

export const ASSETS: Asset[] = Array.from({ length: 48 }, (_, i) => {
  const status = statuses[i % 4];
  return {
    id: `a${i + 1}`,
    tag: `AF-${String(1000 + i)}`,
    name: rand(names, i),
    category: rand(cats, i),
    status,
    assignee: status === "Allocated" ? rand(people, i + 3) : undefined,
    department: rand(depts, i + 1),
    purchased: `2023-${String(((i % 12) + 1)).padStart(2, "0")}-14`,
    value: 400 + (i * 137) % 4600,
  };
});

export interface Allocation {
  id: string;
  asset: string;
  employee: string;
  from: string;
  to?: string;
  status: "Active" | "Returned" | "Pending" | "Approved";
}
export const ALLOCATIONS: Allocation[] = Array.from({ length: 14 }, (_, i) => ({
  id: `al${i + 1}`,
  asset: ASSETS[i].tag,
  employee: rand(people, i),
  from: `2024-0${(i % 9) + 1}-12`,
  to: i % 3 === 0 ? `2025-0${(i % 8) + 1}-04` : undefined,
  status: (["Active", "Returned", "Pending", "Approved"] as const)[i % 4],
}));

export interface Booking {
  id: string;
  resource: string;
  requester: string;
  date: string;
  slot: string;
  status: "Confirmed" | "Pending" | "Cancelled";
}
export const BOOKINGS: Booking[] = [
  { id: "b1", resource: "Conference Room A", requester: "Priya Anand", date: "2026-07-14", slot: "09:00–10:30", status: "Confirmed" },
  { id: "b2", resource: "Projector EB-2250U", requester: "Noah Chen", date: "2026-07-14", slot: "11:00–12:30", status: "Confirmed" },
  { id: "b3", resource: "Ford Transit", requester: "Marcus Reid", date: "2026-07-15", slot: "08:00–18:00", status: "Pending" },
  { id: "b4", resource: "Sony A7 IV", requester: "Isla Moreno", date: "2026-07-16", slot: "13:00–17:00", status: "Confirmed" },
  { id: "b5", resource: "Design Studio", requester: "Yuki Tanaka", date: "2026-07-17", slot: "10:00–12:00", status: "Cancelled" },
  { id: "b6", resource: "Toyota Hilux", requester: "Leo Park", date: "2026-07-18", slot: "07:00–15:00", status: "Confirmed" },
];

export type MaintenanceStage = "Pending" | "Approved" | "Assigned" | "In Progress" | "Resolved";
export interface MaintenanceReq {
  id: string;
  asset: string;
  reporter: string;
  issue: string;
  stage: MaintenanceStage;
  updated: string;
  priority: "Low" | "Medium" | "High";
}
export const MAINTENANCE: MaintenanceReq[] = [
  { id: "m1", asset: "AF-1004", reporter: "Noah Chen", issue: "Battery drains in 2 hours", stage: "In Progress", updated: "2h ago", priority: "High" },
  { id: "m2", asset: "AF-1012", reporter: "Isla Moreno", issue: "Flickering display", stage: "Assigned", updated: "6h ago", priority: "Medium" },
  { id: "m3", asset: "AF-1021", reporter: "Marcus Reid", issue: "Overheating under load", stage: "Approved", updated: "1d ago", priority: "High" },
  { id: "m4", asset: "AF-1030", reporter: "Yuki Tanaka", issue: "Broken hinge", stage: "Pending", updated: "1d ago", priority: "Low" },
  { id: "m5", asset: "AF-1041", reporter: "Priya Anand", issue: "Fan noise", stage: "Resolved", updated: "3d ago", priority: "Low" },
  { id: "m6", asset: "AF-1017", reporter: "Leo Park", issue: "Won't power on", stage: "In Progress", updated: "5h ago", priority: "High" },
];

export interface AuditCycle {
  id: string;
  name: string;
  period: string;
  progress: number;
  discrepancies: number;
  status: "Planned" | "Running" | "Completed";
}
export const AUDITS: AuditCycle[] = [
  { id: "au1", name: "Q3 2026 Full Inventory", period: "Jul – Sep 2026", progress: 62, discrepancies: 4, status: "Running" },
  { id: "au2", name: "IT Equipment Spot Check", period: "Jul 2026", progress: 100, discrepancies: 1, status: "Completed" },
  { id: "au3", name: "Vehicles Annual Audit", period: "Aug 2026", progress: 0, discrepancies: 0, status: "Planned" },
  { id: "au4", name: "Furniture Review", period: "Jun 2026", progress: 100, discrepancies: 7, status: "Completed" },
];

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "asset" | "booking" | "transfer" | "maintenance" | "audit";
  unread: boolean;
}
export const NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Asset assigned", body: "MacBook Pro 16 (AF-1004) allocated to you.", time: "12m ago", type: "asset", unread: true },
  { id: "n2", title: "Booking reminder", body: "Conference Room A starts in 30 minutes.", time: "1h ago", type: "booking", unread: true },
  { id: "n3", title: "Transfer approved", body: "Your transfer request for AF-1012 was approved.", time: "3h ago", type: "transfer", unread: false },
  { id: "n4", title: "Maintenance update", body: "AF-1021 marked In Progress by technician.", time: "6h ago", type: "maintenance", unread: false },
  { id: "n5", title: "Audit alert", body: "Q3 audit discrepancy: AF-1030 missing.", time: "1d ago", type: "audit", unread: true },
];

export const SALES_ANALYTICS = [
  { m: "Jan", v: 62, w: 40 }, { m: "Feb", v: 58, w: 44 }, { m: "Mar", v: 74, w: 50 },
  { m: "Apr", v: 80, w: 60 }, { m: "May", v: 90, w: 70 }, { m: "Jun", v: 110, w: 82 },
  { m: "Jul", v: 128, w: 95 },
];

export const UTILIZATION_TREND = [
  { d: 1, v: 40 }, { d: 5, v: 62 }, { d: 10, v: 55 }, { d: 15, v: 78 },
  { d: 20, v: 66 }, { d: 25, v: 90 }, { d: 30, v: 84 },
];

export const ACTIVITY_BREAKDOWN = [
  { name: "Allocated", value: 42, key: "chart-1" },
  { name: "Available", value: 28, key: "chart-2" },
  { name: "Maintenance", value: 18, key: "chart-3" },
  { name: "Retired", value: 12, key: "chart-4" },
];
