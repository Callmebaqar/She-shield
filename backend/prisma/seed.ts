import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin@1234', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sheshield.app' },
    update: {},
    create: {
      name: 'SheShield Admin',
      email: 'admin@sheshield.app',
      passwordHash: hash,
      role: 'ADMIN',
      emailVerified: true,
      physicalDescription: null,
      profilePhoto: null,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'demo@sheshield.app' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@sheshield.app',
      passwordHash: hash,
      role: 'USER',
      emailVerified: true,
      physicalDescription: null,
      profilePhoto: null,
    },
  });

  console.log('Seeded admin:', admin.email, '(password: Admin@1234)');
  console.log('Seeded user:', user.email, '(password: Admin@1234)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
