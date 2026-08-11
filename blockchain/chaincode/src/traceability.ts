import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';

@Info({ title: 'TraceabilityContract', description: 'Smart contract for Dravya traceability' })
export class TraceabilityContract extends Contract {

    @Transaction()
    public async CreateTraceabilityRecord(
        ctx: Context,
        recordId: string,
        entityType: string,
        dataHash: string,
        recordVersion: string,
        actorOrg: string,
        timestamp: string
    ): Promise<void> {
        const exists = await this.RecordExists(ctx, recordId);
        if (exists) {
            throw new Error(`The traceability record ${recordId} already exists`);
        }

        const clientMSPID = ctx.clientIdentity.getMSPID();

        const record = {
            recordId,
            entityType,
            dataHash,
            recordVersion: parseInt(recordVersion, 10),
            actorOrg: clientMSPID, // Use actual invoker MSP instead of passed argument for security
            timestamp,
        };

        await ctx.stub.putState(recordId, Buffer.from(stringify(sortKeysRecursive(record))));
    }

    @Transaction(false)
    @Returns('string')
    public async GetTraceabilityRecord(ctx: Context, recordId: string): Promise<string> {
        const recordBytes = await ctx.stub.getState(recordId);
        if (!recordBytes || recordBytes.length === 0) {
            throw new Error(`The traceability record ${recordId} does not exist`);
        }
        return recordBytes.toString();
    }

    @Transaction(false)
    @Returns('boolean')
    public async VerifyRecordHash(ctx: Context, recordId: string, expectedHash: string): Promise<boolean> {
        const recordBytes = await ctx.stub.getState(recordId);
        if (!recordBytes || recordBytes.length === 0) {
            throw new Error(`The traceability record ${recordId} does not exist`);
        }
        const record = JSON.parse(recordBytes.toString());
        return record.dataHash === expectedHash;
    }

    @Transaction(false)
    @Returns('boolean')
    public async RecordExists(ctx: Context, recordId: string): Promise<boolean> {
        const recordBytes = await ctx.stub.getState(recordId);
        return recordBytes && recordBytes.length > 0;
    }

    @Transaction(false)
    @Returns('string')
    public async GetRecordHistory(ctx: Context, recordId: string): Promise<string> {
        const iterator = await ctx.stub.getHistoryForKey(recordId);
        const allResults = [];
        
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const historyRecord: any = {
                    txId: res.value.txId,
                    timestamp: res.value.timestamp,
                    isDelete: res.value.isDelete,
                    record: res.value.isDelete ? undefined : JSON.parse(res.value.value.toString('utf8')),
                };
                allResults.push(historyRecord);
            }
            if (res.done) {
                await iterator.close();
                return JSON.stringify(allResults);
            }
        }
    }
}
