// Switches the ACTIVE Prisma schema to the PostgreSQL production schema.
// This only swaps the schema file — it does NOT modify .env, so the real
// DATABASE_URL (from Render/VPS env or your .env) is preserved.
// After switching, ensure DATABASE_URL points at your Postgres, then run:
//   prisma db push (or prisma migrate deploy) && prisma generate
const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, '..', 'prisma');
const mainSchema = path.join(prismaDir, 'schema.prisma');
const postgresSchema = path.join(prismaDir, 'schema.postgres.prisma');

if (!fs.existsSync(postgresSchema)) {
  console.log('No schema.postgres.prisma found. Leaving schema.prisma as-is.');
  process.exit(1);
}

fs.copyFileSync(postgresSchema, mainSchema);
console.log('Active Prisma schema -> PostgreSQL (schema.prisma)');
console.log('Ensure DATABASE_URL points at your Postgres, then run: prisma db push && prisma generate');
