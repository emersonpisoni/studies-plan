import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'

// Estrutura sugerida (Vite + React + TS + Tailwind)
// src/
//   main.tsx
//   App.tsx
//   data/tracks.ts
//   store/usePlanStore.ts
//   components/
//     TrackSelector.tsx
//     StudyPlan.tsx
//     AddTopicModal.tsx
//     TopicRow.tsx
//
// Abaixo está um “drop-in” do núcleo do MVP: dados + store + componentes + App.
// Copie cada bloco para seu respectivo arquivo.

/* =========================
   src/data/tracks.ts
========================= */
export type TrackId = "frontend" | "backend";

export type Topic = {
  id: string;
  title: string;
  category: string;
  level: "fundamentos" | "intermediario" | "avancado";
  estimatedHours?: number;
  links?: { label: string; url: string }[];
};

export type Track = {
  id: TrackId;
  name: string;
  recommended: Topic[];
};

export const TRACKS: Track[] = [
  {
    id: "frontend",
    name: "Frontend",
    recommended: [
      {
        id: "fe-html",
        title: "HTML semântico e formulários",
        category: "Web",
        level: "fundamentos",
        estimatedHours: 6,
      },
      {
        id: "fe-css",
        title: "CSS (Flexbox, Grid, responsivo)",
        category: "Estilo",
        level: "fundamentos",
        estimatedHours: 10,
      },
      {
        id: "fe-js",
        title: "JavaScript moderno (ES6+, DOM, async/await)",
        category: "Linguagem",
        level: "fundamentos",
        estimatedHours: 20,
      },
      {
        id: "fe-git",
        title: "Git e GitHub (branching, PRs)",
        category: "Ferramentas",
        level: "fundamentos",
        estimatedHours: 8,
      },
      {
        id: "fe-http",
        title: "HTTP + APIs (REST, fetch, status codes)",
        category: "Web",
        level: "fundamentos",
        estimatedHours: 8,
      },
      {
        id: "fe-ts",
        title: "TypeScript (types, generics, narrowing)",
        category: "Linguagem",
        level: "intermediario",
        estimatedHours: 14,
      },
      {
        id: "fe-react",
        title: "React (componentes, props, state, hooks)",
        category: "Framework",
        level: "intermediario",
        estimatedHours: 24,
      },
      {
        id: "fe-testing",
        title: "Testes (Jest/Vitest + React Testing Library)",
        category: "Qualidade",
        level: "intermediario",
        estimatedHours: 12,
      },
      {
        id: "fe-a11y",
        title: "Acessibilidade (ARIA, navegação teclado)",
        category: "Qualidade",
        level: "intermediario",
        estimatedHours: 8,
      },
      {
        id: "fe-perf",
        title: "Performance (Lighthouse, bundle, memoization)",
        category: "Qualidade",
        level: "avancado",
        estimatedHours: 10,
      },
      {
        id: "fe-deploy",
        title: "Deploy (Vercel/Netlify, env vars)",
        category: "Entrega",
        level: "fundamentos",
        estimatedHours: 4,
      },
    ],
  },
  {
    id: "backend",
    name: "Backend",
    recommended: [
      {
        id: "be-http",
        title: "HTTP + APIs (REST, status codes, auth básica)",
        category: "Web",
        level: "fundamentos",
        estimatedHours: 10,
      },
      {
        id: "be-db",
        title: "Banco de dados (modelagem, SQL básico)",
        category: "Dados",
        level: "fundamentos",
        estimatedHours: 18,
      },
      {
        id: "be-auth",
        title: "Autenticação (JWT, sessões, cookies)",
        category: "Segurança",
        level: "intermediario",
        estimatedHours: 12,
      },
    ],
  },
];

export function getTrack(trackId: TrackId): Track {
  const t = TRACKS.find((x) => x.id === trackId);
  if (!t) throw new Error(`Track not found: ${trackId}`);
  return t;
}

/* =========================
   src/store/usePlanStore.ts
========================= */
import { create } from "zustand";
import { persist } from "zustand/middleware";
// import type { Topic, TrackId } from "../data/tracks";
// import { getTrack } from "../data/tracks";

export type Status = "todo" | "doing" | "done";

type PlanItem = {
  topicId: string;
  status: Status;
  notes?: string;
  addedBy: "system" | "user";
  order: number;
};

type PlanState = {
  trackId: TrackId;
  // tópicos custom do usuário (por trilha)
  customTopicsByTrack: Record<TrackId, Topic[]>;
  // itens do plano (por trilha)
  itemsByTrack: Record<TrackId, PlanItem[]>;

  setTrack: (trackId: TrackId) => void;
  ensureBasePlan: (trackId: TrackId) => void;

  addCustomTopic: (topic: Omit<Topic, "id"> & { id?: string }) => void;
  toggleStatus: (topicId: string) => void;
  setStatus: (topicId: string, status: Status) => void;
  removeCustomTopic: (topicId: string) => void;
};

