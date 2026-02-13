"use client";

import DataTable, { Column } from "@/components/DataTable";
import Dialog from "@/components/Dialog";
import { api } from "@/utils/axiosInstance";
import { Plus,Eye, Edit, Trash2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../config";

type StaffRow = {
  _id?: string;
  fullName: string;
  email: string;
  phone: string;
  password?: string;
};

export default function StaffPage() {
  const [open, setOpen] = useState(false);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const columns: Column<StaffRow>[] = useMemo(
    () => [
      { key: "fullName", label: "Full Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone Number" },
      
    ],
    []
  );

  const resetForm = () =>
    setForm({
      fullName: "",
      email: "",
      phone: "",
      password: "",
    });

  // 🔥 Fetch all staff from API
  const fetchAllStaff = async () => {
    setLoading(true);
    try {
      const response = await api.get(baseUrl.FETCHALLSTAFF);
      setStaff(response.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStaff();
  }, []);

  // 🔥 Submit new staff to API
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const payload = { ...form };
      const response = await api.post(baseUrl.STAFF, payload);
      setStaff((prev) => [response.data.data, ...prev]);

      toast.success("Staff added successfully!");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add staff");
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
          Add Staff
        </button>
      </div>

      <DataTable
        title="Staff Management"
        data={staff}
        pageSize={10}
        searchPlaceholder="Search staff name, email, phone..."
        columns={columns}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add New Staff"
        description="Fill staff details to create new staff account."
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
              form="staff-form"
            >
              Save Staff
            </button>
          </div>
        }
      >
        <form id="staff-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-600">
              Full Name
              <input
                required
                value={form.fullName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
                placeholder="Enter full name"
              />
            </label>

            <label className="block text-sm text-gray-600">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
                placeholder="Enter email"
              />
            </label>

            <label className="block text-sm text-gray-600">
              Phone Number
              <input
                required
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
                placeholder="Enter phone number"
              />
            </label>

            <label className="block text-sm text-gray-600">
              Password
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
                placeholder="Enter password"
              />
            </label>
          </div>
        </form>
      </Dialog>
    </>
  );
}
