import DataTable, { Column } from "@/components/DataTable";
import Dialog from "@/components/Dialog";
import axios from "axios";
import { Plus, ArrowRight } from "lucide-react";
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
  assignBy?: Staff;
};

const staffList: Staff[] = [
  { _id: "1", fullName: "Rahul Sharma" },
  { _id: "2", fullName: "Priya Patel" },
];

const initialData: AccountRow[] = [
  {
    companyName: "Nexa Labs",
    clientName: "Aarav Sharma",
    mobile: "9876543210",
    email: "aarav@nexa.com",
    website: "www.nexa.com",
    sourcebyTypeOfClient: "B to B Vendor",
    assignBy: staffList[0],
  },
];

const sourceOptions = [
  "B to B Vendor",
  "Direct Com",
  "Networking Group",
  "EndUser Reatil",
  "O.E.M",
];

export default function AccountMasterPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get(`${baseUrl.ACCOUNTMASTER}?page=1&limit=100`);
      setAccounts(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch accounts");
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
    assignById: "",
  });
  console.log("🚀 ~ AccountMasterPage ~ form:", form)

  const columns: Column<AccountRow>[] = useMemo(
    () => [
      { key: "companyName", label: "Company" },
      { key: "clientName", label: "Client" },
      { key: "mobile", label: "Mobile" },
      { key: "email", label: "Email" },
      {
        key: "sourcebyTypeOfClient",
        label: "Source",
      },
      {
        key: "assignBy",
        label: "Assigned Staff",
        render: (value) =>
          value ? (value as Staff).fullName : "-",
      },
      {
        key: "companyName" as keyof AccountRow,
        label: "Action",
        render: (value: any, row: AccountRow) => (
          <button
            onClick={() => router.push(`/convert-to-lead?accountId=${row._id}`)}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Convert to Lead
            <ArrowRight className="h-3 w-3" />
          </button>
        ),
      },
    ],
    [router]
  );

  const resetForm = () =>
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
      assignById: "",
    });

const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();

  try {
    const selectedStaff = staffList.find(
      (s) => s._id === form.assignById
    );

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
      assignBy: selectedStaff?._id || null,
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
};


  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Add Account
        </button>
      </div>

      <DataTable
        title="Account Master"
        data={accounts}
        pageSize={10}
        searchPlaceholder="Search company, client..."
        columns={columns}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add Account"
        description="Create new account entry."
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
              Save
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

          {/* Source & Assignment */}
          <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Source & Assignment
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-gray-600">
                  Source Type
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
                  <option value="">Select Source</option>
                  {sourceOptions.map((src) => (
                    <option key={src}>{src}</option>
                  ))}
                </select>
              </div>

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
          </div>
        </form>

      </Dialog>
    </>
  );
}
