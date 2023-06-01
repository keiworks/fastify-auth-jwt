import jwt from "jsonwebtoken";

import { secretKey } from "./plugin.js";
import type { UserJwt } from "./service.js";
import { settings } from "./settings.js";

type UserData = {
  exp: number;
  iat: number;
} & UserJwt;

function generateAccessToken(payload: UserJwt): string {
  return jwt.sign(payload, secretKey, {
    expiresIn: settings.token.accessExpiresIn,
  });
}

function generateRefreshToken(payload: UserJwt): string {
  return jwt.sign(payload, secretKey, {
    expiresIn: settings.token.refreshExpiresIn,
  });
}

function verfiyToken(token: string): UserJwt | undefined {
  try {
    const data = jwt.verify(token, secretKey) as UserData;

    const payload: UserJwt = {
      id: data.id,
      role: data.role,
      username: data.username,
    };

    return payload;
  } catch {
    return undefined;
  }
}

export { generateAccessToken, generateRefreshToken, verfiyToken };
