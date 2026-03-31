import { useState } from "react";
import { X } from "lucide-react";

type PaymentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: string) => void | Promise<void>;
  totalAmount: string;
  paidAmount: string;
  title: string;
};

export default function PaymentDialog({
  isOpen,
  onClose,
  onSubmit,
  totalAmount,
  paidAmount,
  title,
}: PaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const pendingAmount = parseFloat(totalAmount) - parseFloat(paidAmount);

  const handleSubmit = async () => {
    setError("");
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) > pendingAmount + 0.01) {
      setError("Amount cannot exceed pending amount");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(amount);
      setAmount("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-semibold text-gray-900">₹{totalAmount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Paid Amount:</span>
            <span className="font-semibold text-green-600">₹{paidAmount}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-sm font-semibold text-gray-700">Pending Amount:</span>
            <span className="text-lg font-bold text-red-600">₹{pendingAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">Payment Amount (Max: ₹{pendingAmount.toFixed(2)})</label>
          <input
            type="number"
            value={amount}
            step="0.01"
            max={pendingAmount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            placeholder={`Max: ${pendingAmount.toFixed(2)}`}
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Submitting...
              </span>
            ) : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
