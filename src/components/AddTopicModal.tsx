import { useMemo, useState } from "react";
import type { Topic } from "../data/tracks";

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

      <div className="relative mx-auto mt-36 max-w-4xl rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl sm:w-[calc(100%-3rem)] sm:p-6 lg:w-[calc(100%-4rem)]">
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
              className="rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200"
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
                className="rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200"
                placeholder="Ex: Roteamento"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-zinc-700">Nível</span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Topic["level"])}
                className="rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200"
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
                className="rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200"
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
