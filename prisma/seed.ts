import { PrismaClient, type Role } from "@prisma/client";
import argon2 from "argon2";

import { settings } from "../src/settings.js";

const prisma = new PrismaClient();
const roles = ["admin", "regular"] as const;

async function main(): Promise<void> {
  let adminRole: Role | undefined;

  for (const role of roles) {
    if (role === "admin") {
      adminRole = await prisma.role.create({
        data: {
          name: role,
        },
      });
    } else {
      await prisma.role.create({
        data: {
          name: role,
        },
      });
    }
  }

  if (adminRole === undefined) {
    throw new Error("The admin role is undefined!");
  }

  const username = "admin";
  const password = await argon2.hash("12345678", settings.argon2);

  await prisma.user.create({
    data: {
      username,
      password,
      roleId: adminRole.id,
    },
  });
}

try {
  await main();
  await prisma.$disconnect();
} catch (error) {
  throw error;
}
