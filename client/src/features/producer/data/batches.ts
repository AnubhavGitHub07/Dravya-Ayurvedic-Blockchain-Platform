export type BatchStatus = 'pending' | 'verified' | 'rejected'

export interface HerbBatch {
  id: string
  herbName: string
  botanicalName: string
  quantityKg: number
  harvestDate: string
  status: BatchStatus
}

export const mockBatches: HerbBatch[] = [
  { id: 'HB-001', herbName: 'Ashwagandha', botanicalName: 'Withania somnifera', quantityKg: 500, harvestDate: '2024-05-12', status: 'verified' },
  { id: 'HB-002', herbName: 'Tulsi', botanicalName: 'Ocimum tenuiflorum', quantityKg: 250, harvestDate: '2024-05-11', status: 'pending' },
  { id: 'HB-003', herbName: 'Neem', botanicalName: 'Azadirachta indica', quantityKg: 300, harvestDate: '2024-05-10', status: 'pending' },
  { id: 'HB-004', herbName: 'Amla', botanicalName: 'Phyllanthus emblica', quantityKg: 200, harvestDate: '2024-05-09', status: 'rejected' },
]