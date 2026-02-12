"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import Dialog from "@/components/Dialog";

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* ================= TYPES ================= */

type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Proposal"
  | "Won"
  | "Lost";

type Lead = {
  id: string;
  name: string;
  company: string;
  status: LeadStatus;
  owner: string;
  nextFollowUp: string;
  value: string;
};

/* ================= DATA ================= */

const STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Won",
  "Lost",
];

const initialLeads: Lead[] = [
  {
    id: "1",
    name: "Aarav Sharma",
    company: "Nexa Labs",
    status: "New",
    owner: "Priya",
    nextFollowUp: "2026-02-12",
    value: "$4,500",
  },
  {
    id: "2",
    name: "Isha Patel",
    company: "BlueOrbit",
    status: "Qualified",
    owner: "Rahul",
    nextFollowUp: "2026-02-14",
    value: "$6,200",
  },
];

/* ================= PAGE ================= */

export default function LeadsPage() {
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    company: "",
    status: "New" as LeadStatus,
    owner: "",
    nextFollowUp: "",
    value: "",
  });

  const sensors = useSensors(useSensor(PointerSensor));

  /* ---------- Group By Status ---------- */

  const grouped = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      New: [],
      Contacted: [],
      Qualified: [],
      Proposal: [],
      Won: [],
      Lost: [],
    };

    leads.forEach((lead) => {
      map[lead.status].push(lead);
    });

    return map;
  }, [leads]);

  const findLead = (id: string) => leads.find((l) => l.id === id);

  /* ---------- DRAG OVER ---------- */

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeLead = findLead(active.id as string);
    if (!activeLead) return;

    const overStatus = over.id as LeadStatus;

    if (STATUSES.includes(overStatus)) {
      if (activeLead.status !== overStatus) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === activeLead.id
              ? { ...lead, status: overStatus }
              : lead
          )
        );
      }
    }
  };

  /* ---------- DRAG END ---------- */

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeLead = findLead(activeId);
    const overLead = findLead(overId);

    if (!activeLead || !overLead) return;

    if (activeLead.status === overLead.status) {
      const columnLeads = grouped[activeLead.status];
      const oldIndex = columnLeads.findIndex((l) => l.id === activeId);
      const newIndex = columnLeads.findIndex((l) => l.id === overId);

      const reordered = arrayMove(columnLeads, oldIndex, newIndex);

      setLeads((prev) => {
        const others = prev.filter((l) => l.status !== activeLead.status);
        return [...others, ...reordered];
      });
    }
  };

  /* ---------- FORM SUBMIT ---------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLead: Lead = {
      id: Date.now().toString(),
      name: form.name,
      company: form.company,
      status: form.status,
      owner: form.owner,
      nextFollowUp: form.nextFollowUp,
      value: form.value,
    };

    setLeads((prev) => [newLead, ...prev]);

    setForm({
      name: "",
      company: "",
      status: "New",
      owner: "",
      nextFollowUp: "",
      value: "",
    });

    setOpen(false);
  };

  /* ---------- TABLE COLUMNS ---------- */

  const columns: Column<Lead>[] = [
    { key: "name", label: "Lead" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status" },
    { key: "owner", label: "Owner" },
    { key: "nextFollowUp", label: "Follow-up" },
    { key: "value", label: "Deal Value" },
  ];

  return (
    <>
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setView("table")}
            className={`rounded-lg px-4 py-2 text-sm ${
              view === "table" ? "bg-black text-white" : "border"
            }`}
          >
            Table View
          </button>

          <button
            onClick={() => setView("kanban")}
            className={`rounded-lg px-4 py-2 text-sm ${
              view === "kanban" ? "bg-black text-white" : "border"
            }`}
          >
            Kanban View
          </button>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          <Plus size={16} />
          Add Lead
        </button>
      </div>

      {/* TABLE */}
      {view === "table" && (
        <DataTable
          title="Leads"
          data={leads}
          pageSize={10}
          searchPlaceholder="Search..."
          columns={columns}
        />
      )}

      {/* KANBAN */}
      {view === "kanban" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                id={status}
                leads={grouped[status]}
              />
            ))}
          </div>
        </DndContext>
      )}

      {/* ADD LEAD DIALOG */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add New Lead"
        description="Create a new lead entry."
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="lead-form"
              className="rounded-xl bg-black px-4 py-2 text-sm text-white"
            >
              Save Lead
            </button>
          </div>
        }
      >
        <form
          id="lead-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Lead Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Input
              label="Company"
              value={form.company}
              onChange={(v) => setForm({ ...form, company: v })}
            />
            <Select
              label="Status"
              value={form.status}
              options={STATUSES}
              onChange={(v) =>
                setForm({ ...form, status: v as LeadStatus })
              }
            />
            <Input
              label="Owner"
              value={form.owner}
              onChange={(v) => setForm({ ...form, owner: v })}
            />
            <Input
              label="Next Follow-up"
              type="date"
              value={form.nextFollowUp}
              onChange={(v) =>
                setForm({ ...form, nextFollowUp: v })
              }
            />
            <Input
              label="Deal Value"
              value={form.value}
              onChange={(v) => setForm({ ...form, value: v })}
            />
          </div>
        </form>
      </Dialog>
    </>
  );
}

/* ================= REUSABLE INPUT ================= */

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

/* ================= COLUMN ================= */

function KanbanColumn({
  id,
  leads,
}: {
  id: LeadStatus;
  leads: Lead[];
}) {
  return (
    <div className="rounded-2xl bg-gray-100 p-3 min-h-[400px]">
      <h3 className="mb-3 text-sm font-semibold">
        {id} ({leads.length})
      </h3>

      <SortableContext
        items={leads.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

/* ================= CARD ================= */

function KanbanCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200"
    >
      <h4 className="text-sm font-semibold">{lead.name}</h4>
      <p className="text-xs text-gray-500">{lead.company}</p>

      <div className="mt-2 flex justify-between text-xs">
        <span>{lead.owner}</span>
        <span className="font-semibold">{lead.value}</span>
      </div>

      <p className="mt-2 text-xs text-gray-400">
        {lead.nextFollowUp}
      </p>
    </div>
  );
}
