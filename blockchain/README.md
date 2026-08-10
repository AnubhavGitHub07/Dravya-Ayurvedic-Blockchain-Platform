# Dravya Hyperledger Fabric Development Network

This directory contains the development environment for the Dravya Hyperledger Fabric permissioned blockchain network.

## Purpose

The blockchain network provides a tamper-evident shared ledger for finalized traceability records.
**IMPORTANT:** PostgreSQL stores application data; Hyperledger Fabric stores tamper-evident hash anchors.

## Network Architecture

The development network uses the `fabric-samples` test network to spin up a local Docker-based Fabric environment.
- **Fabric Version:** v2.5.x
- **Fabric CA Version:** v1.5.x
- **Channel:** `dravya-channel`
- **Chaincode Name:** `traceability`

## Organizations (MSPs)

For this prototype, we map application roles to two Fabric organizations:
1. **Org1 (Org1MSP):** Represents the Dravya Admin and the Government Verification Authority.
2. **Org2 (Org2MSP):** Represents the Laboratory.

## How to use

### Starting the Network
Run the following script to download `fabric-samples` (if missing), start the Docker containers, create the channel, and deploy the chaincode.
```bash
./scripts/start-network.sh
```

### Stopping the Network
To completely tear down the network and remove the Docker containers, volumes, and cryptographic material:
```bash
./scripts/teardown-network.sh
```

## Chaincode

The chaincode is located in `chaincode/` and provides the following functions:
- `CreateTraceabilityRecord(recordId, entityType, dataHash, recordVersion, actorOrg, timestamp)`
- `GetTraceabilityRecord(recordId)`
- `VerifyRecordHash(recordId, expectedHash)`
- `RecordExists(recordId)`
- `GetRecordHistory(recordId)`
