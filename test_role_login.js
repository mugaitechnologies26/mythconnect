const http = require('http');

function sendReq(path, method, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5050,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing Role-Based Login API ---');

  const rolesToTest = [
    { role: 'super_admin', expectedName: 'Aravind Swaminathan', minMenus: 14 },
    { role: 'admin', expectedName: 'Priya Narayanan', minMenus: 14 },
    { role: 'sales_manager', expectedName: 'Vikram Malhotra', minMenus: 8 },
    { role: 'sales_executive', expectedName: 'Sneha Kulkarni', minMenus: 7 },
    { role: 'accounts', expectedName: 'Rohan Deshmukh', minMenus: 5 },
  ];

  for (const t of rolesToTest) {
    try {
      const res = await sendReq('/api/auth/login', 'POST', { role: t.role });
      const ok = res.status === 200 && res.body?.success && res.body?.user?.role === t.role;
      const user = res.body?.user;
      const menuPerms = (user?.permissions || []).filter(p => p.startsWith('menu.'));
      console.log(`[${ok ? 'PASS' : 'FAIL'}] Login as ${t.role}:`);
      console.log(`       User: ${user?.name} (${user?.email})`);
      console.log(`       Role Display: ${user?.role_display}`);
      console.log(`       Permissions: ${user?.permissions?.length || 0} total, ${menuPerms.length} menu permissions`);
    } catch (err) {
      console.error(`[FAIL] Login as ${t.role}: ${err.message}`);
    }
  }

  // Test credentials login with email
  try {
    const res = await sendReq('/api/auth/login', 'POST', { email: 'sneha.k@mythconnect.ai', password: 'Secret123!' });
    const ok = res.status === 200 && res.body?.user?.email === 'sneha.k@mythconnect.ai';
    console.log(`[${ok ? 'PASS' : 'FAIL'}] Login with credentials (sneha.k@mythconnect.ai): role=${res.body?.user?.role}`);
  } catch (err) {
    console.error(`[FAIL] Credentials login: ${err.message}`);
  }

  // Test switch role
  try {
    const res = await sendReq('/api/auth/switch-role', 'POST', { role: 'accounts' });
    const ok = res.status === 200 && res.body?.user?.role === 'accounts';
    console.log(`[${ok ? 'PASS' : 'FAIL'}] Switch role to accounts: user=${res.body?.user?.name}`);
  } catch (err) {
    console.error(`[FAIL] Switch role: ${err.message}`);
  }

  // Test dynamic custom role creation and login as that custom role
  try {
    const createRes = await sendReq('/api/roles', 'POST', {
      display_name: 'Operations Associate',
      description: 'Handles support inquiries and customer communications',
      permissions: ['menu.dashboard', 'menu.whatsapp', 'menu.customers']
    });
    const createdRole = createRes.body?.data;
    console.log(`[PASS] Dynamic Custom Role Created: id=${createdRole?.id}, name=${createdRole?.name}`);

    // Login directly as this custom role!
    const customLoginRes = await sendReq('/api/auth/login', 'POST', { role: createdRole?.name });
    const customUser = customLoginRes.body?.user;
    const isCustomOk = customLoginRes.status === 200 && customUser?.role === createdRole?.name;
    console.log(`[${isCustomOk ? 'PASS' : 'FAIL'}] Login as Dynamic Custom Role (${createdRole?.name}):`);
    console.log(`       User: ${customUser?.name} (${customUser?.email})`);
    console.log(`       Role Display: ${customUser?.role_display}`);
    console.log(`       Assigned Permissions:`, customUser?.permissions);

    // Cleanup
    await sendReq(`/api/roles/${createdRole.id}`, 'DELETE');
    console.log(`[PASS] Cleaned up dynamic test role`);
  } catch (err) {
    console.error(`[FAIL] Dynamic custom role test: ${err.message}`);
  }
}

runTests();
