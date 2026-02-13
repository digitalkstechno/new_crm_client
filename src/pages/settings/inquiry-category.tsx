"use client";

import DataTable, { Column } from "@/components/DataTable";
import Dialog from "@/components/Dialog";
import { Plus } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/axiosInstance"; // axios instance with token
import { baseUrl } from "../../../config";

type InquiryCategoryRow = {
  _id?: string;
  name: string;
  createdAt?: string;
};

export default function InquiryCategoryPage() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<InquiryCategoryRow[]>([]);
  const [form, setForm] = useState({ name: "" });

  const columns: Column<InquiryCategoryRow>[] = useMemo(
    () => [
      { key: "name", label: "Category Name" },
      { key: "createdAt", label: "Created Date" },
    ],
    []
  );

  const resetForm = () => setForm({ name: "" });

  // 🔹 Fetch existing categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(baseUrl.INQUIRYCATEGORY);
        setCategories(res.data.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch categories");
      }
    };

    fetchCategories();
  }, []);

  // 🔹 Submit form to API
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const payload = { name: form.name };

      const res = await api.post(baseUrl.INQUIRYCATEGORY, payload);
      setCategories((prev) => [res.data.data, ...prev]);

      toast.success("Category created successfully!");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create category");
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
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
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
