# Supply Chain Architecture

## 1. Overview
The Dravya Supply Chain module tracks the physical custody of a batch after it has been verified, inspected, and lab-approved.
The core philosophy is:
- **`SupplyChainEvent`**: Preserves the chronological chain of custody (WHAT, WHO, WHEN, WHERE, HOW MUCH).
- **PostgreSQL**: Stores the current operational state (`BatchStatus` and `DistributorAssignment`).
- **Hyperledger Fabric**: Provides tamper-evident cryptographic anchors for important, finalized supply-chain events (`BATCH_RECEIVED`, `BATCH_DISPATCHED`, `BATCH_DELIVERED`).

## 2. Distributor Workflow
1. **Assignment**: An Admin assigns a `QUALITY_APPROVED` batch to an active Distributor. This creates a `DistributorAssignment`.
2. **Receive**: The Distributor acknowledges receipt of the batch. A `BATCH_RECEIVED` event is recorded with the received quantity. (Batch remains `QUALITY_APPROVED`).
3. **Dispatch**: The Distributor dispatches the batch to its destination. A `BATCH_DISPATCHED` event is recorded, and the batch enters `IN_TRANSIT`.
4. **Deliver**: The Distributor confirms delivery. A `BATCH_DELIVERED` event is recorded, and the batch becomes `DELIVERED`.

## 3. Batch Eligibility
Batches can only be assigned to a Distributor if their status is `QUALITY_APPROVED`. This explicitly implies that Producer Verification, Batch Inspection, and Quality Testing have all successfully passed.

## 4. Assignment Process
- **Endpoint**: `POST /api/admin/batches/:id/assign-distributor`
- **Role**: `ADMIN`
- **Action**: Creates a `DistributorAssignment` (Status = `ASSIGNED`). Prevents assigning a batch that is already actively assigned.

## 5. Receive Process
- **Endpoint**: `POST /api/distributors/me/batches/:id/receive`
- **Role**: `DISTRIBUTOR`
- **Action**: Updates Assignment to `ACCEPTED`. Creates a `BATCH_RECEIVED` event. The quantity physically received is recorded in the event, but the master `Batch.quantity` is *never* overwritten, allowing discrepancies to be naturally traced.

## 6. Dispatch Process
- **Endpoint**: `POST /api/distributors/me/batches/:id/dispatch`
- **Role**: `DISTRIBUTOR`
- **Action**: Verifies `dispatchQuantity <= receivedQuantity`. Updates Batch status to `IN_TRANSIT`. Creates `BATCH_DISPATCHED` event with destination and transport metadata.

## 7. Delivery Process
- **Endpoint**: `POST /api/distributors/me/batches/:id/deliver`
- **Role**: `DISTRIBUTOR`
- **Action**: Verifies `deliveryQuantity <= dispatchedQuantity`. Updates Batch status to `DELIVERED`. Creates `BATCH_DELIVERED` event.

## 8. Quantity Tracking
Quantity integrity is enforced at the event level. A batch with a declared quantity of 243 KG might be received as 240 KG. This is perfectly acceptable and recorded as a trace discrepancy, not an immediate failure or data overwrite.

## 9. Blockchain Integration
Major custody handover events are asynchronously anchored to Fabric using `BlockchainService.anchorRecord()`. If Fabric fails to respond, the local PostgreSQL event remains valid, and the `BlockchainRecord` is marked `FAILED` for later retries, ensuring the physical operation is never blocked by network latency.

## 10. RBAC Rules
- **DISTRIBUTOR**: Can view, receive, dispatch, and deliver *only* their assigned batches. Cannot modify upstream records (lab, inspection).
- **ADMIN**: Can assign distributors and view all batch traces.
- **PRODUCER**: Can view the supply-chain timeline of *only* their own batches.

## 11. Public QR Integration
The public verification endpoint (`GET /api/public/verify/:code`) retrieves the chronological timeline from `SupplyChainEvent`. It maps these to a consumer-safe format, purposely hiding private addresses and internal IDs.

## 12. Error Cases & Concurrency
Transactions (`prisma.$transaction`) are heavily used. If a distributor double-taps "Receive", the subsequent attempt will cleanly fail validation.

## 13. Example End-to-End Flow
- *Producer creates batch (243 KG).*
- *Government approves.*
- *Lab approves -> `QUALITY_APPROVED`.*
- *Admin assigns to Dist A.*
- *Dist A receives -> 240 KG (Event created).*
- *Dist A dispatches -> 240 KG to Delhi (Batch -> `IN_TRANSIT`).*
- *Dist A delivers -> 240 KG (Batch -> `DELIVERED`).*
- *Consumer scans QR and sees "Received -> Dispatched -> Delivered".*
