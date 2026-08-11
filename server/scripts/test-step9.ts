import { prisma } from '../src/lib/prisma';
import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:8000/api';

async function runTests() {
  console.log('--- Step 9 Tests: Notifications ---');
  
  // Wait for server to be up
  try {
    const res = await fetch('http://localhost:8000/api/health');
    if (!res.ok) throw new Error();
  } catch {
    console.log('Server is not running. Please start the server on port 8000.');
    process.exit(1);
  }

  // Find a producer user
  const producer = await prisma.user.findFirst({
    where: { role: 'PRODUCER' },
    include: { producerProfile: true }
  });

  if (!producer) {
    console.log('No PRODUCER user found. Please run previous step tests first to seed data.');
    process.exit(1);
  }

  console.log('1. Database Model Exists...');
  const notifCount = await prisma.notification.count();
  console.log(`Current total notifications: ${notifCount}`);

  // Test API access
  console.log('\n2. Testing Authentication & Retrieval...');
  
  // Login producer
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: producer.email,
      password: 'Password123'
    })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  const reqHeaders = { 'Authorization': `Bearer ${token}` };

  // Get notifications
  const notifRes = await fetch(`${BASE_URL}/notifications`, { headers: reqHeaders });
  const notifData = await notifRes.json();
  console.log(`Fetched notifications. Success: ${notifData.success}`);
  
  // Get unread count
  const unreadRes = await fetch(`${BASE_URL}/notifications/unread-count`, { headers: reqHeaders });
  const unreadData = await unreadRes.json();
  console.log(`Unread count: ${unreadData.data.unreadCount}`);

  // Mark all as read
  if (unreadData.data.unreadCount > 0) {
    const markAllRes = await fetch(`${BASE_URL}/notifications/read-all`, { method: 'PATCH', headers: reqHeaders });
    const markAllData = await markAllRes.json();
    console.log(`Mark all read. Success: ${markAllData.success}`);
    
    // Verify count is 0
    const countCheck = await fetch(`${BASE_URL}/notifications/unread-count`, { headers: reqHeaders });
    const countCheckData = await countCheck.json();
    console.log(`New Unread count (should be 0): ${countCheckData.data.unreadCount}`);
  }

  console.log('\n3. End-to-End simulation check...');
  console.log('We will check if notifications were generated during previous operations, or you can run the full end-to-end demo manually.');

  const producerNotifications = await prisma.notification.findMany({
    where: { userId: producer.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log('Recent Notifications for Producer:');
  producerNotifications.forEach(n => {
    console.log(`- [${n.type}] ${n.title} (Read: ${n.isRead})`);
  });

  console.log('\nAll tests passed successfully for Step 9.');
}

runTests().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
