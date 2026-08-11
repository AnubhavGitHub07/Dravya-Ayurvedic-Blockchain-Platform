
import { prisma } from '../src/lib/prisma';

const BASE_URL = 'http://localhost:8000/api';

async function runTests() {
  console.log('--- STARTING STEP 11A TESTS ---\n');

  try {
    // 1. Create a dummy user for auth tests (Admin)
    const adminEmail = `admin-11a-${Date.now()}@test.com`;
    console.log(`Creating test admin: ${adminEmail}`);

    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin Test',
        email: adminEmail,
        password: 'Password123!',
        role: 'ADMIN',
        phone: '+919999999999'
      })
    });
    const registerData = await registerRes.json();

    // Note: Admin registration via public endpoint should fail with a 403. Let's test that!
    if (registerRes.status === 403) {
      console.log('✅ PASS: Admin public registration blocked (403)');
      if (registerData.success !== false) throw new Error('Expected success: false');
    } else {
      console.log('❌ FAIL: Admin public registration should have been blocked', registerRes.status);
    }

    // Register a valid producer
    const producerEmail = `producer-11a-${Date.now()}@test.com`;
    const prodRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Producer Test',
        email: producerEmail,
        password: 'Password123!',
        role: 'PRODUCER',
        phone: '+919999999999'
      })
    });
    const prodData = await prodRes.json();
    
    if (prodRes.status === 201 && prodData.success === true) {
      console.log('✅ PASS: Producer public registration (201)');
    } else {
      console.log('❌ FAIL: Producer public registration', prodData);
    }
    
    const token = prodData.data.token;

    // 2. Test Pagination and Error formatting (Validation Error)
    console.log('\nTesting validation errors format...');
    const userRes = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = await userRes.json();
    
    if (userRes.status === 403 && userData.success === false) {
       console.log('✅ PASS: RBAC 403 formatting');
    } else {
       console.log('❌ FAIL: RBAC 403 formatting. Status:', userRes.status, 'Data:', userData);
    }

    const notifRes = await fetch(`${BASE_URL}/notifications?limit=abc`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const notifData = await notifRes.json();
    
    if (notifRes.status === 400 && notifData.success === false && notifData.errors) {
       console.log('✅ PASS: Validation 400 formatting');
       console.log('   Error payload:', JSON.stringify(notifData.errors));
    } else {
       console.log('❌ FAIL: Validation 400 formatting', notifData);
    }

    const notifResValid = await fetch(`${BASE_URL}/notifications?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const notifDataValid = await notifResValid.json();
    
    if (notifResValid.status === 200 && notifDataValid.success === true) {
       console.log('✅ PASS: Pagination success formatting');
       if (notifDataValid.data.pagination) {
         console.log('   Pagination payload:', JSON.stringify(notifDataValid.data.pagination));
       }
    } else {
       console.log('❌ FAIL: Pagination success formatting', notifDataValid);
    }
    
    console.log('\n--- ALL STEP 11A TESTS FINISHED ---');

  } catch (error: any) {
    console.error('Test script crashed:', error?.response?.data || error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
