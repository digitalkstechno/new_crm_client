import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/router";
import { api } from "@/utils/axiosInstance";
import { baseUrl } from "../../config";
import toast from "react-hot-toast";

type InquiryCategory = {
  _id: string;
  name: string;
};

type ModelSuggestion = {
  _id: string;
  name: string;
  rate: string;
  gst: number;
};

type ProductRow = {
  id: string;
  inquiryCategoryId: string;
  modelSuggestionId: string;
  customizationTypeId: string;
  personalization: "Yes" | "No";
  location?: string;
  name?: string;
  description: string;
  qty: number;
  rate: number;
  gst: number;
  total: number;
};

const customizationTypes = [
  "Laser Engrave",
  "UV Color Logo",
  "Jingle Ad",
  "B.T Pair Name",
  "U.V. DTF Sticker",
  "Glow Logo",
  "O.E.M",
  "Other",
];

export default function ConvertToLeadPage() {
  const router = useRouter();
  const { accountId } = router.query;
  const [accountData, setAccountData] = useState<any>(null);
  
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const [leadDate, setLeadDate] = useState(getTodayDate());
  const [clientType, setClientType] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [shippingCharges, setShippingCharges] = useState("");
  const [budgetFrom, setBudgetFrom] = useState("");
  const [budgetTo, setBudgetTo] = useState("");
  const [inquiryCategories, setInquiryCategories] = useState<InquiryCategory[]>([]);
  const [customizationTypes, setCustomizationTypes] = useState<InquiryCategory[]>([]);
  const [allModelSuggestions, setAllModelSuggestions] = useState<{ [key: string]: ModelSuggestion[] }>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([
    {
      id: Date.now().toString(),
      inquiryCategoryId: "",
      modelSuggestionId: "",
      customizationTypeId: "",
      personalization: "No",
      name: "",
      description: "",
      qty: 1,
      rate: 0,
      gst: 0,
      total: 0,
    },
  ]);

  useEffect(() => {
    fetchInquiryCategories();
    fetchCustomizationTypes();
    if (accountId && accountId !== 'undefined') {
      fetchAccountData();
    }
  }, [accountId]);

  const fetchAccountData = async () => {
    if (!accountId || accountId === 'undefined') return;
    try {
      const response = await api.get(`${baseUrl.ACCOUNTMASTER}/${accountId}`);
      setAccountData(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch account data");
    }
  };

  const fetchInquiryCategories = async () => {
    try {
      const response = await api.get(baseUrl.INQUIRYCATEGORY_DROPDOWN);
      setInquiryCategories(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch inquiry categories");
    }
  };

  const fetchCustomizationTypes = async () => {
    try {
      const response = await api.get(baseUrl.CUSTOMIZATIONTYPE_DROPDOWN);
      setCustomizationTypes(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch customization types");
    }
  };

  const fetchModelsByCategory = async (categoryId: string, productId: string) => {
    try {
      if (allModelSuggestions[categoryId]) {
        return;
      }
      const response = await api.get(baseUrl.MODEL_BY_CATEGORY(categoryId));
      setAllModelSuggestions(prev => ({ ...prev, [categoryId]: response.data.data || [] }));
    } catch (error) {
      toast.error("Failed to fetch models");
    }
  };

  const calculateTotal = (row: ProductRow) => {
    const subtotal = row.qty * row.rate;
    const gstAmount = (subtotal * row.gst) / 100;
    return subtotal + gstAmount;
  };

  const calculateGrandTotal = () => {
    const productsTotal = products.reduce((sum, p) => sum + p.total, 0);
    const shipping = parseFloat(shippingCharges) || 0;
    return productsTotal + shipping;
  };

  const updateProduct = (id: string, field: keyof ProductRow, value: any) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, [field]: value };
        
        if (field === "inquiryCategoryId" && value) {
          updated.modelSuggestionId = "";
          updated.rate = 0;
          updated.gst = 0;
          fetchModelsByCategory(value, id);
        }
        
        if (field === "modelSuggestionId" && value) {
          const models = allModelSuggestions[p.inquiryCategoryId] || [];
          const selectedModel = models.find(m => m._id === value);
          if (selectedModel) {
            updated.rate = Number(selectedModel.rate);
            updated.gst = Number(selectedModel.gst || 0);
            updated.total = calculateTotal(updated);
          }
        }
        
        if (["qty", "rate", "gst"].includes(field)) {
          updated.total = calculateTotal(updated);
        }
        return updated;
      })
    );
  };

  useEffect(() => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        total: calculateTotal(p),
      }))
    );
  }, []);

  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        inquiryCategoryId: "",
        modelSuggestionId: "",
        customizationTypeId: "",
        personalization: "No",
        name: "",
        description: "",
        qty: 1,
        rate: 0,
        gst: 0,
        total: 0,
      },
    ]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleConvertLead = async () => {
    const validationErrors: string[] = [];
    
    if (!accountId || accountId === 'undefined') validationErrors.push("Account ID is required");
    if (!leadDate) validationErrors.push("Lead Date is required");
    if (!clientType) validationErrors.push("Client Type is required");
    if (!deliveryDate) validationErrors.push("Delivery Date is required");
    
    products.forEach((p, index) => {
      if (!p.inquiryCategoryId) validationErrors.push(`Product ${index + 1}: Inquiry Category is required`);
      if (!p.modelSuggestionId) validationErrors.push(`Product ${index + 1}: Model Suggestion is required`);
      if (!p.customizationTypeId) validationErrors.push(`Product ${index + 1}: Customization Type is required`);
      if (!p.description) validationErrors.push(`Product ${index + 1}: Description is required`);
      if (p.qty <= 0) validationErrors.push(`Product ${index + 1}: Quantity must be greater than 0`);
    });
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast.error("Please fill all required fields");
      return;
    }
    
    setErrors([]);
    
    try {
      const items = products.map(p => ({
        inquiryCategory: p.inquiryCategoryId,
        modelSuggestion: p.modelSuggestionId,
        qty: p.qty.toString(),
        rate: p.rate.toString(),
        gst: p.gst.toString(),
        total: p.total.toString(),
        customizationType: p.customizationTypeId,
        personalization: {
          isPersonalized: p.personalization === "Yes",
          location: p.personalization === "Yes" ? p.location : undefined,
          name: p.personalization === "No" ? p.name : undefined,
          description: p.description,
        },
      }));
      
      const totalAmount = calculateGrandTotal();
      
      const payload = {
        leadDate,
        clientType,
        deliveryDate,
        shippingCharges,
        budget: {
          from: budgetFrom,
          to: budgetTo,
        },
        accountMaster: accountId,
        items,
        totalAmount: totalAmount.toString(),
      };
      
      await api.post(baseUrl.LEAD, payload);
      toast.success("Lead converted successfully!");
      router.push("/leads");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to convert lead");
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">Convert to Lead</h1>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-red-800">Please fix the following errors:</h3>
            <ul className="list-inside list-disc space-y-1 text-xs text-red-700">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Lead Date, Client Type, Delivery Date, Shipping, Budget */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Lead Date</label>
            <input
              type="date"
              value={leadDate}
              onChange={(e) => setLeadDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300 focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Lead Type</label>
            <select
              value={clientType}
              onChange={(e) => setClientType(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300 focus:bg-white"
            >
              <option value="">Select Lead Type</option>
              <option value="New">New</option>
              <option value="Existing">Existing</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Delivery Date</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300 focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Shipping Charges (₹)</label>
            <input
              type="number"
              value={shippingCharges}
              onChange={(e) => setShippingCharges(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300 focus:bg-white"
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Budget From (₹)</label>
            <input
              type="number"
              value={budgetFrom}
              onChange={(e) => setBudgetFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300 focus:bg-white"
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Budget To (₹)</label>
            <input
              type="number"
              value={budgetTo}
              onChange={(e) => setBudgetTo(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300 focus:bg-white"
              placeholder="0"
            />
          </div>
        </div>

        {/* Products */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Products</h2>
            <button
              onClick={addProduct}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>

          <div className="max-h-[400px] space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
            {products.map((product, index) => (
              <div key={product.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Product {index + 1}</span>
                  <button
                    onClick={() => removeProduct(product.id)}
                    disabled={products.length === 1}
                    className="rounded-lg p-1 text-red-600 hover:bg-red-50 disabled:opacity-30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Inquiry Category</label>
                    <select
                      value={product.inquiryCategoryId}
                      onChange={(e) => updateProduct(product.id, "inquiryCategoryId", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm outline-none"
                    >
                      <option value="">Select</option>
                      {inquiryCategories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Model Suggestion</label>
                    <select
                      value={product.modelSuggestionId}
                      onChange={(e) => updateProduct(product.id, "modelSuggestionId", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm outline-none"
                      disabled={!product.inquiryCategoryId}
                    >
                      <option value="">Select</option>
                      {(allModelSuggestions[product.inquiryCategoryId] || []).map((model) => (
                        <option key={model._id} value={model._id}>{model.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Customization Type</label>
                    <select
                      value={product.customizationTypeId}
                      onChange={(e) => updateProduct(product.id, "customizationTypeId", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm outline-none"
                    >
                      <option value="">Select</option>
                      {customizationTypes.map((type) => (
                        <option key={type._id} value={type._id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Personalization</label>
                    <select
                      value={product.personalization}
                      onChange={(e) => updateProduct(product.id, "personalization", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm outline-none"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-600">
                      {product.personalization === "Yes" ? "Location" : "Name"}
                    </label>
                    <input
                      type="text"
                      value={product.personalization === "Yes" ? product.location || "" : product.name || ""}
                      onChange={(e) =>
                        updateProduct(product.id, product.personalization === "Yes" ? "location" : "name", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="mb-1 block text-xs text-gray-600">Description</label>
                    <input
                      type="text"
                      value={product.description}
                      onChange={(e) => updateProduct(product.id, "description", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Qty</label>
                    <input
                      type="number"
                      value={product.qty}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 1 : parseInt(e.target.value) || 1;
                        updateProduct(product.id, "qty", value);
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Rate (₹)</label>
                    <input
                      type="number"
                      value={product.rate}
                      onChange={(e) => updateProduct(product.id, "rate", Number(e.target.value))}
                      onFocus={(e) => e.target.select()}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-600">GST %</label>
                    <input
                      type="number"
                      value={product.gst}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                        updateProduct(product.id, "gst", value);
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Total</label>
                    <div className="flex h-[34px] items-center rounded-lg border border-gray-300 bg-gray-100 px-2 text-sm font-semibold text-gray-900">
                      ₹{product.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Amount */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Products Total:</span>
              <span className="font-semibold text-gray-900">
                ₹{products.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Shipping Charges:</span>
              <span className="font-semibold text-gray-900">
                ₹{(parseFloat(shippingCharges) || 0).toFixed(2)}
              </span>
            </div>
            <div className="border-t border-gray-300 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Grand Total:</span>
                <span className="text-lg font-bold text-green-600">
                  ₹{calculateGrandTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Convert Lead Button */}
        <div className="flex justify-end">
          <button
            onClick={handleConvertLead}
            className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Convert Lead
          </button>
        </div>
      </div>
    </div>
  );
}
