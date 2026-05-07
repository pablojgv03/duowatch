import { create } from 'zustand';
import type { TMDBMediaItem } from '@/types';

export type SwipeAction = 'LIKED' | 'DISLIKED';
export type TypeFilter = 'all' | 'movie' | 'tv';

export interface HistoryEntry {
  item: TMDBMediaItem;
  action: SwipeAction;
  key: string;
}

interface SwipeStore {
  queue: TMDBMediaItem[];
  seenKeys: Set<string>;
  page: number;
  history: HistoryEntry[];
  typeFilter: TypeFilter;
  addItems: (items: TMDBMediaItem[]) => void;
  consumeTop: (action: SwipeAction) => void;
  setTypeFilter: (type: TypeFilter) => void;
  reset: () => void;
  updateHistoryAction: (key: string, action: SwipeAction) => void;
  incrementPage: () => void;
}

export const useSwipeStore = create<SwipeStore>((set) => ({
  queue: [],
  seenKeys: new Set(),
  page: 1,
  history: [],
  typeFilter: 'all',

  addItems: (items) =>
    set((state) => {
      const newKeys = new Set(state.seenKeys);
      const fresh = items.filter((item) => {
        const key = `${item.media_type}-${item.id}`;
        if (newKeys.has(key)) return false;
        newKeys.add(key);
        return true;
      });
      return { queue: [...state.queue, ...fresh], seenKeys: newKeys };
    }),

  consumeTop: (action) =>
    set((state) => {
      if (state.queue.length === 0) return {};
      const [top, ...rest] = state.queue;
      const key = `${top.media_type}-${top.id}`;
      const without = state.history.filter((x) => x.key !== key);
      return {
        queue: rest,
        history: [{ item: top, action, key }, ...without].slice(0, 10),
      };
    }),

  setTypeFilter: (type) =>
    set({ typeFilter: type, queue: [], history: [], page: 1, seenKeys: new Set() }),

  reset: () => set({ queue: [], page: 1, seenKeys: new Set() }),

  updateHistoryAction: (key, action) =>
    set((state) => ({
      history: state.history.map((h) => (h.key === key ? { ...h, action } : h)),
    })),

  incrementPage: () => set((state) => ({ page: state.page + 1 })),
}));
