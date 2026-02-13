"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Package, User, MapPin, Phone, Mail, Globe, Calendar, DollarSign, Truck } from "lucide-react";
import { api } from "@/utils/axiosInstance";
import { baseUrl } from "../../../config";
import toast from "react-hot-toast";

type Lead = {
  _id: string;
  leadDate: string;
  clientType: string;
  deliveryDate: string;
  leadStatus: string;
  totalAmount: string;
  shippingCharges?: string;
  budget?: { from?: string; to?: string };
  accountMaster?: {
    companyName: string;
    clientName: string;
    mobile: string;
    email: string;
    website: string;
    sourcebyTypeOfClient: string;
    sourceFrom?: string;
    assignBy?: { _id: string; fullName: string };
    remark?: string;
    address?: {
      line1?: string;
      line2?: string;
      cityName?: string;
      stateName?: string;
      countryName?: string;
    };
  };
  items: Array<{
    _id: string;
    inquiryCategory: { _id: string; name: string };
    modelSuggestion: { _id: string; name: string; modelNo: string };
    customizationType: { _id: string; name: string };
    qty: string;
    rate: string;
    gst: string;
    total: string;
    personalization?: {
      isPersonalized: boolean;
      location?: string;
      description?: string;
      name?: string;
    };
  }>;
  remarks?: Array<{ date: string; remark: string }>;
  paymentHistory?: Array<{ date: string; amount: string; modeOfPayment: string; remark?: string }>;
};

