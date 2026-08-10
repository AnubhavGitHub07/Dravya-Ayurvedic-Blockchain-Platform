import { RegisterBatchForm } from '@/features/producer/components/RegisterBatchForm'

export default function RegisterBatchPage() {
  return (
    <div className="flex-1 space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Register herb batch</h2>
        <p className="text-muted-foreground">Cultivation and harvest details for a new batch</p>
      </div>
      <RegisterBatchForm />
    </div>
  )
}