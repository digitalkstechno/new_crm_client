import DataTable, { Column } from "@/components/DataTable";
import TableSkeleton from "@/components/TableSkeleton";
import { useMemo, useState, useEffect } from "react";
import { api } from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import { baseUrl } from "../../config";
import Dialog from "@/components/Dialog";
import { Eye, FileText, Download, Trash2 } from "lucide-react";

type PublicLead = {
    _id: string;
    name: string;
    companyName: string;
    email: string;
    whatsappNumber: string;
    createdAt?: string;
    uploadedAt?: string;
    notes?: string;
    attachments?: (File | string)[];
};

export default function PublicLeadPage() {
    const [leads, setLeads] = useState<PublicLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAttachments, setSelectedAttachments] = useState<(File | string)[]>([]);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
    const [exporting, setExporting] = useState(false);

    const exportToExcel = async () => {
        setExporting(true);
        try {
            const response = await api.get(`${baseUrl.PUBLIC_LEAD}/export`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'PublicLeads_Export.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Public Leads exported successfully!');
        } catch (error) {
            toast.error('Failed to export public leads');
        } finally {
            setExporting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        try {
            await api.delete(`${baseUrl.PUBLIC_LEAD}/${deleteDialog.id}`);
            setLeads((prev) => prev.filter((a) => a._id !== deleteDialog.id));
            toast.success("Lead deleted successfully!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete lead");
        }
    };

    useEffect(() => {
        fetchPublicLeads(page === 1 && search === "");
    }, [page, search]);


    const fetchPublicLeads = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const res = await api.get(
                `${baseUrl.PUBLIC_LEAD}?page=${page}&limit=10&search=${search}`
            );
            setLeads(res.data.data || []);
            setTotalPages(res.data.pagination?.totalPages || 1);
            setTotalRecords(res.data.pagination?.totalRecords || 0);
        } catch (error) {
            toast.error("Failed to fetch public leads");
        } finally {
            if (showLoader) setLoading(false);
        }
    };
    const columns: Column<PublicLead>[] = useMemo(
        () => [
            { key: "name", label: "Name" },
            {
                key: "companyName",
                label: "Company Name",
                render: (value: any) => value || "-",
            },
            {
                key: "email",
                label: "Email",
                render: (value: any) => value || "-",
            },
            {
                key: "whatsappNumber",
                label: "WhatsApp",
                render: (value: any) => value || "-",
            },
            {
                key: "attachments",
                label: "Documents",
                render: (_: any, row: PublicLead) => {
                    if (!row.attachments?.length) return "-";
                    return (
                        <button
                            onClick={() => {
                                setSelectedAttachments(row.attachments || []);
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                            <Eye className="h-4 w-4" />
                            <span>View ({row.attachments.length})</span>
                        </button>
                    );
                },
            },
            {
                key: "notes",
                label: "Notes",
                render: (value: any) => value || "-",
            },
            {
                key: "_id",
                label: "Actions",
                render: (_: any, row: PublicLead) => (
                    <div className="flex gap-2">
                        {row.whatsappNumber && (
                            <button
                                onClick={() =>
                                    window.open(`https://wa.me/91${row.whatsappNumber}`, "_blank")
                                }
                                className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-3 text-sm font-medium text-green-600 transition hover:bg-green-100"
                                title="Open WhatsApp"
                            >
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={() => setDeleteDialog({ open: true, id: row._id })}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
                            title="Delete Lead"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [],
    );

    return (
        <>
            {loading ? (
                <TableSkeleton />
            ) : (
                <DataTable
                    title="Public Leads"
                    actions={
                        <button
                            onClick={exportToExcel}
                            disabled={exporting}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            <Download className="h-4 w-4 text-green-600" />
                            <span>{exporting ? "Exporting..." : "Export Excel"}</span>
                        </button>
                    }
                    data={leads}
                    pageSize={10}
                    searchPlaceholder="Search name, email, mobile..."
                    columns={columns}
                    currentPage={page}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    onPageChange={setPage}
                    onSearch={setSearch}
                    initialSearch={search}
                />
            )}

            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Lead Documents"
                description="View all uploaded documents for this lead"
            >
                <div className="flex flex-col gap-3">
                    {selectedAttachments.map((file, index) => {
                        const fileName = typeof file === "string" ? file : file.name;
                        const isImage = typeof file === "string" && file.match(/\.(jpeg|jpg|png|gif|webp)$/i);

                        return (
                            <div key={index} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:bg-white hover:shadow-md">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="truncate text-sm font-medium text-gray-900" title={fileName}>
                                            {fileName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {isImage ? "Image File" : "Document"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (file instanceof File) {
                                            window.open(URL.createObjectURL(file), "_blank");
                                        } else {
                                            const baseUrlStr = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "http://localhost:5000";
                                            window.open(`${baseUrlStr}/uploads/publicLeads/${file}`, "_blank");
                                        }
                                    }}
                                    className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm transition hover:bg-blue-600 hover:text-white"
                                    title="View"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </Dialog>

            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, id: null })}
                title="Delete Public Lead"
                description="Are you sure you want to delete this public lead? This action cannot be undone."
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteDialog({ open: false, id: null })}
                            className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                handleDelete();
                                setDeleteDialog({ open: false, id: null });
                            }}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                }
            />
        </>
    );
}
