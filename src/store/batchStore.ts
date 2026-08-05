import { create } from 'zustand'

interface BatchState {
  activeBatches: number
  incrementBatches: () => void
}

export const useBatchStore = create<BatchState>((set) => ({
  activeBatches: 0,
  incrementBatches: () => set((state) => ({ activeBatches: state.activeBatches + 1 })),
}))
