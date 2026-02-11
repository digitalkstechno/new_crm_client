import DataTable, { Column } from "@/components/DataTable";
import Dialog from "@/components/Dialog";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

type LeadRow = {
  name: string;
  company: string;
  status: "New" | "Contacted" | "Qualified" | "Proposal" | "Won" | "Lost";
  owner: string;
  nextFollowUp: string;
  value: string;
};

const initialLeadData: LeadRow[] = [
  { name: "Aarav Sharma", company: "Nexa Labs", status: "New", owner: "Priya", nextFollowUp: "2026-02-12", value: "$4,500" },
  { name: "Isha Patel", company: "BlueOrbit", status: "Contacted", owner: "Rahul", nextFollowUp: "2026-02-14", value: "$6,200" },
  { name: "Vikram Singh", company: "Orbitly", status: "Qualified", owner: "Neha", nextFollowUp: "2026-02-15", value: "$12,000" },
  { name: "Zoya Khan", company: "NovaTech", status: "Proposal", owner: "Amit", nextFollowUp: "2026-02-16", value: "$8,750" },
  { name: "Rohan Mehta", company: "PulseHQ", status: "Won", owner: "Sneha", nextFollowUp: "2026-02-18", value: "$19,200" },
  { name: "Meera Joshi", company: "Skyline", status: "Lost", owner: "Kabir", nextFollowUp: "2026-02-19", value: "$3,100" },
  { name: "Kunal Verma", company: "Nexa Labs", status: "Qualified", owner: "Priya", nextFollowUp: "2026-02-21", value: "$9,800" },
  { name: "Aditi Rao", company: "BlueOrbit", status: "Contacted", owner: "Rahul", nextFollowUp: "2026-02-22", value: "$5,600" },
  { name: "Siddharth Jain", company: "NovaTech", status: "Proposal", owner: "Amit", nextFollowUp: "2026-02-24", value: "$11,450" },
  { name: "Anaya Kapoor", company: "PulseHQ", status: "New", owner: "Sneha", nextFollowUp: "2026-02-25", value: "$7,300" },
  { name: "Dev Malhotra", company: "Orbitly", status: "Qualified", owner: "Neha", nextFollowUp: "2026-02-26", value: "$10,900" },
  { name: "Ria Nair", company: "Skyline", status: "Contacted", owner: "Kabir", nextFollowUp: "2026-02-28", value: "$4,950" },
  { name: "Arjun Gupta", company: "Nexa Labs", status: "Proposal", owner: "Priya", nextFollowUp: "2026-03-01", value: "$13,250" },
  { name: "Simran Kaur", company: "BlueOrbit", status: "Qualified", owner: "Rahul", nextFollowUp: "2026-03-02", value: "$6,950" },
  { name: "Manav Sethi", company: "NovaTech", status: "Won", owner: "Amit", nextFollowUp: "2026-03-03", value: "$21,600" },
  { name: "Pooja Iyer", company: "PulseHQ", status: "Contacted", owner: "Sneha", nextFollowUp: "2026-03-04", value: "$5,400" },
  { name: "Harsh Vora", company: "Orbitly", status: "New", owner: "Neha", nextFollowUp: "2026-03-05", value: "$4,250" },
  { name: "Naina Das", company: "Skyline", status: "Qualified", owner: "Kabir", nextFollowUp: "2026-03-06", value: "$9,100" },
  { name: "Yash Agarwal", company: "Nexa Labs", status: "Proposal", owner: "Priya", nextFollowUp: "2026-03-07", value: "$14,700" },
  { name: "Kiara Bedi", company: "BlueOrbit", status: "Lost", owner: "Rahul", nextFollowUp: "2026-03-08", value: "$3,900" },
  { name: "Neil Dutta", company: "NovaTech", status: "Qualified", owner: "Amit", nextFollowUp: "2026-03-09", value: "$8,650" },
  { name: "Tara Menon", company: "PulseHQ", status: "Contacted", owner: "Sneha", nextFollowUp: "2026-03-10", value: "$6,100" },
];

const statusStyles: Record<LeadRow["status"], string> = {
  New: "bg-sky-100 text-sky-800",
  Contacted: "bg-amber-100 text-amber-800",
  Qualified: "bg-indigo-100 text-indigo-800",
  Proposal: "bg-violet-100 text-violet-800",
  Won: "bg-emerald-100 text-emerald-800",
  Lost: "bg-rose-100 text-rose-800",
};

export default function LeadsPage() {
  const [open, setOpen] = useState(false);
  const [leads, setLeads] = useState<LeadRow[]>(initialLeadData);
  const [form, setForm] = useState({
    name: "",
    company: "",
    status: "New" as LeadRow["status"],
    owner: "",
    nextFollowUp: "",
    value: "",
  });

  const columns: Column<LeadRow>[] = useMemo(
    () => [
      { key: "name", label: "Lead" },
      { key: "company", label: "Company" },
      {
        key: "status",
        label: "Status",
        render: (value) => {
          const status = value as LeadRow["status"];
          return (
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
              {status}
            </span>
          );
        },
      },
      { key: "owner", label: "Owner" },
      { key: "nextFollowUp", label: "Next Follow-up" },
      { key: "value", label: "Deal Value", className: "text-right font-semibold" },
    ],
    []
  );

  const resetForm = () =>
    setForm({
      name: "",
      company: "",
      status: "New",
      owner: "",
      nextFollowUp: "",
      value: "",
    });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLeads((prev) => [{ ...form }, ...prev]);
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
          Add Lead
        </button>
      </div>
      <DataTable
        title="Leads Pipeline"
        data={leads}
        pageSize={10}
        searchPlaceholder="Search leads, company, owner..."
        columns={columns}
      />






      

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add new lead"
        description="Fill the lead details to add it in the pipeline."
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
              form="lead-form"
            >
              Save Lead
            </button>
          </div>
        }
      >
        <form id="lead-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-600">
              Lead Name
              <input
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
                placeholder="e.g. Aarav Sharma"
              />
            </label>
            <label className="block text-sm text-gray-600">
              Company
              <input
                required
                value={form.company}
                onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
                placeholder="e.g. Nexa Labs"
              />
            </label>
            <label className="block text-sm text-gray-600">
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value as LeadRow["status"] }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </label>
            <label className="block text-sm text-gray-600">
              Owner
              <input
                required
                value={form.owner}
                onChange={(event) => setForm((prev) => ({ ...prev, owner: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
                placeholder="e.g. Priya"
              />
            </label>
            <label className="block text-sm text-gray-600">
              Next Follow-up
              <input
                required
                type="date"
                value={form.nextFollowUp}
                onChange={(event) => setForm((prev) => ({ ...prev, nextFollowUp: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
              />
            </label>
            <label className="block text-sm text-gray-600">
              Deal Value
              <input
                required
                value={form.value}
                onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
                placeholder="$7,500"
              />
            </label>
          </div>
          <label className="block text-sm text-gray-600">
            Notes
            <textarea
              rows={4}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white"
              placeholder="Add a quick note about the lead..."
            />
          </label>
        </form>
      </Dialog>
    </>
  );
}
