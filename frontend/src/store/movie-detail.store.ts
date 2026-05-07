import { create } from 'zustand';
import type { TMDBMediaItem } from '@/types';

interface MovieDetailStore {
  item: TMDBMediaItem | null;
  open: (item: TMDBMediaItem) => void;
  close: () => void;
}

export const useMovieDetailStore = create<MovieDetailStore>((set) => ({
  item: null,
  open: (item) => set({ item }),
  close: () => set({ item: null }),
}));