function uuid(): string {
  // suficiente para MVP
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function nextStatus(s: Status): Status {
  if (s === "todo") return "doing";
  if (s === "doing") return "done";
  return "todo";
}

function makeEmptyItems(): Record<TrackId, PlanItem[]> {
  return { frontend: [], backend: [] };
}

function makeEmptyCustom(): Record<TrackId, Topic[]> {
  return { frontend: [], backend: [] };
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      trackId: "frontend",
      customTopicsByTrack: makeEmptyCustom(),
      itemsByTrack: makeEmptyItems(),

      setTrack: (trackId) => {
        get().ensureBasePlan(trackId);
        set({ trackId });
      },

      ensureBasePlan: (trackId) => {
        const state = get();
        const items = state.itemsByTrack[trackId] ?? [];
        if (items.length > 0) return;

        const base = getTrack(trackId).recommended;
        const seeded: PlanItem[] = base.map((t, idx) => ({
          topicId: t.id,
          status: "todo",
          addedBy: "system",
          order: idx,
        }));

        set({
          itemsByTrack: {
            ...state.itemsByTrack,
            [trackId]: seeded,
          },
        });
      },

      addCustomTopic: (topicInput) => {
        const state = get();
        const trackId = state.trackId;
        const id = topicInput.id ?? `user-${uuid()}`;
        const topic: Topic = { ...topicInput, id };

        const customTopics = state.customTopicsByTrack[trackId] ?? [];
        const items = state.itemsByTrack[trackId] ?? [];

        // evita duplicar ID
        if (
          getTrack(trackId).recommended.some((t) => t.id === id) ||
          customTopics.some((t) => t.id === id)
        ) {
          throw new Error("Já existe um tópico com esse id.");
        }

        const order = items.length;
        const newItem: PlanItem = {
          topicId: id,
          status: "todo",
          addedBy: "user",
          order,
        };

        set({
          customTopicsByTrack: {
            ...state.customTopicsByTrack,
            [trackId]: [topic, ...customTopics],
          },
          itemsByTrack: {
            ...state.itemsByTrack,
            [trackId]: [...items, newItem],
          },
        });
      },

      toggleStatus: (topicId) => {
        const state = get();
        const trackId = state.trackId;
        const items = state.itemsByTrack[trackId] ?? [];
        set({
          itemsByTrack: {
            ...state.itemsByTrack,
            [trackId]: items.map((it) =>
              it.topicId === topicId ? { ...it, status: nextStatus(it.status) } : it
            ),
          },
        });
      },

      setStatus: (topicId, status) => {
        const state = get();
        const trackId = state.trackId;
        const items = state.itemsByTrack[trackId] ?? [];
        set({
          itemsByTrack: {
            ...state.itemsByTrack,
            [trackId]: items.map((it) => (it.topicId === topicId ? { ...it, status } : it)),
          },
        });
      },

      removeCustomTopic: (topicId) => {
        const state = get();
        const trackId = state.trackId;
        const customTopics = state.customTopicsByTrack[trackId] ?? [];
        const items = state.itemsByTrack[trackId] ?? [];

        set({
          customTopicsByTrack: {
            ...state.customTopicsByTrack,
            [trackId]: customTopics.filter((t) => t.id !== topicId),
          },
          itemsByTrack: {
            ...state.itemsByTrack,
            [trackId]: items.filter((it) => it.topicId !== topicId),
          },
        });
      },
    }),
    {
      name: "study-plan-mvp",
      version: 1,
      partialize: (s) => ({
        trackId: s.trackId,
        customTopicsByTrack: s.customTopicsByTrack,
        itemsByTrack: s.itemsByTrack,
      }),
    }
  )
);

/* =========================
   src/components/TrackSelector.tsx
========================= */
// import type { TrackId } from "../data/tracks";
// import { TRACKS } from "../data/tracks";

export function TrackSelector({
  value,
  onChange,
}: {
  value: TrackId;
  onChange: (t: TrackId) => void;
}) {
  return (
    <div className="inline-flex rounded-2xl border border-zinc-200 bg-white/70 p-1 shadow-sm backdrop-blur">
      {TRACKS.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={
              "rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-zinc-200 " +
              (active
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-700 hover:bg-zinc-50")
            }
          >
            {t.name}
          </button>
        );
      })}
    </div>
  );
} 

