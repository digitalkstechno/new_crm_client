import DataTable, { Column } from "@/components/DataTable";
import TableSkeleton from "@/components/TableSkeleton";
import { useMemo, useState, useEffect } from "react";
import { api } from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import { baseUrl } from "../../config";

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
                        <div className="flex gap-2">
                            {row.attachments.map((file: File | string, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (file instanceof File) {
                                            window.open(URL.createObjectURL(file), "_blank");
                                        } else {
                                            const baseUrl =
                                                process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
                                                "http://localhost:5000";
                                            window.open(
                                                `${baseUrl}/uploads/publicLeads/${file}`,
                                                "_blank",
                                            );
                                        }
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    <span>
                                        {typeof file === "string"
                                            ? file.match(/\.(jpeg|jpg|png|gif|webp)$/i)
                                                ? "View Image"
                                                : "View File"
                                            : file.name}
                                    </span>
                                </button>
                            ))}
                        </div>
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
        </>
    );
}
