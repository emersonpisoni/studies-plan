import type { Topic } from "../data/tracks";
import type { Status } from "../store/usePlanStore";

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
  status: "todo" | "doing" | "done";
  addedBy: "system" | "user";
  onToggle: () => void;
  onRemove?: () => void;
}) {
  const meta = statusMeta(status);

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-zinc-200 via-zinc-100 to-zinc-200 opacity-60" />

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
