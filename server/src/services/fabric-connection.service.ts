import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Role } from '@prisma/client';

export class FabricConnectionService {
  private static readonly channelName = process.env.FABRIC_CHANNEL || 'dravya-channel';
  private static readonly chaincodeName = process.env.FABRIC_CHAINCODE || 'traceability';
  
  // Hardcoded for the local test-network prototype. In production, these would be in env vars.
  private static readonly mspIdOrg1 = 'Org1MSP';
  private static readonly mspIdOrg2 = 'Org2MSP';
  
  private static readonly networkDir = path.resolve(__dirname, '../../../../blockchain/fabric-samples/test-network');

  /**
   * Determine the Fabric Organization based on the Application Role.
   */
  public static getOrgForRole(role: Role): string {
    switch (role) {
      case Role.ADMIN:
      case Role.VERIFICATION_AUTHORITY:
      case Role.PRODUCER: // Producers might just use Org1 as a client in this prototype
        return 'org1.example.com';
      case Role.LAB:
        return 'org2.example.com';
      default:
        return 'org1.example.com';
    }
  }

  public static getMspIdForRole(role: Role): string {
    const org = this.getOrgForRole(role);
    return org === 'org1.example.com' ? this.mspIdOrg1 : this.mspIdOrg2;
  }

  private static async newGrpcConnection(org: string): Promise<grpc.Client> {
    let peerEndpoint = 'localhost:7051';
    let peerHostAlias = 'peer0.org1.example.com';
    if (org === 'org2.example.com') {
      peerEndpoint = 'localhost:9051';
      peerHostAlias = 'peer0.org2.example.com';
    }

    const tlsCertPath = path.join(
      this.networkDir,
      `organizations/peerOrganizations/${org}/peers/${peerHostAlias}/tls/ca.crt`
    );

    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
      'grpc.ssl_target_name_override': peerHostAlias,
    });
  }

  private static async newIdentity(org: string): Promise<Identity> {
    const certPath = path.join(
      this.networkDir,
      `organizations/peerOrganizations/${org}/users/User1@${org}/msp/signcerts`
    );
    const files = await fs.readdir(certPath);
    const cert = await fs.readFile(path.join(certPath, files[0]));
    
    const mspId = org === 'org1.example.com' ? this.mspIdOrg1 : this.mspIdOrg2;
    return { mspId, credentials: cert };
  }

  private static async newSigner(org: string): Promise<Signer> {
    const keyPath = path.join(
      this.networkDir,
      `organizations/peerOrganizations/${org}/users/User1@${org}/msp/keystore`
    );
    const files = await fs.readdir(keyPath);
    const key = await fs.readFile(path.join(keyPath, files[0]));
    const privateKey = crypto.createPrivateKey(key);
    return signers.newPrivateKeySigner(privateKey);
  }

  /**
   * Connect to the Fabric network and return the Contract and a cleanup function.
   */
  public static async getContractForRole(role: Role): Promise<{ contract: Contract, close: () => void }> {
    const org = this.getOrgForRole(role);
    const client = await this.newGrpcConnection(org);
    const gateway = connect({
      client,
      identity: await this.newIdentity(org),
      signer: await this.newSigner(org),
      // Default timeouts for testing
      evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
      endorseOptions: () => ({ deadline: Date.now() + 15000 }),
      submitOptions: () => ({ deadline: Date.now() + 5000 }),
      commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
    });

    const network = gateway.getNetwork(this.channelName);
    const contract = network.getContract(this.chaincodeName);

    const close = () => {
      gateway.close();
      client.close();
    };

    return { contract, close };
  }
}
