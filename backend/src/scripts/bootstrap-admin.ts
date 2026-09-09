import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function bootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  // Credentials are supplied only through Render environment variables.
  if (!email || !password) {
    console.log('Admin bootstrap skipped: ADMIN_EMAIL and ADMIN_PASSWORD are not configured.');
    return;
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { role: Role.ADMIN, isActive: true },
    });
    console.log(`Admin access confirmed for ${email}.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: process.env.ADMIN_FIRST_NAME?.trim() || 'Admin',
      lastName: process.env.ADMIN_LAST_NAME?.trim() || 'MedBridge',
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`Admin account created for ${email}.`);
}

bootstrapAdmin()
  .catch((error) => {
    console.error('Admin bootstrap failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
