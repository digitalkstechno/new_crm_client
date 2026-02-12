import DataTable, { Column } from "@/components/DataTable";
import Dialog from "@/components/Dialog";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

type Category = {
  _id: string;
  name: string;
};

type ModelSuggestionRow = {
  name: string;
  modelNo: string;
  rate: string;
  category: Category;
};

const initialCategories: Category[] = [
  { _id: "1", name: "General Inquiry" },
  { _id: "2", name: "Product Support" },
  { _id: "3", name: "Billing Related" },
];

const initialData: ModelSuggestionRow[] = [
  {
    name: "Smart AC 1.5 Ton",
    modelNo: "AC1500X",
    rate: "₹45,000",
    category: initialCategories[0],
  },
  {
    name: "Inverter Fridge 300L",
    modelNo: "FR300Z",
    rate: "₹32,000",
    category: initialCategories[1],
  },
];

export default function ModelSuggestionPage() {
  const [open, setOpen] = useState(false);
  const [models, setModels] =
    useState<ModelSuggestionRow[]>(initialData);

  const [form, setForm] = useState({
    name: "",
    modelNo: "",
    rate: "",
    categoryId: "",
  });

  const columns: Column<ModelSuggestionRow>[] = useMemo(
    () => [
      { key: "name", label: "Model Name" },
      { key: "modelNo", label: "Model No." },
      {
        key: "category",
        label: "Category",
        render: (value) => (value as Category).name,
      },
      {
        key: "rate",
        label: "Rate",
        className: "text-right font-semibold",
      },
    ],
    []
  );

  const resetForm = () =>
    setForm({
      name: "",
      modelNo: "",
      rate: "",
      categoryId: "",
    });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const selectedCategory = initialCategories.find(
      (c) => c._id === form.categoryId
    );

    if (!selectedCategory) return;

    setModels((prev) => [
      {
        name: form.name,
        modelNo: form.modelNo,
        rate: form.rate,
        category: selectedCategory,
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
          Add Model
        </button>
      </div>

      <DataTable
        title="Model Suggestions"
        data={models}
        pageSize={10}
        searchPlaceholder="Search model name or model number..."
        columns={columns}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add Model Suggestion"
        description="Create a new model suggestion."
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
              form="model-form"
            >
              Save Model
            </button>
          </div>
        }
      >
        <form
          id="model-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-600">
              Model Name
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
                placeholder="Enter model name"
              />
            </label>

            <label className="block text-sm text-gray-600">
              Model No
              <input
                required
                value={form.modelNo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, modelNo: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
                placeholder="Enter model number"
              />
            </label>

            <label className="block text-sm text-gray-600">
              Rate
              <input
                required
                value={form.rate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, rate: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
                placeholder="₹25,000"
              />
            </label>

            <label className="block text-sm text-gray-600">
              Category
              <select
                required
                value={form.categoryId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
              >
                <option value="">Select Category</option>
                {initialCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </form>
      </Dialog>
    </>
  );
}
