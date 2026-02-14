import DataTable, { Column } from "@/components/DataTable";
import Dialog from "@/components/Dialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import TableSkeleton from "@/components/TableSkeleton";
import axios from "axios";
import { Plus,Edit, Trash2, SendToBack } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { baseUrl } from "../../config";
import toast from "react-hot-toast";
import { api } from "@/utils/axiosInstance";
import { useRouter } from "next/router";
type Staff = {
  _id: string;
  fullName: string;
};

type AccountRow = {
  _id?: string;
  companyName: string;
  clientName: string;
  mobile: string;
  email: string;
  website: string;
  sourcebyTypeOfClient: string;
  sourceFrom?: string;
  assignBy?: Staff;
  remark?: string;
  address?: {
    line1?: string;
    line2?: string;
    cityName?: string;
    stateName?: string;
    countryName?: string;
  };
};

const sourceOptions = [
  "B to B Vendor",
  "Direct Com",
  "Networking Group",
  "EndUser Retail",
  "O.E.M",
];

export default function AccountMasterPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [editMode, setEditMode] = useState<{ isEdit: boolean; id: string | null }>({ isEdit: false, id: null });
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, [page, search]);

  const fetchStaff = async () => {
    try {
      const response = await api.get(baseUrl.STAFF_DROPDOWN);
      // Filter staff who have account master access
      const filteredStaff = response.data.data?.filter((staff: any) => 
        staff.role?.canAccessAccountMaster === true
      ) || [];
      setStaffList(filteredStaff);
    } catch (error) {
      toast.error("Failed to fetch user");
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${baseUrl.ACCOUNTMASTER}?page=${page}&limit=10&search=${search}`);
      
      // Get current user's role and staff ID
      const userRole = localStorage.getItem("userRole");
      const staffId = localStorage.getItem("staffId");
      const accountMasterViewType = localStorage.getItem("accountMasterViewType");
      
      let filteredAccounts = response.data.data || [];
      
      // If view type is "view_own", filter only assigned accounts
      if (accountMasterViewType === "view_own" && staffId) {
        filteredAccounts = filteredAccounts.filter((account: AccountRow) => 
          account.assignBy?._id === staffId
        );
      }
      
      setAccounts(filteredAccounts);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalRecords(response.data.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  const [form, setForm] = useState({
    companyName: "",
    clientName: "",
    line1: "",
    line2: "",
    cityName: "",
    stateName: "",
    countryName: "",
    mobile: "",
    email: "",
    website: "",
    sourcebyTypeOfClient: "",
    sourceFrom: "",
    assignById: "",
    remark: "",
  });

  const columns: Column<AccountRow>[] = useMemo(
    () => [
      { key: "companyName", label: "Company" },
      { key: "clientName", label: "Client" },
      { key: "mobile", label: "Mobile" },
      { key: "email", label: "Email" },
      {
        key: "sourcebyTypeOfClient",
        label: "Type of client",
      },
      {
        key: "assignBy",
        label: "Assigned Staff",
        render: (value) =>
          value ? (value as Staff).fullName : "-",
      },
      {
        key: "_id",
        label: "Actions",
        render: (_, row) => (
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/convert-to-lead?accountId=${row._id}`)}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-3 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Convert
              <SendToBack className="h-3 w-3" />
            </button>
            <button
              onClick={() => setDeleteDialog({ open: true, id: row._id! })}
              className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleEdit(row)}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-3 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [router]
  );

  const resetForm = () => {
    setForm({
      companyName: "",
      clientName: "",
      line1: "",
      line2: "",
      cityName: "",
      stateName: "",
      countryName: "",
      mobile: "",
      email: "",
      website: "",
      sourcebyTypeOfClient: "",
      sourceFrom: "",
      assignById: "",
      remark: "",
    });
    setEditMode({ isEdit: false, id: null });
  };

  const handleEdit = (row: AccountRow) => {
    setForm({
      companyName: row.companyName,
      clientName: row.clientName,
      line1: row.address?.line1 || "",
      line2: row.address?.line2 || "",
      cityName: row.address?.cityName || "",
      stateName: row.address?.stateName || "",
      countryName: row.address?.countryName || "",
      mobile: row.mobile,
      email: row.email,
      website: row.website,
      sourcebyTypeOfClient: row.sourcebyTypeOfClient,
      sourceFrom: row.sourceFrom || "",
      assignById: row.assignBy?._id || "",
      remark: row.remark || "",
    });
    setEditMode({ isEdit: true, id: row._id! });
    fetchStaff();
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      await api.delete(`${baseUrl.ACCOUNTMASTER}/${deleteDialog.id}`);
      setAccounts((prev) => prev.filter((a) => a._id !== deleteDialog.id));
      toast.success("Account deleted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    }
  };

  const handleUpdate = async () => {
    if (!editMode.id) return;

    try {
      const payload = {
        companyName: form.companyName,
        clientName: form.clientName,
        address: {
          line1: form.line1,
          line2: form.line2,
          cityName: form.cityName,
          stateName: form.stateName,
          countryName: form.countryName,
        },
        mobile: form.mobile,
        email: form.email,
        website: form.website,
        sourcebyTypeOfClient: form.sourcebyTypeOfClient,
        sourceFrom: form.sourceFrom,
        assignBy: form.assignById || null,
        remark: form.remark,
      };

      await api.put(`${baseUrl.ACCOUNTMASTER}/${editMode.id}`, payload);
      await fetchAccounts();
      toast.success("Account updated successfully!");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update account");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    if (editMode.isEdit) {
      await handleUpdate();
    } else {
      try {
        const payload = {
          companyName: form.companyName,
          clientName: form.clientName,
          address: {
            line1: form.line1,
            line2: form.line2,
            cityName: form.cityName,
            stateName: form.stateName,
            countryName: form.countryName,
          },
          mobile: form.mobile,
          email: form.email,
          website: form.website,
          sourcebyTypeOfClient: form.sourcebyTypeOfClient,
          sourceFrom: form.sourceFrom,
          assignBy: form.assignById || null,
          remark: form.remark,
        };

        const response = await api.post(
          baseUrl.ACCOUNTMASTER,
          payload);

        const newAccount = response.data.data;
        fetchAccounts();
        toast.success("Account created successfully!");
        setOpen(false);
        resetForm();

      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to create account"
        );
      }
    }
  };


  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setOpen(true);
            fetchStaff();
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Add Account
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          title="Account Master"
          data={accounts}
          pageSize={10}
          searchPlaceholder="Search company, client..."
          columns={columns}
          currentPage={page}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={setPage}
          onSearch={setSearch}
          rowClassName={(row) => row.sourcebyTypeOfClient === "O.E.M" ? "bg-yellow-50 hover:bg-yellow-100" : ""}
        />
      )}

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        title={editMode.isEdit ? "Edit Account" : "Add Account"}
        description={editMode.isEdit ? "Update account entry." : "Create new account entry."}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              className="border px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="account-form"
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              {editMode.isEdit ? "Update" : "Save"}
            </button>
          </div>
        }
      >
        <form
          id="account-form"
          onSubmit={handleSubmit}
          className="space-y-6 text-black"
        >
          {/* Basic Information */}
          <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Basic Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-gray-600">Company Name</label>
                <input
                  required
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Client Name</label>
                <input
                  required
                  value={form.clientName}
                  onChange={(e) =>
                    setForm({ ...form, clientName: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Mobile</label>
                <input
                  required
                  value={form.mobile}
                  onChange={(e) =>
                    setForm({ ...form, mobile: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
                  placeholder="Enter mobile number"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
                  placeholder="Enter email"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Website</label>
                <input
                  required
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
                  placeholder="Enter website URL"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Address Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                placeholder="Address Line 1"
                value={form.line1}
                onChange={(e) =>
                  setForm({ ...form, line1: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
              />

              <input
                placeholder="Address Line 2"
                value={form.line2}
                onChange={(e) =>
                  setForm({ ...form, line2: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
              />

              <input
                placeholder="City"
                value={form.cityName}
                onChange={(e) =>
                  setForm({ ...form, cityName: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
              />

              <input
                placeholder="State"
                value={form.stateName}
                onChange={(e) =>
                  setForm({ ...form, stateName: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
              />

              <input
                placeholder="Country"
                value={form.countryName}
                onChange={(e) =>
                  setForm({ ...form, countryName: e.target.value })
                }
                className="md:col-span-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Source */}
          <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Source
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-gray-600">
                  Type of Client
                </label>
                <select
                  required
                  value={form.sourcebyTypeOfClient}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sourcebyTypeOfClient: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
                >
                  <option value="">Select Type</option>
                  {sourceOptions.map((src) => (
                    <option key={src}>{src}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Source From
                </label>
                <input
                  value={form.sourceFrom}
                  onChange={(e) =>
                    setForm({ ...form, sourceFrom: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
                  placeholder="Enter source"
                />
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Assignment
            </h3>

            <div>
              <label className="text-sm text-gray-600">
                Assign Staff
              </label>
              <select
                value={form.assignById}
                onChange={(e) =>
                  setForm({ ...form, assignById: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
              >
                <option value="">Select Staff</option>
                {staffList.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Remark */}
          <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Remark
            </h3>

            <div>
              <textarea
                value={form.remark}
                onChange={(e) =>
                  setForm({ ...form, remark: e.target.value })
                }
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-300 focus:bg-white outline-none"
                placeholder="Enter remark"
              />
            </div>
          </div>
        </form>

      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Account"
        message="Are you sure you want to delete this account? This action cannot be undone."
        confirmText="Delete"
      />

      <ConfirmDialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        onConfirm={confirmSubmit}
        title={editMode.isEdit ? "Update Account" : "Add Account"}
        message={editMode.isEdit ? "Are you sure you want to update this account?" : "Are you sure you want to add this account?"}
        confirmText={editMode.isEdit ? "Update" : "Add"}
      />
    </>
  );
}
