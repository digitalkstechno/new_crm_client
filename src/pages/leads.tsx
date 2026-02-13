"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import Dialog from "@/components/Dialog";
import { api } from "@/utils/axiosInstance";
import { baseUrl } from "../../config";
import toast from "react-hot-toast";

/* ================= TYPES ================= */

type LeadStatus =
  | "New Lead"
  | "Quotation Given"
  | "Follow Remark"
  | "Order Confirmation"
  | "PI"
  | "Order Execution"
  | "Dispatch"
  | "Final Payment"
  | "Completed"
  | "Lost";

type Lead = {
  _id: string;
  leadDate: string;
  clientType: string;
  deliveryDate: string;
  leadStatus: LeadStatus;
  totalAmount: string;
  accountMaster?: {
    companyName: string;
    clientName: string;
  };
  items: any[];
};

const STATUSES: LeadStatus[] = [
  "New Lead",
  "Quotation Given",
  "Follow Remark",
  "Order Confirmation",
  "PI",
  "Order Execution",
  "Dispatch",
  "Final Payment",
  "Completed",
  "Lost",
];

const STATUS_COLORS: Record<LeadStatus, string> = {
  "New Lead": "bg-blue-100 text-blue-700",
  "Quotation Given": "bg-purple-100 text-purple-700",
  "Follow Remark": "bg-yellow-100 text-yellow-700",
  "Order Confirmation": "bg-green-100 text-green-700",
  "PI": "bg-indigo-100 text-indigo-700",
  "Order Execution": "bg-orange-100 text-orange-700",
  "Dispatch": "bg-cyan-100 text-cyan-700",
  "Final Payment": "bg-pink-100 text-pink-700",
  "Completed": "bg-emerald-100 text-emerald-700",
  "Lost": "bg-red-100 text-red-700",
};

/* ================= PAGE ================= */

