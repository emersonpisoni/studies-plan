import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Topic, TrackId, Track } from "../data/tracks";
import { getTrack, TRACKS } from "../data/tracks";

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
  hasSelectedTrack: boolean;
  tracks: Track[];
  customTopicsByTrack: Record<TrackId, Topic[]>;
  itemsByTrack: Record<TrackId, PlanItem[]>;

  setTrack: (trackId: TrackId) => void;
  resetTrackSelection: () => void;
  addTrack: (track: Omit<Track, "id"> & { id?: string }) => void;
  ensureBasePlan: (trackId: TrackId) => void;

  addCustomTopic: (topic: Omit<Topic, "id"> & { id?: string }) => void;
  toggleStatus: (topicId: string) => void;
  setStatus: (topicId: string, status: Status) => void;
  removeCustomTopic: (topicId: string) => void;
};

function uuid(): string {
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
      hasSelectedTrack: false,
      tracks: TRACKS,
      customTopicsByTrack: makeEmptyCustom(),
      itemsByTrack: makeEmptyItems(),

      setTrack: (trackId) => {
        get().ensureBasePlan(trackId);
        set({ trackId, hasSelectedTrack: true });
      },

      resetTrackSelection: () => {
        set({ hasSelectedTrack: false });
      },

      addTrack: (trackInput) => {
        const state = get();
        const name = trackInput.name.trim();
        const slug = (trackInput.id ?? name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        if (state.tracks.some((t) => t.id === slug)) {
          throw new Error("Já existe uma trilha com esse id.");
        }

        const newTrack: Track = {
          id: slug as TrackId,
          name,
          recommended: trackInput.recommended ?? [],
        };

        set({
          tracks: [...state.tracks, newTrack],
          trackId: newTrack.id,
          hasSelectedTrack: true,
        });
      },

      ensureBasePlan: (trackId) => {
        const state = get();
        const items = state.itemsByTrack[trackId] ?? [];
        if (items.length > 0) return;

        let baseTopics = [] as typeof state.customTopicsByTrack[TrackId];
        try {
          baseTopics = getTrack(trackId).recommended;
        } catch (e) {
          const custom = state.tracks.find((t) => t.id === trackId);
          baseTopics = custom ? custom.recommended : [];
        }

        const seeded: PlanItem[] = baseTopics.map((t, idx) => ({
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
        hasSelectedTrack: s.hasSelectedTrack,
        tracks: s.tracks,
        customTopicsByTrack: s.customTopicsByTrack,
        itemsByTrack: s.itemsByTrack,
      }),
    }
  )
);
