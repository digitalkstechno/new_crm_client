"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Eye, Calendar, CheckSquare, XCircle } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import FollowUpDialog from "@/components/FollowUpDialog";
import OrderExecutionDialog from "@/components/OrderExecutionDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
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
  maxStatusReached?: LeadStatus;
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
  const [followUpDialog, setFollowUpDialog] = useState<{ isOpen: boolean; leadId: string | null; pendingStatus?: LeadStatus }>({ isOpen: false, leadId: null });
  const [orderExecutionDialog, setOrderExecutionDialog] = useState<{ isOpen: boolean; lead: Lead | null }>({ isOpen: false, lead: null });
  const [lostConfirmDialog, setLostConfirmDialog] = useState<{ isOpen: boolean; leadId: string | null }>({ isOpen: false, leadId: null });

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
    
    // Check backward movement
    const lead = [...leads, ...Object.values(kanbanLeads).flat()].find(l => l._id === leadId);
    if (lead) {
      const LEAD_STATUSES_ORDER = ["New Lead", "Quotation Given", "Follow Up", "Order Confirmation", "PI", "Order Execution", "Dispatch", "Final Payment", "Completed"];
      const currentMaxIndex = LEAD_STATUSES_ORDER.indexOf(lead.maxStatusReached || lead.leadStatus);
      const newIndex = LEAD_STATUSES_ORDER.indexOf(toStatus);
      
      if (newIndex < currentMaxIndex && toStatus !== "Lost") {
        toast.error("Cannot move lead backwards in status");
        return;
      }
    }
    
    if (toStatus === "Follow Up") {
      setFollowUpDialog({ isOpen: true, leadId, pendingStatus: toStatus });
    } else if (fromStatus === "Follow Up" && toStatus === "Order Confirmation") {
      router.push(`/convert-to-lead?leadId=${leadId}`);
    } else if (toStatus === "Dispatch") {
      // Fetch fresh lead data from API to check isDone status
      try {
        const response = await api.get(`${baseUrl.LEAD}/${leadId}`);
        const freshLead = response.data.data;
        const allDone = freshLead.items.every((item: any) => item.isDone);
        if (!allDone) {
          toast.error("All items must be marked as done before dispatch");
          return;
        }
        await handleStatusChange(leadId, toStatus);
      } catch (error) {
        toast.error("Failed to verify lead status");
      }
    } else {
      await handleStatusChange(leadId, toStatus);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await api.put(`${baseUrl.LEAD}/${leadId}`, { leadStatus: newStatus });
      
      // Update counts
      if (view === "kanban") {
        const lead = Object.values(kanbanLeads).flat().find(l => l._id === leadId);
        if (lead) {
          const oldStatus = lead.leadStatus;
          setKanbanTotalCounts(prev => ({
            ...prev,
            [oldStatus]: Math.max(0, (prev[oldStatus] || 0) - 1),
            [newStatus]: (prev[newStatus] || 0) + 1
          }));
        }
      }
      
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleViewLead = (lead: Lead) => {
    router.push(`/lead-details/${lead._id}`);
  };

  const handleFollowUpClick = (leadId: string) => {
    setFollowUpDialog({ isOpen: true, leadId });
  };

  const handleOrderExecutionClick = (lead: Lead) => {
    setOrderExecutionDialog({ isOpen: true, lead });
  };

  const handleMoveToLost = async (leadId: string) => {
    setLostConfirmDialog({ isOpen: true, leadId });
  };

  const confirmMoveToLost = async () => {
    if (lostConfirmDialog.leadId) {
      await handleStatusChange(lostConfirmDialog.leadId, "Lost");
    }
  };

  const handleFollowUpSubmit = async (date: string, description: string) => {
    try {
      const { leadId, pendingStatus } = followUpDialog;
      if (!leadId) return;

      await api.post(`${baseUrl.LEAD}/${leadId}/followup`, { date, description });
      
      if (pendingStatus) {
        await handleStatusChange(leadId, pendingStatus);
      }
      
      toast.success("Follow up added successfully");
      setFollowUpDialog({ isOpen: false, leadId: null });
    } catch (error) {
      toast.error("Failed to add follow up");
    }
  };

  const refetchLeads = () => {
    if (view === "table") {
      fetchLeads();
    } else {
      allowedStatuses.forEach(status => {
        setKanbanLeads(prev => ({ ...prev, [status]: [] }));
        setKanbanPages(prev => ({ ...prev, [status]: 1 }));
        fetchKanbanLeadsByStatus(status, 1);
      });
    }
  };

  const refetchSingleLead = async (leadId: string) => {
    try {
      const response = await api.get(`${baseUrl.LEAD}/${leadId}`);
      const updatedLead = response.data.data;
      
      if (view === "table") {
        setLeads(prev => prev.map(l => l._id === leadId ? updatedLead : l));
      } else {
        setKanbanLeads(prev => {
          const updated = { ...prev };
          for (const status in updated) {
            updated[status] = updated[status].map(l => 
              l._id === leadId ? updatedLead : l
            );
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to refetch lead", error);
    }
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
        <div className="flex gap-2">
          <button
            onClick={() => handleViewLead(row)}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <Eye className="h-3 w-3" />
            View
          </button>
          {row.leadStatus === "Follow Up" && (
            <button
              onClick={() => handleFollowUpClick(row._id)}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Calendar className="h-3 w-3" />
              Follow Up
            </button>
          )}
          {row.leadStatus === "Order Execution" && (
            <button
              onClick={() => handleOrderExecutionClick(row)}
              className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
            >
              <CheckSquare className="h-3 w-3" />
              Items
            </button>
          )}
          {row.leadStatus !== "Lost" && (
            <button
              onClick={() => handleMoveToLost(row._id)}
              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              <XCircle className="h-3 w-3" />
              Lost
            </button>
          )}
        </div>
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
              onFollowUpClick={handleFollowUpClick}
              onOrderExecutionClick={handleOrderExecutionClick}
              onMoveToLost={handleMoveToLost}
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

      <FollowUpDialog
        isOpen={followUpDialog.isOpen}
        onClose={() => setFollowUpDialog({ isOpen: false, leadId: null })}
        onSubmit={handleFollowUpSubmit}
      />

      {orderExecutionDialog.lead && (
        <OrderExecutionDialog
          isOpen={orderExecutionDialog.isOpen}
          onClose={() => setOrderExecutionDialog({ isOpen: false, lead: null })}
          leadId={orderExecutionDialog.lead._id}
          items={orderExecutionDialog.lead.items}
          onUpdate={() => refetchSingleLead(orderExecutionDialog.lead!._id)}
        />
      )}

      <ConfirmationDialog
        isOpen={lostConfirmDialog.isOpen}
        onClose={() => setLostConfirmDialog({ isOpen: false, leadId: null })}
        onConfirm={confirmMoveToLost}
        title="Mark Lead as Lost?"
        message="Are you sure you want to mark this lead as Lost? This action will move the lead to Lost status and it cannot be recovered to previous statuses."
      />
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
  onFollowUpClick,
  onOrderExecutionClick,
  onMoveToLost,
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
  onFollowUpClick: (leadId: string) => void;
  onOrderExecutionClick: (lead: Lead) => void;
  onMoveToLost: (leadId: string) => void;
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
          const doneItems = lead.items?.filter((item: any) => item.isDone).length || 0;
          const totalItems = lead.items?.length || 0;
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
                <span>{totalItems} items</span>
              </div>

              {status === "Order Execution" && (
                <div className="mt-2 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  Done: {doneItems} | Pending: {totalItems - doneItems}
                </div>
              )}

              <div className="mt-2 flex gap-1">
                <button
                  onClick={() => onViewLead(lead)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-slate-900 px-2 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <Eye className="h-3 w-3" />
                  View
                </button>
                {status === "Follow Up" && (
                  <button
                    onClick={() => onFollowUpClick(lead._id)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <Calendar className="h-3 w-3" />
                    Follow Up
                  </button>
                )}
                {status === "Order Execution" && (
                  <button
                    onClick={() => onOrderExecutionClick(lead)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-green-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    <CheckSquare className="h-3 w-3" />
                    Items
                  </button>
                )}
                {status !== "Lost" && (
                  <button
                    onClick={() => onMoveToLost(lead._id)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-red-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    <XCircle className="h-3 w-3" />
                    Lost
                  </button>
                )}
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
