import DataTable, { Column } from "@/components/DataTable";
import Dialog from "@/components/Dialog";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

type LeadStatusRow = {
  name: string;
  color: string;
  order: number;
};

const initialData: LeadStatusRow[] = [
  { name: "New", color: "#0ea5e9", order: 1 },
  { name: "Contacted", color: "#f59e0b", order: 2 },
  { name: "Qualified", color: "#6366f1", order: 3 },
  { name: "Proposal", color: "#8b5cf6", order: 4 },
  { name: "Won", color: "#10b981", order: 5 },
  { name: "Lost", color: "#ef4444", order: 6 },
];

export default function LeadStatusPage() {
  const [open, setOpen] = useState(false);
  const [statuses, setStatuses] = useState<LeadStatusRow[]>(initialData);

  const [form, setForm] = useState({
    name: "",
    color: "#000000",
    order: 1,
  });

  const columns: Column<LeadStatusRow>[] = useMemo(
    () => [
      { key: "order", label: "Order" },
      { key: "name", label: "Status Name" },
      {
        key: "color",
        label: "Color",
        render: (value) => (
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: value as string }}
          >
            {value}
          </span>
        ),
      },
    ],
    []
  );

  const resetForm = () =>
    setForm({
      name: "",
      color: "#000000",
      order: 1,
    });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    setStatuses((prev) =>
      [
        {
          name: form.name,
          color: form.color,
          order: form.order,
        },
        ...prev,
      ].sort((a, b) => a.order - b.order)
    );

    setOpen(false);
    resetForm();
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:ring-gray-300 hover:shadow"
        >
          <Plus className="h-4 w-4" />
          Add Lead Status
        </button>
      </div>

      <DataTable
        title="Lead Status Management"
        data={statuses}
        pageSize={10}
        searchPlaceholder="Search status..."
        columns={columns}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add Lead Status"
        description="Create a new pipeline status."
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
              type="submit"
              form="lead-status-form"
            >
              Save Status
            </button>
          </div>
        }
      >
        <form
          id="lead-status-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-600">
              Status Name
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
                placeholder="Enter status name"
              />
            </label>

            <label className="block text-sm text-gray-600">
              Order
              <input
                type="number"
                required
                value={form.order}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    order: Number(e.target.value),
                  }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
              />
            </label>

            <label className="block text-sm text-gray-600 md:col-span-2">
              Color
              <div className="mt-2 flex items-center gap-4">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                  className="h-10 w-16 cursor-pointer rounded border border-gray-300"
                />
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: form.color }}
                >
                  Preview
                </span>
              </div>
            </label>
          </div>
        </form>
      </Dialog>
    </>
  );
}
