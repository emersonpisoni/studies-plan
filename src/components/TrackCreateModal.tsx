import { useState } from "react";
import type { Track } from "../data/tracks";

export function TrackCreateModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (t: Omit<Track, "id"> & { id?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/40" />

      <div className="relative mx-auto mt-24 w-[min(720px,calc(100%-2rem))] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Criar nova trilha</h2>
            <p className="text-sm text-zinc-600">Adicione uma nova trilha personalizada</p>
          </div>
          <button onClick={onClose} className="text-sm text-zinc-500">Fechar</button>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-zinc-700">Nome da trilha</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200"
              placeholder="Ex: Mobile" 
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-zinc-700">Descrição (opcional)</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200"
              placeholder="Resumo curto da trilha"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700">Cancelar</button>
          <button
            onClick={() => {
              if (!name.trim()) return;
              onCreate({ name: name.trim(), recommended: [] });
              setName("");
              setDescription("");
              onClose();
            }}
            className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm text-white"
          >
            Criar trilha
          </button>
        </div>
      </div>
    </div>
  );
}
