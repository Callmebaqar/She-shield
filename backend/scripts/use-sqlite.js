// Switches the active Prisma schema to the SQLite dev schema and sets DATABASE_URL.
const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, '..', 'prisma');
const mainSchema = path.join(prismaDir, 'schema.prisma');
const devSchema = path.join(prismaDir, 'schema.dev.prisma');
const backupSchema = path.join(prismaDir, 'schema.postgres.prisma');

const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(devSchema)) {
  console.error('schema.dev.prisma not found');
  process.exit(1);
}

// Back up current main schema if it is the postgres one (so we can restore later)
const current = fs.readFileSync(mainSchema, 'utf8');
if (!current.includes('provider = "sqlite"') && !fs.existsSync(backupSchema)) {
  fs.writeFileSync(backupSchema, current);
  console.log('Backed up current schema to schema.postgres.prisma');
}

// Copy dev schema as active schema
fs.copyFileSync(devSchema, mainSchema);
console.log('Active Prisma schema -> SQLite (schema.dev.prisma)');

// Ensure .env points to sqlite
if (fs.existsSync(envPath)) {
  let env = fs.readFileSync(envPath, 'utf8');
  env = env.replace(/^DATABASE_URL=.*$/m, 'DATABASE_URL="file:./dev.db"');
  fs.writeFileSync(envPath, env);
  console.log('.env DATABASE_URL set to file:./dev.db');
}

console.log('Done. Run: prisma db push && prisma generate');
