import { useEffect, useMemo, useState } from "react";
import { TrackSelector } from "./components/TrackSelector";
import { StudyPlan } from "./components/StudyPlan";
import { AddTopicModal } from "./components/AddTopicModal";
import { usePlanStore } from "./store/usePlanStore";
import { getTrack } from "./data/tracks";

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
    <div className="min-h-screen bg-blue-50 w-full">
      <div className="pointer-events-none fixed inset-x-0 -top-24 mx-auto h-72 rounded-full" />

      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
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

      <main className="mx-auto px-4 py-6 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
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

      <footer className="mx-auto px-4 pb-10 pt-2 text-xs text-zinc-500 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        Clique no ícone do item para alternar TODO → DOING → DONE. Tudo fica salvo no seu navegador.
      </footer>
    </div>
  );
}
