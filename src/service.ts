import argon2 from "argon2";
import ms from "ms";

import {
  generateAccessToken,
  generateRefreshToken,
  verfiyToken,
} from "./jwt.js";
import { prisma } from "./plugin.js";
import { settings } from "./settings.js";

type LoginBody = { username: string; password: string };

type RegisterBody = {
  username: string;
  password: string;
  passwordConfirm: string;
};

type UserJwt = {
  id: number;
  role: string;
  username: string;
};

async function login(
  body: LoginBody
): Promise<{ accessToken: string; refreshToken: string }> {
  const user = await prisma.user.findUnique({
    where: { username: body.username },
    select: {
      id: true,
      username: true,
      password: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  let passwordIsValid: boolean;

  if (user?.password !== undefined) {
    passwordIsValid = await argon2.verify(
      user.password,
      body.password,
      settings.argon2
    );
  } else {
    passwordIsValid = false;
  }

  if (user === null || !passwordIsValid) {
    throw new Error("invalid user");
  }

  const payload: UserJwt = {
    id: user.id,
    role: user.role.name,
    username: user.username,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const expirationDate = new Date(
    ms(settings.token.refreshExpiresIn) + Date.now()
  );

  await prisma.refreshToken.create({
    data: { token: refreshToken, expiresAt: expirationDate },
  });

  return { accessToken, refreshToken };
}

async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.delete({
    where: { token: refreshToken },
  });
}

async function refresh(refreshToken: string): Promise<string> {
  const tokenData = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    select: { id: true },
  });

  if (tokenData === null) {
    throw new Error("invalid token");
  }

  const payload = verfiyToken(refreshToken);

  if (payload === undefined) {
    throw new Error("invalid token");
  }

  const accessToken = generateAccessToken(payload);

  return accessToken;
}

async function register(
  body: RegisterBody,
  registerRoleName: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const usernameAlreadyExist = await prisma.user.findUnique({
    where: { username: body.username },
    select: { id: true },
  });

  if (usernameAlreadyExist !== null) {
    throw new Error("the username already exist");
  }

  const registerRole = await prisma.role.findUnique({
    where: { name: registerRoleName },
    select: { id: true },
  });

  if (registerRole === null) {
    throw new Error("the register role is null");
  }

  const hashedPassword = await argon2.hash(body.password, settings.argon2);

  const userData = await prisma.user.create({
    data: {
      username: body.username,
      password: hashedPassword,
      roleId: registerRole.id,
    },
    select: {
      id: true,
      username: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  const payload: UserJwt = {
    id: userData.id,
    role: registerRoleName,
    username: userData.username,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
}

export default { login, logout, refresh, register };

export type { UserJwt };
