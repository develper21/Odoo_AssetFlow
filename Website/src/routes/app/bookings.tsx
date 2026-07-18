import { useEffect, useState } from "react";
import { CalendarCheck, Plus } from "lucide-react";
import { NeuCard, PageHeader, Badge, toneForStatus } from "@/components/layout/ui";
import { toast } from "sonner";
import { bookingsApi, assetsApi } from "@/lib/api";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsData, assetsData] = await Promise.all([
          bookingsApi.getAll(),
          assetsApi.getAll(),
        ]);
        setBookings(bookingsData.bookings || []);
        setAssets(assetsData.assets || []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data: any = Object.fromEntries(formData.entries());
      
      // Convert types for FormData
      if (data.startDateTime) data.startDateTime = new Date(data.startDateTime).toISOString();
      if (data.endDateTime) data.endDateTime = new Date(data.endDateTime).toISOString();
      
      await bookingsApi.create(data);
      toast.success("Booking created successfully");
      setShowForm(false);
      // Refresh bookings
      const bookingsData = await bookingsApi.getAll();
      setBookings(bookingsData.bookings || []);
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      toast.error(error.message || "Failed to create booking");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Booking"
        subtitle="Book conference rooms, vehicles, cameras, and other shared resources."
        actions={
          <button onClick={() => setShowForm((v) => !v)} className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> New booking
          </button>
        }
      />

      {showForm && (
        <NeuCard>
          <h3 className="mb-4 text-lg font-semibold">Create new booking</h3>
          <form
            onSubmit={handleCreateBooking}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {[
              { l: "Resource (Asset)", p: "Select asset", n: "resource", isSelect: true, options: assets },
              { l: "Start date & time", p: "2026-07-13T09:00", n: "startDateTime", type: "datetime-local" },
              { l: "End date & time", p: "2026-07-13T10:00", n: "endDateTime", type: "datetime-local" },
              { l: "Purpose", p: "Team meeting", n: "purpose" },
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
                      <option key={opt._id} value={opt._id}>{opt.name} ({opt.serialNumber})</option>
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
              <button type="submit" className="neu-accent rounded-xl px-4 py-2.5 text-sm font-semibold">Create booking</button>
            </div>
          </form>
        </NeuCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <NeuCard className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">This week</h3>
            <Badge tone="primary">Jul 13 – 19</Badge>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((d, i) => (
              <div key={d} className="neu-inset p-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{d}</div>
                <div className="mt-1 font-display text-xl font-semibold">{13 + i}</div>
                <div className="mt-3 space-y-1.5">
                  {loading ? (
                    <div className="text-[10px] text-muted-foreground">Loading...</div>
                  ) : (
                    bookings.filter((_, j) => j % 7 === i).slice(0, 2).map((b: any) => (
                      <div key={b._id} className="rounded-md bg-primary/15 px-2 py-1 text-[10px] font-medium text-primary">
                        {new Date(b.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} · {b.resource?.name?.split(' ')[0] || 'Resource'}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </NeuCard>

        <NeuCard className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Upcoming bookings</h3>
          {loading ? (
            <div className="text-center text-muted-foreground py-4">Loading...</div>
          ) : (
            <ul className="space-y-2">
              {bookings.map((b: any) => (
                <li key={b._id} className="neu-inset flex items-center gap-3 p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/20 text-primary">
                    <CalendarCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{b.resource?.name || 'Unknown Resource'}</div>
                    <div className="text-xs text-muted-foreground">{new Date(b.startDateTime).toLocaleDateString()} · {new Date(b.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} · {b.bookedBy?.firstName && b.bookedBy?.lastName ? `${b.bookedBy.firstName} ${b.bookedBy.lastName}` : 'Unknown'}</div>
                  </div>
                  <Badge tone={toneForStatus(b.status)}>{b.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </NeuCard>
      </div>
    </div>
  );
}

export default BookingsPage;
