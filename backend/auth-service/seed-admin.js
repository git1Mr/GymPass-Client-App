/**
 * Seed / reset the platform admin account directly in MongoDB.
 *
 * This talks to Mongo directly (not the HTTP gateway), so it is immune to the
 * CORS / ngrok-interstitial / device-binding issues that make the HTTP seed
 * (scripts/seed_demo_accounts.py) flaky. Use it to guarantee a working admin
 * login on a fresh or deployed database.
 *
 * Run it where Mongo is reachable. Easiest is inside the auth-service container
 * (MONGO_URI + the docker network are already in scope):
 *
 *   docker compose exec auth-service node seed-admin.js
 *
 * Or locally, if Mongo is exposed on the host:
 *
 *   cd backend/auth-service && node seed-admin.js
 *
 * Credentials come from env vars, with safe defaults:
 *   SEED_ADMIN_EMAIL     (default zakarialembarki3@gmail.com)
 *   SEED_ADMIN_PASSWORD  (default 12345678)
 *   SEED_ADMIN_NAME      (default Zakaria Lembarki)
 *
 * Idempotent: if the email already exists it is promoted to admin, reactivated,
 * and its password reset to the given value — so you always finish with a
 * working admin credential, never a duplicate-key error.
 */
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const crypto   = require('crypto');
const config   = require('config');

const { User } = require('./models/user');

const EMAIL    = (process.env.SEED_ADMIN_EMAIL || 'zakarialembarki3@gmail.com').toLowerCase();
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || '12345678';
const NAME     = process.env.SEED_ADMIN_NAME || 'Zakaria Lembarki';

async function main() {
  const uri = config.get('db.uri');
  await mongoose.connect(uri);
  console.log(`Connected to MongoDB → ${uri}`);

  const password = await bcrypt.hash(PASSWORD, await bcrypt.genSalt(10));
  const existing = await User.findOne({ email: EMAIL });

  if (existing) {
    existing.name = NAME;
    existing.password = password;
    existing.role = 'admin';
    existing.status = 'active';
    existing.gymId = null;
    // A "web-" deviceId lets the account log in from any browser (the
    // auth-service bypasses device-binding for web ids).
    if (!existing.deviceId || !existing.deviceId.startsWith('web-')) {
      existing.deviceId = `web-${crypto.randomUUID()}`;
    }
    await existing.save();
    console.log(`Updated existing account → admin (${EMAIL})`);
  } else {
    await User.create({
      name: NAME,
      email: EMAIL,
      password,
      role: 'admin',
      status: 'active',
      deviceId: `web-${crypto.randomUUID()}`,
      gymId: null,
    });
    console.log(`Created admin account (${EMAIL})`);
  }

  console.log('\nAdmin credentials:');
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${PASSWORD}`);
}

main()
  .then(() => mongoose.disconnect())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  });
