import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Topic, TrackId } from "../data/tracks";
import { getTrack } from "../data/tracks";

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
  customTopicsByTrack: Record<TrackId, Topic[]>;
  itemsByTrack: Record<TrackId, PlanItem[]>;

  setTrack: (trackId: TrackId) => void;
  resetTrackSelection: () => void;
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
      customTopicsByTrack: makeEmptyCustom(),
      itemsByTrack: makeEmptyItems(),

      setTrack: (trackId) => {
        get().ensureBasePlan(trackId);
        set({ trackId, hasSelectedTrack: true });
      },

      resetTrackSelection: () => {
        set({ hasSelectedTrack: false });
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
        customTopicsByTrack: s.customTopicsByTrack,
        itemsByTrack: s.itemsByTrack,
      }),
    }
  )
);
