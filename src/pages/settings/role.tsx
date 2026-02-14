"use client";

import DataTable, { Column } from "@/components/DataTable";
import Dialog from "@/components/Dialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import TableSkeleton from "@/components/TableSkeleton";
import { api } from "@/utils/axiosInstance";
import { Plus, Trash2, Edit } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../config";

type RoleRow = {
  _id?: string;
  roleName: string;
  allowedStatuses: string[];
  canAccessSettings: boolean;
  canAccessAccountMaster: boolean;
  accountMasterViewType: "view_all" | "view_own";
};

export default function RolePage() {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [editMode, setEditMode] = useState<{ isEdit: boolean; id: string | null }>({ isEdit: false, id: null });
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [allStatuses, setAllStatuses] = useState<string[]>([]);

  const [form, setForm] = useState({
    roleName: "",
    allowedStatuses: [] as string[],
    canAccessSettings: false,
    canAccessAccountMaster: false,
    accountMasterViewType: "view_own" as "view_all" | "view_own",
  });

  const fetchStatuses = async () => {
    try {
      const response = await api.get(baseUrl.ROLE_STATUSES);
      setAllStatuses(response.data.data);
    } catch (err: any) {
      toast.error("Failed to fetch statuses");
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      await api.delete(`${baseUrl.ROLE}/delete/${deleteDialog.id}`);
      setRoles((prev) => prev.filter((r) => r._id !== deleteDialog.id));
      toast.success("Role deleted successfully!");
      setDeleteDialog({ open: false, id: null });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete role");
    }
  };

  const handleEdit = (row: RoleRow) => {
    setForm({
      roleName: row.roleName,
      allowedStatuses: row.allowedStatuses,
      canAccessSettings: row.canAccessSettings,
      canAccessAccountMaster: row.canAccessAccountMaster,
      accountMasterViewType: row.accountMasterViewType || "view_own",
    });
    setEditMode({ isEdit: true, id: row._id! });
    setOpen(true);
  };

  const handleUpdate = async () => {
    if (!editMode.id) return;

    try {
      const response = await api.put(`${baseUrl.ROLE}/update/${editMode.id}`, form);
      setRoles((prev) => prev.map((r) => (r._id === editMode.id ? response.data.data : r)));
      toast.success("Role updated successfully!");
      setOpen(false);
      resetForm();
      setEditMode({ isEdit: false, id: null });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const columns: Column<RoleRow>[] = useMemo(
    () => [
      { key: "roleName", label: "Role Name" },
      {
        key: "allowedStatuses",
        label: "Allowed Statuses",
        render: (value) => (
          <div className="flex flex-wrap gap-1">
            {(value as string[]).map((status, idx) => (
              <span
                key={idx}
                className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
              >
                {status}
              </span>
            ))}
          </div>
        ),
      },
      {
        key: "_id",
        label: "Actions",
        render: (_, row) => (
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteDialog({ open: true, id: row._id! })}
              className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleEdit(row)}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const resetForm = () => {
    setForm({
      roleName: "",
      allowedStatuses: [],
      canAccessSettings: false,
      canAccessAccountMaster: false,
      accountMasterViewType: "view_own",
    });
    setEditMode({ isEdit: false, id: null });
  };

  const fetchAllRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${baseUrl.ROLE}/fetch-all?page=${page}&limit=10&search=${search}`);
      setRoles(response.data.data);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalRecords(response.data.pagination?.totalRecords || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRoles();
  }, [page, search]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    if (editMode.isEdit) {
      await handleUpdate();
    } else {
      try {
        const response = await api.post(`${baseUrl.ROLE}/create`, form);
        setRoles((prev) => [response.data.data, ...prev]);
        toast.success("Role added successfully!");
        setOpen(false);
        resetForm();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to add role");
      }
    }
    setConfirmDialog(false);
  };

  const toggleStatus = (status: string) => {
    setForm((prev) => ({
      ...prev,
      allowedStatuses: prev.allowedStatuses.includes(status)
        ? prev.allowedStatuses.filter((s) => s !== status)
        : [...prev.allowedStatuses, status],
    }));
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:ring-gray-300 hover:shadow"
        >
          <Plus className="h-4 w-4" />
          Add Role
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          title="Role Management"
          data={roles}
          pageSize={10}
          searchPlaceholder="Search role name..."
          columns={columns}
          currentPage={page}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={setPage}
          onSearch={setSearch}
        />
      )}

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        title={editMode.isEdit ? "Edit Role" : "Add New Role"}
        description={editMode.isEdit ? "Update role details." : "Create a new role with specific permissions."}
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
              form="role-form"
            >
              {editMode.isEdit ? "Update Role" : "Save Role"}
            </button>
          </div>
        }
      >
        <form id="role-form" onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-gray-600">
            Role Name
            <input
              required
              value={form.roleName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, roleName: e.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
              placeholder="Enter role name"
            />
          </label>

          <div className="block text-sm text-gray-600">
            <p className="mb-2">Allowed Lead Statuses</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, allowedStatuses: allStatuses }))}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Select All
              </button>
              <span className="mx-2 text-gray-400">|</span>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, allowedStatuses: [] }))}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {allStatuses.map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.allowedStatuses.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.canAccessSettings}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, canAccessSettings: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Can Access Settings</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.canAccessAccountMaster}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, canAccessAccountMaster: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Can Access Account Master</span>
          </label>

          {form.canAccessAccountMaster && (
            <div className="block text-sm text-gray-600">
              <p className="mb-2">Account Master View Type</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accountMasterViewType"
                    value="view_all"
                    checked={form.accountMasterViewType === "view_all"}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, accountMasterViewType: e.target.value as "view_all" | "view_own" }))
                    }
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">View All</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accountMasterViewType"
                    value="view_own"
                    checked={form.accountMasterViewType === "view_own"}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, accountMasterViewType: e.target.value as "view_all" | "view_own" }))
                    }
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">View Own</span>
                </label>
              </div>
            </div>
          )}
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        confirmText="Delete"
      />

      <ConfirmDialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        onConfirm={confirmSubmit}
        title={editMode.isEdit ? "Update Role" : "Add Role"}
        message={editMode.isEdit ? "Are you sure you want to update this role?" : "Are you sure you want to add this role?"}
        confirmText={editMode.isEdit ? "Update" : "Add"}
      />
    </>
  );
}
