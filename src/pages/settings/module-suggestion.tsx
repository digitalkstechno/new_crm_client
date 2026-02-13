"use client";

import DataTable, { Column } from "@/components/DataTable";
import Dialog from "@/components/Dialog";
import { Plus } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/axiosInstance"; // your axios instance
import { baseUrl } from "../../../config"; // add MODEL_SUGGESTION endpoint here

type Category = {
  _id: string;
  name: string;
};

type ModelSuggestionRow = {
  _id?: string;
  name: string;
  modelNo: string;
  rate: string;
  category: Category;
};

export default function ModelSuggestionPage() {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<ModelSuggestionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

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
        render: (value) => (value as Category)?.name,
      },
      {
        key: "rate",
        label: "Rate",
        className: "font-semibold",
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

  // 🔥 Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await api.get(baseUrl.INQUIRYCATEGORY);
      setCategories(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch categories");
    }
  };

  // 🔥 Fetch all model suggestions
  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await api.get(baseUrl.MODEL_SUGGESTION)
      setModels(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch models");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchModels();
  }, []);

  // 🔥 Submit new model suggestion
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const payload = {
        name: form.name,
        modelNo: form.modelNo,
        rate: form.rate,
        category: form.categoryId,
      };
      const res = await api.post(baseUrl.MODEL_SUGGESTION, payload);
      setModels((prev) => [res.data.data, ...prev]);

      toast.success("Model suggestion added successfully!");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add model");
    }
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
                {categories.map((cat) => (
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
