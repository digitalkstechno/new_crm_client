import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { LeadStatus } from "@/constants/leadStatus";

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
    mobile?: string;
    sourcebyTypeOfClient?: {
      _id: string;
      name: string;
      isHighlight?: boolean;
    };
    assignBy?: {
      _id: string;
      fullName: string;
    };
  };
  items: any[];
  maxStatusReached?: LeadStatus;
};

export default function KanbanCard({
  lead,
  status,
  onDragStart,
  onViewLead,
  onFollowUpClick,
  onOrderExecutionClick,
  onMoveToLost,
}: {
  lead: Lead;
  status: LeadStatus;
  onDragStart: (e: React.DragEvent, leadId: string, fromStatus: LeadStatus) => void;
  onViewLead: (lead: Lead) => void;
  onFollowUpClick: (leadId: string) => void;
  onOrderExecutionClick: (lead: Lead) => void;
  onMoveToLost: (leadId: string) => void;
}) {
  const [showAllItems, setShowAllItems] = useState(false);
  const isHighlighted = lead.accountMaster?.sourcebyTypeOfClient?.isHighlight || false;
  const doneItems = lead.items?.filter((item: any) => item.isDone).length || 0;
  const totalItems = lead.items?.length || 0;
  const displayItems = showAllItems ? lead.items : lead.items?.slice(0, 2);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead._id, status)}
      className={`group cursor-grab rounded-2xl p-4 shadow-sm transition-all hover:shadow-lg active:cursor-grabbing ${
        isHighlighted ? "bg-yellow-50 ring-2 ring-yellow-400" : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
            {lead.accountMaster?.companyName || "N/A"}
          </h4>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
            {lead.accountMaster?.clientName || "N/A"}
          </p>
        </div>
        {lead.accountMaster?.mobile && (
          <a
            href={`https://wa.me/${lead.accountMaster.mobile}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white transition hover:bg-green-700"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        )}
      </div>

      {totalItems > 0 && (
        <div className="mt-3 space-y-1.5">
          {displayItems?.map((item: any, index: number) => (
            <div key={index} className="rounded-lg bg-gray-50 px-2 py-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">
                  {item.modelSuggestion?.name || "N/A"}
                </span>
                <span className="text-gray-500">Qty: {item.qty}</span>
              </div>
              <p className="mt-0.5 text-gray-500">{item.modelSuggestion?.modelNo || "-"}</p>
            </div>
          ))}
          {totalItems > 2 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAllItems(!showAllItems);
              }}
              className="w-full rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
            >
              {showAllItems ? "Show Less" : `Show ${totalItems - 2} More`}
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {isHighlighted && (
          <span className="rounded-lg bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
            {lead.accountMaster?.sourcebyTypeOfClient?.name}
          </span>
        )}
        {status === "Order Execution" && totalItems > 0 && (
          <span className="rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            {doneItems}/{totalItems} Done
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-bold text-green-600">₹{lead.totalAmount}</span>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
          {lead.accountMaster?.assignBy?.fullName
            ? lead.accountMaster.assignBy.fullName.split(" ").map(word => word.charAt(0)).join("").toUpperCase()
            : "AU"}
        </div>
      </div>

      <div className="mt-3 flex gap-1.5">
        <button
          onClick={() => onViewLead(lead)}
          className="flex-1 rounded-xl bg-slate-900 px-2 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          View
        </button>
        {status === "Follow Up" && (
          <button
            onClick={() => onFollowUpClick(lead._id)}
            className="flex-1 rounded-xl bg-blue-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Follow Up
          </button>
        )}
        {status === "Order Execution" && (
          <button
            onClick={() => onOrderExecutionClick(lead)}
            className="flex-1 rounded-xl bg-green-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
          >
            Items
          </button>
        )}
        {status !== "Lost" && (
          <button
            onClick={() => onMoveToLost(lead._id)}
            className="rounded-xl bg-rose-500 px-2 py-2 text-xs font-semibold text-white transition hover:bg-rose-600"
          >
            Lost
          </button>
        )}
      </div>
    </div>
  );
}
