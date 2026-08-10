import { HashingService } from '../src/services/hashing.service';
import assert from 'assert';

async function runTests() {
  console.log('--- Running Step 6 Tests ---');

  // Test 1: Deterministic Hashing
  console.log('Test 1: Hashing - Same record generates same hash');
  const recordA = { id: '123', status: 'COMPLETED', date: new Date('2026-01-01T00:00:00Z'), value: 45.6 };
  const recordB = { value: 45.6, date: new Date('2026-01-01T00:00:00Z'), id: '123', status: 'COMPLETED' };
  
  const hashA = HashingService.hashRecord(recordA);
  const hashB = HashingService.hashRecord(recordB);
  
  assert.strictEqual(hashA, hashB, 'Hashes should be identical regardless of key order');
  console.log('✅ Test 1 Passed');

  // Test 2: Hashing - Modified field generates different hash
  console.log('Test 2: Hashing - Modified record generates different hash');
  const recordC = { id: '123', status: 'COMPLETED', date: new Date('2026-01-01T00:00:00Z'), value: 45.7 };
  const hashC = HashingService.hashRecord(recordC);
  assert.notStrictEqual(hashA, hashC, 'Hashes should differ if data differs');
  console.log('✅ Test 2 Passed');

  // Since we are mocking the blockchain network in CI environment without Docker, we will only run Hashing tests.
  // The rest of the endpoints are tested manually via the frontend/postman as per the demo instructions.
  
  console.log('--- All Step 6 backend unit tests passed! ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