export default function LeadsPage() {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [kanbanPages, setKanbanPages] = useState<Record<LeadStatus, number>>({} as any);
  const [kanbanLoading, setKanbanLoading] = useState<Record<LeadStatus, boolean>>({} as any);

  useEffect(() => {
    if (view === "table") {
      fetchLeads();
    } else {
      fetchKanbanLeads();
    }
  }, [view]);

  const fetchLeads = async () => {
    try {
      const response = await api.get(`${baseUrl.LEAD}?page=1&limit=100`);
      setLeads(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch leads");
    }
  };

  const fetchKanbanLeads = async () => {
    try {
      const response = await api.get(`${baseUrl.LEAD}?page=1&limit=100`);
      setLeads(response.data.data || []);
      const pages: any = {};
      STATUSES.forEach(status => {
        pages[status] = 1;
      });
      setKanbanPages(pages);
    } catch (error) {
      toast.error("Failed to fetch leads");
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await api.put(`${baseUrl.LEAD}/${leadId}`, { leadStatus: newStatus });
      setLeads(prev => prev.map(l => l._id === leadId ? { ...l, leadStatus: newStatus } : l));
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setViewDialogOpen(true);
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter(l => l.leadStatus === status);
  };

  const columns: Column<Lead>[] = [
    { 
      key: "accountMaster", 
      label: "Company",
      render: (value: any) => value?.companyName || "-"
    },
    { 
      key: "accountMaster", 
      label: "Client",
      render: (value: any) => value?.clientName || "-"
    },
    { 
      key: "leadDate", 
      label: "Lead Date",
      render: (value: any) => new Date(value).toLocaleDateString()
    },
    { key: "clientType", label: "Client Type" },
    { 
      key: "leadStatus", 
      label: "Status",
      render: (value: any) => (
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[value as LeadStatus]}`}>
          {value}
        </span>
      )
    },
    { 
      key: "totalAmount", 
      label: "Total Amount",
      render: (value: any) => `₹${value}`
    },
    { 
      key: "_id", 
      label: "Action",
      render: (value: any, row: Lead) => (
        <button
          onClick={() => handleViewLead(row)}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <Eye className="h-3 w-3" />
          View
        </button>
      )
    },
  ];

  return (
    <>
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setView("table")}
            className={`rounded-lg px-4 py-2 text-sm ${
              view === "table"
                ? "bg-black text-white"
                : "border"
            }`}
          >
            Table View
          </button>

          <button
            onClick={() => setView("kanban")}
            className={`rounded-lg px-4 py-2 text-sm ${
              view === "kanban"
                ? "bg-black text-white"
                : "border"
            }`}
          >
            Kanban View
          </button>
        </div>

     
      </div>

      {/* TABLE */}
      {view === "table" && (
        <DataTable
          title="Leads"
          data={leads}
          pageSize={10}
          searchPlaceholder="Search leads..."
          columns={columns}
        />
      )}

      {/* KANBAN */}
      {view === "kanban" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
            {STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                leads={getLeadsByStatus(status)}
                onStatusChange={handleStatusChange}
                onViewLead={handleViewLead}
              />
            ))}
          </div>
        </div>
      )}

      {/* VIEW DIALOG */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        title="Lead Details"
        description="Complete lead information"
      >
        {selectedLead && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-gray-600">Company</label>
                <p className="text-gray-900">{selectedLead.accountMaster?.companyName || "-"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Client</label>
                <p className="text-gray-900">{selectedLead.accountMaster?.clientName || "-"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Lead Date</label>
                <p className="text-gray-900">{new Date(selectedLead.leadDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Client Type</label>
                <p className="text-gray-900">{selectedLead.clientType}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Status</label>
                <p className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[selectedLead.leadStatus]}`}>
                  {selectedLead.leadStatus}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Delivery Date</label>
                <p className="text-gray-900">{new Date(selectedLead.deliveryDate).toLocaleDateString()}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600">Total Amount</label>
                <p className="text-lg font-bold text-green-600">₹{selectedLead.totalAmount}</p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-600">Items ({selectedLead.items?.length || 0})</label>
              <div className="space-y-2">
                {selectedLead.items?.map((item: any, index: number) => (
                  <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="grid gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="font-semibold">Item {index + 1}</span>
                        <span className="font-bold text-gray-900">₹{item.total}</span>
                      </div>
                      <div className="grid gap-1 text-gray-600">
                        <p>Qty: {item.qty} | Rate: ₹{item.rate} | GST: {item.gst}%</p>
                        <p>Customization: {item.customizationType}</p>
                        {item.personalization?.isPersonalized && (
                          <p>Location: {item.personalization.location}</p>
                        )}
                        {item.personalization?.description && (
                          <p>Description: {item.personalization.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}

/* ================= KANBAN COLUMN ================= */

function KanbanColumn({
  status,
  leads,
  onStatusChange,
  onViewLead,
}: {
  status: LeadStatus;
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onViewLead: (lead: Lead) => void;
}) {
  return (
    <div className="w-80 flex-shrink-0 rounded-2xl bg-gray-100 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{status}</h3>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
          {leads.length}
        </span>
      </div>

      <div className="max-h-[calc(100vh-200px)] space-y-3 overflow-y-auto">
        {leads.map((lead) => (
          <div
            key={lead._id}
            className="cursor-pointer rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
            onClick={() => onViewLead(lead)}
          >
            <h4 className="text-sm font-semibold text-gray-900">
              {lead.accountMaster?.companyName || "N/A"}
            </h4>
            <p className="text-xs text-gray-500">{lead.accountMaster?.clientName || "N/A"}</p>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-600">{lead.clientType}</span>
              <span className="text-sm font-bold text-green-600">₹{lead.totalAmount}</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
              <span>{new Date(lead.deliveryDate).toLocaleDateString()}</span>
              <span>{lead.items?.length || 0} items</span>
            </div>

            <div className="mt-2">
              <select
                value={lead.leadStatus}
                onChange={(e) => {
                  e.stopPropagation();
                  onStatusChange(lead._id, e.target.value as LeadStatus);
                }}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
