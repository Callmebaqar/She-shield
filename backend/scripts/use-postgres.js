// Switches the active Prisma schema back to the PostgreSQL production schema.
const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, '..', 'prisma');
const mainSchema = path.join(prismaDir, 'schema.prisma');
const postgresSchema = path.join(prismaDir, 'schema.postgres.prisma');

if (!fs.existsSync(postgresSchema)) {
  console.log('No schema.postgres.prisma backup found. Leaving schema.prisma as-is.');
  process.exit(1);
}

fs.copyFileSync(postgresSchema, mainSchema);
console.log('Active Prisma schema -> PostgreSQL (schema.prisma)');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  let env = fs.readFileSync(envPath, 'utf8');
  env = env.replace(
    /^DATABASE_URL=.*$/m,
    'DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/sheshield?schema=public"'
  );
  fs.writeFileSync(envPath, env);
}

console.log('Done. Set real DATABASE_URL in .env, then run: prisma migrate deploy && prisma generate');