const STATUS_COLORS: Record<string, string> = {
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

export default function LeadDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === 'string') fetchLead();
  }, [id]);

  const fetchLead = async () => {
    if (!id || typeof id !== 'string') return;
    try {
      const response = await api.get(`${baseUrl.LEAD}/${id}`);
      setLead(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch lead details");
    } finally {
      setLoading(false);
    }
  };

  if (router.isFallback || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Lead not found</div>
      </div>
    );
  }

  const formatAddress = (address?: any) => {
    if (!address) return "N/A";
    const parts = [address.line1, address.line2, address.cityName, address.stateName, address.countryName].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leads
        </button>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[lead.leadStatus]}`}>
          {lead.leadStatus}
        </span>
      </div>

      {/* CLIENT INFO */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-gray-500">Company Name</label>
            <p className="mt-1 text-sm text-gray-900">{lead.accountMaster?.companyName || "N/A"}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Client Name</label>
            <p className="mt-1 text-sm text-gray-900">{lead.accountMaster?.clientName || "N/A"}</p>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="mt-1 h-4 w-4 text-gray-400" />
            <div>
              <label className="text-xs font-semibold text-gray-500">Phone Number</label>
              <p className="mt-1 text-sm text-gray-900">{lead.accountMaster?.mobile || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Mail className="mt-1 h-4 w-4 text-gray-400" />
            <div>
              <label className="text-xs font-semibold text-gray-500">Email</label>
              <p className="mt-1 text-sm text-gray-900">{lead.accountMaster?.email || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Globe className="mt-1 h-4 w-4 text-gray-400" />
            <div>
              <label className="text-xs font-semibold text-gray-500">Website</label>
              <p className="mt-1 text-sm text-gray-900">{lead.accountMaster?.website || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-1 h-4 w-4 text-gray-400" />
            <div>
              <label className="text-xs font-semibold text-gray-500">Address</label>
              <p className="mt-1 text-sm text-gray-900">{formatAddress(lead.accountMaster?.address)}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Type of Client</label>
            <p className="mt-1 text-sm text-gray-900">{lead.accountMaster?.sourcebyTypeOfClient || "N/A"}</p>
          </div>
          {lead.accountMaster?.sourceFrom && (
            <div>
              <label className="text-xs font-semibold text-gray-500">Source From</label>
              <p className="mt-1 text-sm text-gray-900">{lead.accountMaster.sourceFrom}</p>
            </div>
          )}
          {lead.accountMaster?.assignBy && (
            <div>
              <label className="text-xs font-semibold text-gray-500">Assigned Staff</label>
              <p className="mt-1 text-sm text-gray-900">{lead.accountMaster.assignBy.fullName}</p>
            </div>
          )}
        </div>
        {lead.accountMaster?.remark && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <label className="text-xs font-semibold text-gray-500">Account Remark</label>
            <p className="mt-1 text-sm text-gray-700">{lead.accountMaster.remark}</p>
          </div>
        )}
      </div>

      {/* LEAD INFO */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Lead Information</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-gray-500">Lead Date</label>
            <p className="mt-1 text-sm text-gray-900">{new Date(lead.leadDate).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Delivery Date</label>
            <p className="mt-1 text-sm text-gray-900">{new Date(lead.deliveryDate).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Client Type</label>
            <p className="mt-1 text-sm text-gray-900">{lead.clientType}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Total Amount</label>
            <p className="mt-1 text-lg font-bold text-green-600">₹{lead.totalAmount}</p>
          </div>
          {lead.shippingCharges && (
            <div className="flex items-start gap-2">
              <Truck className="mt-1 h-4 w-4 text-gray-400" />
              <div>
                <label className="text-xs font-semibold text-gray-500">Shipping Charges</label>
                <p className="mt-1 text-sm text-gray-900">₹{lead.shippingCharges}</p>
              </div>
            </div>
          )}
          {lead.budget && (lead.budget.from || lead.budget.to) && (
            <div className="flex items-start gap-2">
              <DollarSign className="mt-1 h-4 w-4 text-gray-400" />
              <div>
                <label className="text-xs font-semibold text-gray-500">Budget</label>
                <p className="mt-1 text-sm text-gray-900">
                  ₹{lead.budget.from || "0"} - ₹{lead.budget.to || "0"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ITEMS */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Items ({lead.items?.length || 0})</h2>
        </div>
        <div className="space-y-4">
          {lead.items?.map((item, index) => (
            <div key={item._id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Item {index + 1}</h3>
                  <p className="text-xs text-gray-500">ID: {item._id}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{item.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-white p-3">
                  <label className="text-xs font-semibold text-gray-500">Inquiry Category</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{item.inquiryCategory?.name || "N/A"}</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <label className="text-xs font-semibold text-gray-500">Model</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{item.modelSuggestion?.name || "N/A"}</p>
                  {item.modelSuggestion?.modelNo && (
                    <p className="text-xs text-gray-500">Model No: {item.modelSuggestion.modelNo}</p>
                  )}
                </div>
                <div className="rounded-lg bg-white p-3">
                  <label className="text-xs font-semibold text-gray-500">Customization Type</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{item.customizationType?.name || "N/A"}</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <label className="text-xs font-semibold text-gray-500">Quantity</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{item.qty}</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <label className="text-xs font-semibold text-gray-500">Rate</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">₹{item.rate}</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <label className="text-xs font-semibold text-gray-500">GST</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{item.gst}%</p>
                </div>
              </div>

              {item.personalization?.isPersonalized && (
                <div className="mt-3 rounded-lg bg-blue-50 p-3">
                  <label className="text-xs font-semibold text-blue-700">Personalization</label>
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    {item.personalization.name && <p>Name: {item.personalization.name}</p>}
                    {item.personalization.location && <p>Location: {item.personalization.location}</p>}
                    {item.personalization.description && <p>Description: {item.personalization.description}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* REMARKS */}
      {lead.remarks && lead.remarks.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Remarks</h2>
          <div className="space-y-3">
            {lead.remarks.map((remark, index) => (
              <div key={index} className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3">
                <p className="text-xs text-gray-500">{new Date(remark.date).toLocaleString()}</p>
                <p className="mt-1 text-sm text-gray-900">{remark.remark}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAYMENT HISTORY */}
      {lead.paymentHistory && lead.paymentHistory.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment History</h2>
          <div className="space-y-3">
            {lead.paymentHistory.map((payment, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">₹{payment.amount}</p>
                    <p className="text-xs text-gray-500">{payment.modeOfPayment}</p>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                </div>
                {payment.remark && <p className="mt-2 text-xs text-gray-600">{payment.remark}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps() {
  return {
    props: {},
  };
}
