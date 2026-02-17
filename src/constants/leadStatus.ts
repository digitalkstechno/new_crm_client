export const LEAD_STATUSES = [
  "New Lead",
  "Quotation Given",
  "Follow Up",
  "Order Confirmation",
  "PI",
  "Order Execution",
  "Dispatch",
  "Final Payment",
  "Completed",
  "Lost",
] as const;

export type LeadStatus = typeof LEAD_STATUSES[number];

export const STATUS_COLORS: Record<LeadStatus, string> = {
  "New Lead": "bg-blue-600 text-white",
  "Quotation Given": "bg-purple-600 text-white",
  "Follow Up": "bg-amber-600 text-white",
  "Order Confirmation": "bg-green-600 text-white",
  "PI": "bg-indigo-600 text-white",
  "Order Execution": "bg-orange-600 text-white",
  "Dispatch": "bg-cyan-600 text-white",
  "Final Payment": "bg-pink-600 text-white",
  "Completed": "bg-emerald-600 text-white",
  "Lost": "bg-gray-600 text-white",
};

export const KANBAN_COLORS: Record<LeadStatus, string> = {
  "New Lead": "bg-blue-600",
  "Quotation Given": "bg-purple-600",
  "Follow Up": "bg-amber-600",
  "Order Confirmation": "bg-green-600",
  "PI": "bg-indigo-600",
  "Order Execution": "bg-orange-600",
  "Dispatch": "bg-cyan-600",
  "Final Payment": "bg-pink-600",
  "Completed": "bg-emerald-600",
  "Lost": "bg-gray-600",
};
