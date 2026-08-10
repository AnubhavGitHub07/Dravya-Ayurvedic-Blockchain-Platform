export type LabBatchFullStatus = 'awaiting_test' | 'approved' | 'rejected'

export interface AssignedBatchRecord {
  id: string
  herbName: string
  quantityKg: number
  submittedDate: string
  status: LabBatchFullStatus
}

export const mockAllAssignedBatches: AssignedBatchRecord[] = [
  { id: 'HB-005', herbName: 'Ashwagandha', quantityKg: 400, submittedDate: '2024-05-13', status: 'awaiting_test' },
  { id: 'HB-006', herbName: 'Tulsi', quantityKg: 350, submittedDate: '2024-05-12', status: 'awaiting_test' },
  { id: 'HB-007', herbName: 'Amla', quantityKg: 220, submittedDate: '2024-05-12', status: 'awaiting_test' },
  { id: 'HB-001', herbName: 'Ashwagandha', quantityKg: 500, submittedDate: '2024-05-08', status: 'approved' },
  { id: 'HB-002', herbName: 'Neem', quantityKg: 300, submittedDate: '2024-05-07', status: 'rejected' },
]