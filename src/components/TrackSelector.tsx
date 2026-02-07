import type { TrackId } from "../data/tracks";
import { TRACKS } from "../data/tracks";

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
