import { useMemo, useState } from "react";
import type { Topic } from "../data/tracks";
import { getTrack } from "../data/tracks";
import { usePlanStore } from "../store/usePlanStore";
import { TopicRow } from "./TopicRow";

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
