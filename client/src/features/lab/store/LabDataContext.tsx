'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type LabBatchFullStatus = 'awaiting_test' | 'approved' | 'rejected'

export interface LabBatchRecord {
  id: string
  herbName: string
  quantityKg: number
  submittedDate: string
  status: LabBatchFullStatus
  purity?: string
  reportFile?: File
  certFile?: File
}

const initialBatches: LabBatchRecord[] = [
  { id: 'HB-005', herbName: 'Ashwagandha', quantityKg: 400, submittedDate: '2024-05-13', status: 'awaiting_test' },
  { id: 'HB-006', herbName: 'Tulsi', quantityKg: 350, submittedDate: '2024-05-12', status: 'awaiting_test' },
  { id: 'HB-007', herbName: 'Amla', quantityKg: 220, submittedDate: '2024-05-12', status: 'awaiting_test' },
  { id: 'HB-001', herbName: 'Ashwagandha', quantityKg: 500, submittedDate: '2024-05-08', status: 'approved' },
  { id: 'HB-002', herbName: 'Neem', quantityKg: 300, submittedDate: '2024-05-07', status: 'rejected' },
]

interface LabDataContextValue {
  batches: LabBatchRecord[]
  resolveBatch: (id: string, update: Partial<LabBatchRecord>) => void
}

const LabDataContext = createContext<LabDataContextValue | null>(null)

export function LabDataProvider({ children }: { children: ReactNode }) {
  const [batches, setBatches] = useState<LabBatchRecord[]>(initialBatches)

  function resolveBatch(id: string, update: Partial<LabBatchRecord>) {
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, ...update } : b)))
  }

  return <LabDataContext.Provider value={{ batches, resolveBatch }}>{children}</LabDataContext.Provider>
}

export function useLabData() {
  const ctx = useContext(LabDataContext)
  if (!ctx) throw new Error('useLabData must be used within LabDataProvider')
  return ctx
}