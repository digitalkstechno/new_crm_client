"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Eye } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import { api } from "@/utils/axiosInstance";
import { baseUrl } from "../../config";
import toast from "react-hot-toast";
import { LEAD_STATUSES, STATUS_COLORS, LeadStatus } from "@/constants/leadStatus";

/* ================= TYPES ================= */

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
    sourcebyTypeOfClient?: string;
    assignBy?: {
      _id: string;
      fullName: string;
    };
  };
  items: any[];
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
  const [allowedStatuses, setAllowedStatuses] = useState<LeadStatus[]>([]);
  const [kanbanPages, setKanbanPages] = useState<Record<LeadStatus, number>>({} as any);
  const [kanbanHasMore, setKanbanHasMore] = useState<Record<LeadStatus, boolean>>({} as any);
  const [kanbanLoading, setKanbanLoading] = useState<Record<LeadStatus, boolean>>({} as any);
  const [kanbanLeads, setKanbanLeads] = useState<Record<LeadStatus, Lead[]>>({} as any);
  const [kanbanTotalCounts, setKanbanTotalCounts] = useState<Record<LeadStatus, number>>({} as any);

  useEffect(() => {
    const permissions = localStorage.getItem("permissions");
    if (permissions) {
      setAllowedStatuses(JSON.parse(permissions));
    }
  }, []);

  const fetchLeads = async () => {
    try {
      const url = statusFilter 
        ? `${baseUrl.LEAD}/status/${encodeURIComponent(statusFilter)}?page=${page}&limit=10&search=${search}`
        : `${baseUrl.LEAD}?page=${page}&limit=10&search=${search}`;
      const response = await api.get(url);
      
      let filteredLeads = response.data.data || [];
      
      // Get current user's role and staff ID
      const staffId = localStorage.getItem("staffId");
      const accountMasterViewType = localStorage.getItem("accountMasterViewType");
      
      // If view type is "view_own", filter only assigned leads
      if (accountMasterViewType === "view_own" && staffId) {
        filteredLeads = filteredLeads.filter((lead: Lead) => 
          lead.accountMaster?.assignBy?._id === staffId
        );
      }
      
      setLeads(filteredLeads);
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
      let newLeads = response.data.data || [];
      
      // Get current user's role and staff ID
      const staffId = localStorage.getItem("staffId");
      const accountMasterViewType = localStorage.getItem("accountMasterViewType");
      
      // If view type is "view_own", filter only assigned leads
      if (accountMasterViewType === "view_own" && staffId) {
        newLeads = newLeads.filter((lead: Lead) => 
          lead.accountMaster?.assignBy?._id === staffId
        );
      }
      
      setKanbanLeads(prev => ({
        ...prev,
        [status]: [...(prev[status] || []), ...newLeads]
      }));
      setKanbanHasMore(prev => ({
        ...prev,
        [status]: pageNum < (response.data.pagination?.totalPages || 1)
      }));
      
      // Store total count
      if (pageNum === 1) {
        setKanbanTotalCounts(prev => ({
          ...prev,
          [status]: response.data.pagination?.totalRecords || 0
        }));
      }
    } catch (error) {
      toast.error("Failed to fetch leads");
    } finally {
      setKanbanLoading(prev => ({ ...prev, [status]: false }));
    }
  };

  useEffect(() => {
    if (allowedStatuses.length === 0) return;
    
    if (view === "table") {
      fetchLeads();
    } else {
      const initialPages: any = {};
      const initialHasMore: any = {};
      const initialLoading: any = {};
      const initialLeads: any = {};
      allowedStatuses.forEach(status => {
        initialPages[status] = 1;
        initialHasMore[status] = true;
        initialLoading[status] = false;
        initialLeads[status] = [];
      });
      setKanbanPages(initialPages);
      setKanbanHasMore(initialHasMore);
      setKanbanLoading(initialLoading);
      setKanbanLeads(initialLeads);
      allowedStatuses.forEach(status => fetchKanbanLeadsByStatus(status, 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, page, search, statusFilter, allowedStatuses.length]);

  const handleKanbanScroll = (status: LeadStatus) => (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && kanbanHasMore[status] && !kanbanLoading[status]) {
      const nextPage = kanbanPages[status] + 1;
      setKanbanPages(prev => ({ ...prev, [status]: nextPage }));
      fetchKanbanLeadsByStatus(status, nextPage);
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: string, fromStatus: LeadStatus) => {
    e.dataTransfer.setData("leadId", leadId);
    e.dataTransfer.setData("fromStatus", fromStatus);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, toStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    const fromStatus = e.dataTransfer.getData("fromStatus") as LeadStatus;
    
    if (fromStatus === toStatus) return;
    
    await handleStatusChange(leadId, toStatus);
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
            {allowedStatuses.map((status) => (
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
          {allowedStatuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={getLeadsByStatus(status)}
              totalCount={kanbanTotalCounts[status] || 0}
              onStatusChange={handleStatusChange}
              onViewLead={handleViewLead}
              onScroll={handleKanbanScroll(status)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              loading={kanbanLoading[status]}
              hasMore={kanbanHasMore[status]}
              allowedStatuses={allowedStatuses}
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
  totalCount,
  onStatusChange,
  onViewLead,
  onScroll,
  onDragStart,
  onDragOver,
  onDrop,
  loading,
  hasMore,
  allowedStatuses,
}: {
  status: LeadStatus;
  leads: Lead[];
  totalCount: number;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onViewLead: (lead: Lead) => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.DragEvent, leadId: string, fromStatus: LeadStatus) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, toStatus: LeadStatus) => void;
  loading: boolean;
  hasMore: boolean;
  allowedStatuses: LeadStatus[];
}) {
  return (
    <div 
      className="w-80 flex-shrink-0 rounded-2xl bg-gray-100 p-3"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="mb-3 flex items-center justify-between sticky top-0 bg-gray-100 z-10">
        <h3 className="text-sm font-semibold text-gray-900">{status}</h3>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
          {totalCount}
        </span>
      </div>

      <div className="h-[calc(100vh-220px)] overflow-y-auto space-y-3" onScroll={onScroll}>
        {leads.map((lead) => {
          const isOEM = lead.accountMaster?.sourcebyTypeOfClient === "O.E.M";
          return (
            <div
              key={lead._id}
              draggable
              onDragStart={(e) => onDragStart(e, lead._id, status)}
              className={`rounded-xl p-3 shadow-sm ring-1 transition hover:shadow-md cursor-grab active:cursor-grabbing ${
                isOEM
                  ? "bg-yellow-100 ring-yellow-300 hover:bg-yellow-200"
                  : "bg-white ring-gray-200"
              }`}
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
                <button
                  onClick={() => onViewLead(lead)}
                  className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <Eye className="h-3 w-3" />
                  View Details
                </button>
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
