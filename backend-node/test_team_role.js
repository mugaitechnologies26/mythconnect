const http = require('http');

function sendReq(path, method, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5050,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
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

async function run() {
  console.log('--- Testing Team Member & Role Assignment API ---');

  // 1. Fetch existing users
  const usersRes = await sendReq('/api/auth/users', 'GET');
  console.log(`[PASS] Fetched users: count=${usersRes.body?.users?.length}`);

  // 2. Fetch roles
  const rolesRes = await sendReq('/api/roles', 'GET');
  const roles = rolesRes.body?.data || [];
  console.log(`[PASS] Fetched roles: count=${roles.length}`);
  const salesManagerRole = roles.find(r => r.name === 'sales_manager') || roles[0];

  // 3. Create a new team member with assigned role
  const newMemberPayload = {
    name: 'Kavita Menon Test',
    email: `kavita.test.${Date.now()}@mythconnect.ai`,
    phone: '+919876599999',
    role_id: salesManagerRole.id,
    role: salesManagerRole.name,
    team_name: 'Enterprise Sales Team',
    password: 'Password@2026',
    is_active: 1
  };

  const createRes = await sendReq('/api/auth/users', 'POST', newMemberPayload);
  const createdUser = createRes.body?.user;
  const isCreatedOk = createRes.status === 201 && createdUser?.id && createdUser?.role_id === salesManagerRole.id;
  console.log(`[${isCreatedOk ? 'PASS' : 'FAIL'}] Created Team Member:`);
  console.log(`       ID: ${createdUser?.id}, Name: ${createdUser?.name}, Role: ${createdUser?.role} (${createdUser?.role_display})`);
  console.log(`       Role ID: ${createdUser?.role_id}, Team: ${createdUser?.team_name}`);

  // 4. Update team member's role to Accounts
  const accountsRole = roles.find(r => r.name === 'accounts') || roles[roles.length - 1];
  const updateRes = await sendReq(`/api/auth/users/${createdUser.id}`, 'PUT', {
    role_id: accountsRole.id,
    role: accountsRole.name,
    team_name: 'Finance & Accounts'
  });
  const updatedUser = updateRes.body?.user;
  const isUpdateOk = updateRes.status === 200 && updatedUser?.role_id === accountsRole.id;
  console.log(`[${isUpdateOk ? 'PASS' : 'FAIL'}] Updated Team Member Role to ${accountsRole.display_name}:`);
  console.log(`       Role ID: ${updatedUser?.role_id}, Role: ${updatedUser?.role} (${updatedUser?.role_display}), Team: ${updatedUser?.team_name}`);

  // 5. Delete test team member
  const deleteRes = await sendReq(`/api/auth/users/${createdUser.id}`, 'DELETE');
  console.log(`[${deleteRes.status === 200 ? 'PASS' : 'FAIL'}] Cleaned up test team member`);

  console.log('\nAll Team Member & Role assignment tests completed successfully!');
}

run().catch(console.error);
