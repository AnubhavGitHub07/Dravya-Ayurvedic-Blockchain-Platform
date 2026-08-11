'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type VerificationStatus = 'in_review' | 'approved' | 'rejected'

export interface ProducerVerification {
  id: string
  producerName: string
  location: string
  identityVerified: boolean
  farmVerified: boolean
  inspectionDone: boolean
  remarks?: string
  evidenceFile?: File
  status: VerificationStatus
}

const initialProducers: ProducerVerification[] = [
  {
    id: 'PV-001',
    producerName: 'Rahul Verma',
    location: 'Sehore, MP',
    identityVerified: true,
    farmVerified: true,
    inspectionDone: false,
    status: 'in_review',
  },
  {
    id: 'PV-002',
    producerName: 'Sunita Kale',
    location: 'Indore, MP',
    identityVerified: false,
    farmVerified: false,
    inspectionDone: false,
    status: 'in_review',
  },
]

interface VerificationDataContextValue {
  producers: ProducerVerification[]
  updateProducer: (id: string, update: Partial<ProducerVerification>) => void
}

const VerificationDataContext = createContext<VerificationDataContextValue | null>(null)

export function VerificationDataProvider({ children }: { children: ReactNode }) {
  const [producers, setProducers] = useState<ProducerVerification[]>(initialProducers)

  function updateProducer(id: string, update: Partial<ProducerVerification>) {
    setProducers((prev) => prev.map((p) => (p.id === id ? { ...p, ...update } : p)))
  }

  return (
    <VerificationDataContext.Provider value={{ producers, updateProducer }}>
      {children}
    </VerificationDataContext.Provider>
  )
}

export function useVerificationData() {
  const ctx = useContext(VerificationDataContext)
  if (!ctx) throw new Error('useVerificationData must be used within VerificationDataProvider')
  return ctx
}