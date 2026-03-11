import { useState } from "react";
import { X, Truck } from "lucide-react";

type DispatchDescriptionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string) => void;
};

export default function DispatchDescriptionDialog({ isOpen, onClose, onSubmit }: DispatchDescriptionDialogProps) {
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!description.trim()) return;
    onSubmit(description);
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-cyan-100 p-2">
              <Truck className="h-6 w-6 text-cyan-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Dispatch Details</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter dispatch details (e.g., courier name, tracking number, etc.)..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            rows={4}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!description.trim()}
            className="flex-1 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Dispatch
          </button>
        </div>
      </div>
    </div>
  );
}
