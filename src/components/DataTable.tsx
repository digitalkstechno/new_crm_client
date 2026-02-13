import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search , Eye, Edit, Trash2 } from "lucide-react";

export type Column<T, K extends keyof T = keyof T> = {
  key: K;
  label: string;
  className?: string;
  render?: (value: T[K], row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  title?: string;
  actions?: React.ReactNode;
  data: T[];
  columns: Column<T, keyof T>[];
  pageSize?: number;
  searchPlaceholder?: string;
  currentPage?: number;
  totalPages?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  rowClassName?: (row: T) => string;
};

export default function DataTable<T extends Record<string, unknown>>({
  title,
  actions,
  data,
  columns,
  pageSize = 10,
  searchPlaceholder = "Search...",
  currentPage,
  totalPages,
  totalRecords: totalRecordsProp,
  onPageChange,
  onSearch,
  rowClassName,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const isServerPagination = currentPage !== undefined && totalPages !== undefined && onPageChange !== undefined;
  const isServerSearch = onSearch !== undefined;

  const filteredData = useMemo(() => {
    if (isServerPagination || isServerSearch) return data;
    if (!query.trim()) return data;
    const needle = query.toLowerCase();
    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(needle);
      })
    );
  }, [data, columns, query, isServerPagination, isServerSearch]);

  const totalPagesCalc = isServerPagination ? totalPages : Math.max(1, Math.ceil(filteredData.length / pageSize));
  const currentPageCalc = isServerPagination ? currentPage : page;

  useEffect(() => {
    if (isServerSearch) {
      const timer = setTimeout(() => {
        onSearch(query);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [query, isServerSearch, onSearch]);

  useEffect(() => {
    if (!isServerPagination && page > totalPagesCalc) {
      setPage(totalPagesCalc);
    }
  }, [page, totalPagesCalc, isServerPagination]);

  useEffect(() => {
    if (!isServerSearch) {
      setPage(1);
    }
  }, [query, isServerSearch]);

  const startIndex = (currentPageCalc - 1) * pageSize;
  const paginatedData = isServerPagination ? data : filteredData.slice(startIndex, startIndex + pageSize);

  const totalRecords = isServerPagination && totalRecordsProp ? totalRecordsProp : filteredData.length;
  const rangeStart = data.length === 0 ? 0 : startIndex + 1;
  const rangeEnd = isServerPagination ? startIndex + data.length : Math.min(startIndex + pageSize, filteredData.length);

  const handlePageChange = (newPage: number) => {
    if (isServerPagination) {
      onPageChange(newPage);
    } else {
      setPage(newPage);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title ? <h2 className="text-lg font-semibold text-gray-900">{title}</h2> : null}
          <p className="text-sm text-gray-500">
            Showing {rangeStart}-{rangeEnd} of {totalRecords}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {actions ? <div className="flex justify-end">{actions}</div> : null}
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-gray-300 focus:bg-white"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                {columns.map((column) => (
                  <th key={String(column.key)} className="px-4 py-3 font-semibold">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
                    No results found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={`bg-white ${rowClassName ? rowClassName(row) : ""}`}>
                    {columns.map((column) => {
                      const value = row[column.key];
                      return (
                        <td
                          key={String(column.key)}
                          className={`px-4 py-3 text-gray-700 ${column.className ?? ""}`}
                        >
                          {column.render ? column.render(value, row) : String(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-gray-500">
          Page {currentPageCalc} of {totalPagesCalc}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPageCalc - 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 disabled:opacity-50"
            disabled={currentPageCalc === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <div className="flex items-center gap-1">
            {(() => {
              const pages = [];
              const showFirst = currentPageCalc > 2;
              const showLast = currentPageCalc < totalPagesCalc - 1;
              const showLeftDots = currentPageCalc > 3;
              const showRightDots = currentPageCalc < totalPagesCalc - 2;

              if (showFirst) {
                pages.push(
                  <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="h-8 w-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
                  >
                    1
                  </button>
                );
              }

              if (showLeftDots) {
                pages.push(
                  <span key="left-dots" className="px-1 text-gray-400">
                    ...
                  </span>
                );
              }

              if (currentPageCalc > 1) {
                pages.push(
                  <button
                    key={currentPageCalc - 1}
                    onClick={() => handlePageChange(currentPageCalc - 1)}
                    className="h-8 w-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
                  >
                    {currentPageCalc - 1}
                  </button>
                );
              }

              pages.push(
                <button
                  key={currentPageCalc}
                  className="h-8 w-8 rounded-lg bg-gray-900 text-xs font-semibold text-white"
                >
                  {currentPageCalc}
                </button>
              );

              if (currentPageCalc < totalPagesCalc) {
                pages.push(
                  <button
                    key={currentPageCalc + 1}
                    onClick={() => handlePageChange(currentPageCalc + 1)}
                    className="h-8 w-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
                  >
                    {currentPageCalc + 1}
                  </button>
                );
              }

              if (showRightDots) {
                pages.push(
                  <span key="right-dots" className="px-1 text-gray-400">
                    ...
                  </span>
                );
              }

              if (showLast) {
                pages.push(
                  <button
                    key={totalPagesCalc}
                    onClick={() => handlePageChange(totalPagesCalc)}
                    className="h-8 w-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
                  >
                    {totalPagesCalc}
                  </button>
                );
              }

              return pages;
            })()}
          </div>
          <button
            onClick={() => handlePageChange(Math.min(totalPagesCalc, currentPageCalc + 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 disabled:opacity-50"
            disabled={currentPageCalc === totalPagesCalc}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
