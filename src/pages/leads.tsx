"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Eye } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
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
  const router = useRouter();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kanbanPages, setKanbanPages] = useState<Record<LeadStatus, number>>({} as any);
  const [kanbanHasMore, setKanbanHasMore] = useState<Record<LeadStatus, boolean>>({} as any);
  const [kanbanLoading, setKanbanLoading] = useState<Record<LeadStatus, boolean>>({} as any);
  const [kanbanLeads, setKanbanLeads] = useState<Record<LeadStatus, Lead[]>>({} as any);

  useEffect(() => {
    if (view === "table") {
      fetchLeads();
    } else {
      const initialPages: any = {};
      const initialHasMore: any = {};
      const initialLoading: any = {};
      const initialLeads: any = {};
      STATUSES.forEach(status => {
        initialPages[status] = 1;
        initialHasMore[status] = true;
        initialLoading[status] = false;
        initialLeads[status] = [];
      });
      setKanbanPages(initialPages);
      setKanbanHasMore(initialHasMore);
      setKanbanLoading(initialLoading);
      setKanbanLeads(initialLeads);
      STATUSES.forEach(status => fetchKanbanLeadsByStatus(status, 1));
    }
  }, [view, page, search, statusFilter]);

  const fetchLeads = async () => {
    try {
      const url = statusFilter 
        ? `${baseUrl.LEAD}/status/${encodeURIComponent(statusFilter)}?page=${page}&limit=10&search=${search}`
        : `${baseUrl.LEAD}?page=${page}&limit=10&search=${search}`;
      const response = await api.get(url);
      setLeads(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalRecords(response.data.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch leads");
    }
  };

  const fetchKanbanLeadsByStatus = async (status: LeadStatus, pageNum: number) => {
    if (kanbanLoading[status]) return;
    setKanbanLoading(prev => ({ ...prev, [status]: true }));
    try {
      const response = await api.get(`${baseUrl.LEAD}/status/${encodeURIComponent(status)}?page=${pageNum}&limit=10`);
      const newLeads = response.data.data || [];
      setKanbanLeads(prev => ({
        ...prev,
        [status]: [...(prev[status] || []), ...newLeads]
      }));
      setKanbanHasMore(prev => ({
        ...prev,
        [status]: pageNum < (response.data.pagination?.totalPages || 1)
      }));
    } catch (error) {
      toast.error("Failed to fetch leads");
    } finally {
      setKanbanLoading(prev => ({ ...prev, [status]: false }));
    }
  };

  const handleKanbanScroll = (status: LeadStatus) => (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && kanbanHasMore[status] && !kanbanLoading[status]) {
      const nextPage = kanbanPages[status] + 1;
      setKanbanPages(prev => ({ ...prev, [status]: nextPage }));
      fetchKanbanLeadsByStatus(status, nextPage);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await api.put(`${baseUrl.LEAD}/${leadId}`, { leadStatus: newStatus });
      if (view === "table") {
        setLeads(prev => prev.map(l => l._id === leadId ? { ...l, leadStatus: newStatus } : l));
      } else {
        const updatedLeads = { ...kanbanLeads };
        let movedLead: Lead | null = null;
        for (const status in updatedLeads) {
          const index = updatedLeads[status].findIndex(l => l._id === leadId);
          if (index !== -1) {
            movedLead = { ...updatedLeads[status][index], leadStatus: newStatus };
            updatedLeads[status].splice(index, 1);
            break;
          }
        }
        if (movedLead) {
          updatedLeads[newStatus] = [movedLead, ...(updatedLeads[newStatus] || [])];
        }
        setKanbanLeads(updatedLeads);
      }
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleViewLead = (lead: Lead) => {
    router.push(`/lead-details/${lead._id}`);
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    return view === "kanban" ? (kanbanLeads[status] || []) : leads.filter(l => l.leadStatus === status);
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

        {view === "table" && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none"
          >
            <option value="">All Status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        )}
      </div>

      {/* TABLE */}
      {view === "table" && (
        <DataTable
          title="Leads"
          data={leads}
          pageSize={10}
          searchPlaceholder="Search leads..."
          columns={columns}
          currentPage={page}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={setPage}
          onSearch={setSearch}
          rowClassName={(row) => row.accountMaster?.sourcebyTypeOfClient === "O.E.M" ? "bg-yellow-50 hover:bg-yellow-100" : ""}
        />
      )}

      {/* KANBAN */}
      {view === "kanban" && (
        <div className="flex gap-4">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={getLeadsByStatus(status)}
              onStatusChange={handleStatusChange}
              onViewLead={handleViewLead}
              onScroll={handleKanbanScroll(status)}
              loading={kanbanLoading[status]}
              hasMore={kanbanHasMore[status]}
            />
          ))}
        </div>
      )}


    </>
  );
}

/* ================= KANBAN COLUMN ================= */

function KanbanColumn({
  status,
  leads,
  onStatusChange,
  onViewLead,
  onScroll,
  loading,
  hasMore,
}: {
  status: LeadStatus;
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onViewLead: (lead: Lead) => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  loading: boolean;
  hasMore: boolean;
}) {
  return (
    <div className="w-80 flex-shrink-0 rounded-2xl bg-gray-100 p-3">
      <div className="mb-3 flex items-center justify-between sticky top-0 bg-gray-100 z-10">
        <h3 className="text-sm font-semibold text-gray-900">{status}</h3>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
          {leads.length}
        </span>
      </div>

      <div className="h-[calc(100vh-220px)] overflow-y-auto space-y-3" onScroll={onScroll}>
        {leads.map((lead) => {
          const isOEM = lead.accountMaster?.sourcebyTypeOfClient === "O.E.M";
          return (
            <div
              key={lead._id}
              className={`cursor-pointer rounded-xl p-3 shadow-sm ring-1 transition hover:shadow-md ${
                isOEM
                  ? "bg-yellow-100 ring-yellow-300 hover:bg-yellow-200"
                  : "bg-white ring-gray-200"
              }`}
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
          );
        })}
        {loading && hasMore && (
          <div className="py-4 text-center text-xs text-gray-500">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
