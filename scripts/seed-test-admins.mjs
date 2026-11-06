// Adds 12 test admins with a mix of roles and statuses, for trying out the Staff page. Safe to run again.
// All of them use the password below, so never run this on a live system.
// Usage: npm run db:seed-test-admins          adds them
//        npm run db:seed-test-admins -- --remove     removes only these 12
import { readFileSync } from 'node:fs';
import { generateUuid } from '@kadai/shared';
import { hash } from '@node-rs/argon2';
import mongoose from 'mongoose';

const PASSWORD = 'Test@12345';
const DAY_MS = 24 * 60 * 60 * 1000;
/** The same cost as the server's PasswordService. */
const HASH_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

// joined and login are days ago. No login means they've never logged in.
const PEOPLE = [
  { name: 'Lakshmi Narayanan', staffRole: 'super_admin', phone: '9840012301', joined: 300, login: 0 },
  { name: 'Meena Raghavan', staffRole: 'admin', phone: '9840012302', joined: 240, login: 1 },
  { name: 'Vignesh Pandian', staffRole: 'admin', joined: 180, login: 3 },
  { name: 'Arun Kumar', staffRole: 'manager', phone: '9840012304', joined: 150, login: 0 },
  { name: 'Divya Krishnan', staffRole: 'manager', joined: 120, login: 7 },
  { name: 'Saravanan Muthu', staffRole: 'manager', phone: '9840012306', joined: 200, login: 60, isActive: false },
  { name: 'Selvi Murugan', staffRole: 'staff', phone: '9840012307', joined: 90, login: 0 },
  { name: 'Karthik Subramanian', staffRole: 'staff', joined: 60, login: 2 },
  { name: 'Anitha Rajan', staffRole: 'staff', phone: '9840012309', joined: 14 },
  { name: 'Gopal Iyer', staffRole: 'staff', joined: 100, login: 45, isActive: false },
  { name: 'Priya Nair', staffRole: 'viewer', phone: '9840012311', joined: 45, login: 10 },
  { name: 'Ramesh Babu', staffRole: 'viewer', joined: 5 },
].map((person) => ({ ...person, email: `test.${person.name.split(' ')[0].toLowerCase()}@kadaios.test` }));

function readMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  const env = readFileSync(new URL('../server/.env', import.meta.url), 'utf8');
  const uri = env.match(/^MONGODB_URI=(.+)$/m)?.[1]?.trim();
  if (!uri) throw new Error('MONGODB_URI is not set in server/.env.');
  return uri;
}

const connection = await mongoose.createConnection(readMongoUri(), { serverSelectionTimeoutMS: 5000 }).asPromise();

try {
  // The MongoDB service is shared with other projects, so never touch anything else.
  if (!connection.name.startsWith('kadai_')) {
    throw new Error(`Refusing to run on "${connection.name}": this only works on kadai_ databases.`);
  }

  const users = connection.collection('users');
  const emails = PEOPLE.map(({ email }) => email);

  if (process.argv.includes('--remove')) {
    const { deletedCount } = await users.deleteMany({ email: { $in: emails }, role: 'admin' });
    console.log(`Removed ${deletedCount} test admins from ${connection.name}.`);
  } else {
    const passwordHash = await hash(PASSWORD, HASH_OPTIONS);
    const now = Date.now();
    let added = 0;

    // Oldest first, because the staff list sorts by ID, and new IDs sort by when they were created.
    for (const { joined, login, ...person } of [...PEOPLE].sort((a, b) => b.joined - a.joined)) {
      if (await users.findOne({ email: person.email, role: 'admin' })) continue;

      const createdAt = new Date(now - joined * DAY_MS);
      await users.insertOne({
        isActive: true,
        ...person,
        _id: generateUuid(),
        passwordHash,
        role: 'admin',
        ...(login !== undefined && { lastLoginAt: new Date(now - login * DAY_MS) }),
        createdAt,
        updatedAt: createdAt,
      });
      added += 1;
    }

    console.log(`Added ${added} test admins to ${connection.name} (${PEOPLE.length - added} already there).`);
    console.log(`Log in with any of these, password ${PASSWORD}:`);
    for (const { email, staffRole, isActive } of PEOPLE) {
      console.log(`  ${email.padEnd(28)} ${staffRole}${isActive === false ? ' (deactivated)' : ''}`);
    }
  }
} finally {
  await connection.close();
}
