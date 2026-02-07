import { TRACKS } from "../data/tracks";
import type { TrackId } from "../data/tracks";

export function TrackSelectionPage({ onSelect }: { onSelect: (trackId: TrackId) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-x-0 -top-24 mx-auto h-96 rounded-full bg-gradient-to-r from-indigo-100 via-white to-blue-100 blur-3xl opacity-70" />

      <div className="relative z-10 max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-white shadow-lg mb-6">
            <span className="text-2xl font-bold">SP</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-3">
            Study Planner
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 mb-2">
            Organize seu aprendizado e acompanhe o progresso
          </p>
          <p className="text-zinc-500">
            Escolha uma trilha para começar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {TRACKS.map((track) => (
            <button
              key={track.id}
              onClick={() => onSelect(track.id)}
              className="group relative overflow-hidden rounded-3xl border-2 border-zinc-200 bg-white p-8 shadow-md transition hover:shadow-xl hover:border-zinc-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-transparent opacity-0 transition group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 mb-4">
                  <span className="text-xl font-bold text-zinc-700">
                    {track.id === "frontend" ? "🎨" : "⚙️"}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-zinc-900 text-left mb-3">
                  {track.name}
                </h2>

                <div className="space-y-2 text-left mb-6">
                  <p className="text-sm text-zinc-600">
                    <span className="font-semibold text-zinc-900">{track.recommended.length}</span> tópicos recomendados
                  </p>
                  <p className="text-xs text-zinc-500">
                    Estrutura completa para aprender do zero
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {track.recommended.slice(0, 3).map((topic) => (
                    <span
                      key={topic.id}
                      className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                    >
                      {topic.category}
                    </span>
                  ))}
                  {track.recommended.length > 3 && (
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                      +{track.recommended.length - 3}
                    </span>
                  )}
                </div>

                <div className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 group-hover:gap-3 transition">
                  Começar
                  <span className="text-lg">→</span>
                </div>
              </div>

              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-zinc-100 to-transparent opacity-0 blur-2xl transition group-hover:opacity-100" />
            </button>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-zinc-500">
          <p>Você pode mudar de trilha a qualquer momento durante os estudos.</p>
        </div>
      </div>
    </div>
  );
}
