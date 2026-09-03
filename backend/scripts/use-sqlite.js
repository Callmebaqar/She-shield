// Switches the ACTIVE Prisma schema to the SQLite dev schema.
// This only swaps the schema file — it does NOT modify .env, so the real
// DATABASE_URL (from Render/VPS env or your .env) is never clobbered.
// After switching, set DATABASE_URL="file:./dev.db" yourself for local dev.
const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, '..', 'prisma');
const mainSchema = path.join(prismaDir, 'schema.prisma');
const devSchema = path.join(prismaDir, 'schema.dev.prisma');
const backupSchema = path.join(prismaDir, 'schema.postgres.prisma');

if (!fs.existsSync(devSchema)) {
  console.error('schema.dev.prisma not found');
  process.exit(1);
}

// Back up current main schema if it is the postgres one (so we can restore later)
const current = fs.readFileSync(mainSchema, 'utf8');
if (!current.includes('provider = "sqlite"')) {
  fs.copyFileSync(mainSchema, backupSchema);
  console.log('Backed up current schema to schema.postgres.prisma');
}

// Copy dev schema as active schema
fs.copyFileSync(devSchema, mainSchema);
console.log('Active Prisma schema -> SQLite (schema.dev.prisma)');
console.log('Remember to set DATABASE_URL="file:./dev.db" for local dev, then run: prisma db push && prisma generate');
