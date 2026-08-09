export type LabBatchStatus = 'awaiting_test' | 'in_progress'

export interface AssignedBatch {
  id: string
  herbName: string
  quantityKg: number
  submittedDate: string
  status: LabBatchStatus
}

export const mockAssignedBatches: AssignedBatch[] = [
  { id: 'HB-005', herbName: 'Ashwagandha', quantityKg: 400, submittedDate: '2024-05-13', status: 'awaiting_test' },
  { id: 'HB-006', herbName: 'Tulsi', quantityKg: 350, submittedDate: '2024-05-12', status: 'awaiting_test' },
  { id: 'HB-007', herbName: 'Amla', quantityKg: 220, submittedDate: '2024-05-12', status: 'awaiting_test' },
]