import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(prisma: PrismaClient): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'sahadatadmin@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123456';

  const adminRole = await prisma.role.findUnique({
    where: {
      name: 'ADMIN',
    },
    select: {
      id: true,
    },
  });

  if (!adminRole) {
    throw new Error(
      'ADMIN role not found. Please run role seed before admin seed.',
    );
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
    select: {
      id: true,
    },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: {
        email: adminEmail,
      },
      data: {
        passwordHash: hashedPassword,
        roleId: adminRole.id,
      },
    });

    console.log(`Admin user updated and verified: ${adminEmail}`);
    return;
  }

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log(`Admin user created and verified: ${adminEmail}`);
}