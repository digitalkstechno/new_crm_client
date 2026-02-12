import DataTable, { Column } from "@/components/DataTable";
import Dialog from "@/components/Dialog";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

type InquiryCategoryRow = {
  name: string;
  createdAt?: string;
};

const initialData: InquiryCategoryRow[] = [
  { name: "General Inquiry", createdAt: "2026-02-01" },
  { name: "Product Support", createdAt: "2026-02-02" },
  { name: "Billing Related", createdAt: "2026-02-03" },
];

export default function InquiryCategoryPage() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] =
    useState<InquiryCategoryRow[]>(initialData);

  const [form, setForm] = useState({
    name: "",
  });

  const columns: Column<InquiryCategoryRow>[] = useMemo(
    () => [
      { key: "name", label: "Category Name" },
      {
        key: "createdAt",
        label: "Created Date",
      },
    ],
    []
  );

  const resetForm = () =>
    setForm({
      name: "",
    });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    setCategories((prev) => [
      {
        name: form.name,
        createdAt: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);

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
          Add Category
        </button>
      </div>

      <DataTable
        title="Inquiry Categories"
        data={categories}
        pageSize={10}
        searchPlaceholder="Search category..."
        columns={columns}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add Inquiry Category"
        description="Create a new inquiry category."
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
              form="category-form"
            >
              Save Category
            </button>
          </div>
        }
      >
        <form
          id="category-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <label className="block text-sm text-gray-600">
            Category Name
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
              placeholder="Enter category name"
            />
          </label>
        </form>
      </Dialog>
    </>
  );
}