/* =========================
   src/components/TopicRow.tsx
========================= */
// import type { Topic } from "../data/tracks";
// import type { Status } from "../store/usePlanStore";

function statusMeta(status: Status) {
  if (status === "todo")
    return {
      label: "A fazer",
      chip: "bg-zinc-50 text-zinc-700 border-zinc-200",
      dot: "bg-zinc-400",
    };
  if (status === "doing")
    return {
      label: "Em andamento",
      chip: "bg-amber-50 text-amber-900 border-amber-200",
      dot: "bg-amber-500",
    };
  return {
    label: "Concluído",
    chip: "bg-emerald-50 text-emerald-900 border-emerald-200",
    dot: "bg-emerald-500",
  };
}

export function TopicRow({
  topic,
  status,
  addedBy,
  onToggle,
  onRemove,
}: {
  topic: Topic;
  status: Status;
  addedBy: "system" | "user";
  onToggle: () => void;
  onRemove?: () => void;
}) {
  const meta = statusMeta(status);

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 opacity-60" />

      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          className={
            "mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-zinc-200 " +
            (status === "done"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : status === "doing"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50")
          }
          title="Clique para alternar o status"
        >
          {status === "done" ? "✓" : status === "doing" ? "→" : "•"}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-zinc-900">
              {topic.title}
            </h3>

            <span
              className={
                "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold " +
                meta.chip
              }
            >
              <span className={"h-2 w-2 rounded-full " + meta.dot} />
              {meta.label}
            </span>

            {addedBy === "user" && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-900">
                Custom
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1">
              {topic.category}
            </span>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1">
              {topic.level}
            </span>
            {topic.estimatedHours ? (
              <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                ~{topic.estimatedHours}h
              </span>
            ) : null}
          </div>

          {topic.links?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {topic.links.slice(0, 3).map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
                >
                  {l.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {onRemove ? (
          <button
            onClick={onRemove}
            className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 opacity-0 transition hover:bg-zinc-50 group-hover:opacity-100"
            title="Remover tópico custom"
          >
            Remover
          </button>
        ) : null}
      </div>

      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-zinc-100 opacity-60 blur-2xl" />
    </div>
  );
}

/* =========================
   src/components/AddTopicModal.tsx
========================= */
// import { useMemo, useState } from "react";
// import type { Topic } from "../data/tracks";

export function AddTopicModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (t: Omit<Topic, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Geral");
  const [level, setLevel] = useState<Topic["level"]>("fundamentos");
  const [estimatedHours, setEstimatedHours] = useState<string>("");

  const canSubmit = useMemo(() => title.trim().length >= 3, [title]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="relative mx-auto mt-16 w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Adicionar estudo
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Crie um tópico custom para sua trilha.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Esc
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-zinc-700">Título</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-2xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
              placeholder="Ex: React Router"
              autoFocus
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-zinc-700">
                Categoria
              </span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-2xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                placeholder="Ex: Roteamento"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-zinc-700">Nível</span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Topic["level"])}
                className="rounded-2xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
              >
                <option value="fundamentos">fundamentos</option>
                <option value="intermediario">intermediario</option>
                <option value="avancado">avancado</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-zinc-700">
                Horas (opcional)
              </span>
              <input
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="rounded-2xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                placeholder="Ex: 8"
                inputMode="numeric"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Cancelar
          </button>

          <button
            disabled={!canSubmit}
            onClick={() => {
              const hours = estimatedHours.trim()
                ? Number(estimatedHours)
                : undefined;

              onAdd({
                title: title.trim(),
                category: category.trim() || "Geral",
                level,
                estimatedHours: Number.isFinite(hours) ? hours : undefined,
              });

              setTitle("");
              setCategory("Geral");
              setLevel("fundamentos");
              setEstimatedHours("");
              onClose();
            }}
            className={
              "rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition " +
              (canSubmit
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "bg-zinc-200 text-zinc-500 cursor-not-allowed")
            }
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   src/components/StudyPlan.tsx
========================= */
// import { useMemo, useState } from "react";
// import type { Topic } from "../data/tracks";
// import { getTrack } from "../data/tracks";
// import { usePlanStore } from "../store/usePlanStore";
// import { TopicRow } from "./TopicRow";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold text-zinc-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

export function StudyPlan() {
  const trackId = usePlanStore((s) => s.trackId);
  const ensureBasePlan = usePlanStore((s) => s.ensureBasePlan);
  const itemsByTrack = usePlanStore((s) => s.itemsByTrack);
  const customTopicsByTrack = usePlanStore((s) => s.customTopicsByTrack);
  const toggleStatus = usePlanStore((s) => s.toggleStatus);
  const removeCustomTopic = usePlanStore((s) => s.removeCustomTopic);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "todo" | "doing" | "done"
  >("all");

  useMemo(() => ensureBasePlan(trackId), [ensureBasePlan, trackId]);

  const baseTopics = getTrack(trackId).recommended;
  const customTopics = customTopicsByTrack[trackId] ?? [];
  const allTopics: Topic[] = [...baseTopics, ...customTopics];

  const items = itemsByTrack[trackId] ?? [];

  const rows = useMemo(() => {
    const topicById = new Map(allTopics.map((t) => [t.id, t] as const));
    const q = query.trim().toLowerCase();

    return [...items]
      .sort((a, b) => a.order - b.order)
      .map((it) => ({ item: it, topic: topicById.get(it.topicId) }))
      .filter((x) => !!x.topic)
      .filter((x) => (statusFilter === "all" ? true : x.item.status === statusFilter))
      .filter((x) => {
        if (!q) return true;
        const t = x.topic!;
        return (
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.level.toLowerCase().includes(q)
        );
      }) as Array<{ item: (typeof items)[number]; topic: Topic }>;
  }, [allTopics, items, query, statusFilter]);

  const summary = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.status === "done").length;
    const doing = items.filter((i) => i.status === "doing").length;
    const todo = items.filter((i) => i.status === "todo").length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { total, done, doing, todo, pct };
  }, [items]);

  return (
    <section className="mt-6">
      <div className="grid gap-3 lg:grid-cols-4">
        <div className="lg:col-span-2 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Seu plano</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Progresso{" "}
                <span className="font-semibold text-zinc-900">{summary.pct}%</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-2 w-40 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full bg-zinc-900"
                  style={{ width: `${summary.pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-zinc-600">
                {summary.done}/{summary.total}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, categoria, nível..."
              className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            >
              <option value="all">Todos</option>
              <option value="todo">A fazer</option>
              <option value="doing">Em andamento</option>
              <option value="done">Concluído</option>
            </select>
          </div>
        </div>

        <StatCard label="Total" value={summary.total} />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <StatCard label="A fazer" value={summary.todo} />
          <StatCard label="Em andamento" value={summary.doing} />
          <StatCard label="Concluído" value={summary.done} />
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {rows.map(({ item, topic }) => (
          <TopicRow
            key={item.topicId}
            topic={topic}
            status={item.status}
            addedBy={item.addedBy}
            onToggle={() => toggleStatus(item.topicId)}
            onRemove={item.addedBy === "user" ? () => removeCustomTopic(item.topicId) : undefined}
          />
        ))}

        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-lg">
              ⌕
            </div>
            <div className="mt-3 text-sm font-semibold text-zinc-900">Nada por aqui</div>
            <div className="mt-1 text-sm text-zinc-600">Tente ajustar a busca ou o filtro.</div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
/* =========================
   src/App.tsx
========================= */
// import { useEffect, useState } from "react";
// import { TrackSelector } from "./components/TrackSelector";
// import { StudyPlan } from "./components/StudyPlan";
// import { AddTopicModal } from "./components/AddTopicModal";
// import { usePlanStore } from "./store/usePlanStore";

export default function App() {
  const trackId = usePlanStore((s) => s.trackId);
  const setTrack = usePlanStore((s) => s.setTrack);
  const ensureBasePlan = usePlanStore((s) => s.ensureBasePlan);
  const addCustomTopic = usePlanStore((s) => s.addCustomTopic);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    ensureBasePlan(trackId);
  }, [ensureBasePlan, trackId]);

  const trackName = useMemo(() => getTrack(trackId).name, [trackId]);

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="pointer-events-none fixed inset-x-0 -top-24 mx-auto h-72 max-w-6xl rounded-full bg-gradient-to-r from-zinc-100 via-white to-zinc-100 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-sm">
                SP
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-zinc-900">
                  Study Planner
                </h1>
                <p className="truncate text-sm text-zinc-600">
                  Trilha atual:{" "}
                  <span className="font-semibold text-zinc-900">{trackName}</span>
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          >
            + Adicionar
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Escolha a trilha
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                O plano base aparece automaticamente. Adicione estudos custom e acompanhe o progresso.
              </p>
            </div>

            <TrackSelector value={trackId} onChange={setTrack} />
          </div>
        </div>

        <StudyPlan />
      </main>

      <AddTopicModal
        open={open}
        onClose={() => setOpen(false)}
        onAdd={(t) => addCustomTopic(t)}
      />

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-2 text-xs text-zinc-500">
        Clique no ícone do item para alternar TODO → DOING → DONE. Tudo fica salvo no seu navegador.
      </footer>
    </div>
  );
}

/* =========================
   src/main.tsx
========================= */
import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
