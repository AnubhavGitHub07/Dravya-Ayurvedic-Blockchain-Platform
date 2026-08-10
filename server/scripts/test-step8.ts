import { SupplyChainService } from '../src/services/supply-chain.service';
import { prisma } from '../src/lib/prisma';
import assert from 'assert';

async function runTests() {
  console.log('--- Running Step 8 Tests ---');

  // Negative tests for assignments without hitting DB with real data (since we might not have a clean setup).
  console.log('Test 1: Assign distributor to non-existent batch throws error');
  try {
    await SupplyChainService.assignDistributor('non-existent', 'distributor-id', 'admin-id');
    assert.fail('Should have thrown an error');
  } catch (err: any) {
    assert.strictEqual(err.message, 'Batch not found');
  }
  console.log('✅ Test 1 Passed');

  console.log('Test 2: Receive non-existent batch throws error');
  try {
    await SupplyChainService.receiveBatch('non-existent', 'distributor-id', { quantity: 100 });
    assert.fail('Should have thrown an error');
  } catch (err: any) {
    assert.strictEqual(err.message, 'Batch not found');
  }
  console.log('✅ Test 2 Passed');

  // The rest of the endpoints are tested manually via the frontend/postman as per the demo instructions.
  
  console.log('--- All Step 8 backend unit tests passed! ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
