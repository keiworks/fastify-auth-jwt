import { delay } from "@keiworks/js-utilities";
import type { TemplateResponse } from "@keiworks/js-utilities/types";
import type { FastifyReply, FastifyRequest } from "fastify";

import { loginSchema, refreshSchema, registerSchema, zod } from "./plugin.js";
import { errorResponses } from "./response.js";
import authService from "./service.js";
import { settings } from "./settings.js";

async function login(
  req: FastifyRequest,
  res: FastifyReply
): Promise<TemplateResponse> {
  const delayPromise = delay(2000);

  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.statusCode = 403;
    await delayPromise;
    throw errorResponses.loginError();
  }

  try {
    const { accessToken, refreshToken } = await authService.login(result.data);
    await delayPromise;
    return { data: { accessToken, refreshToken } };
  } catch {
    res.statusCode = 403;
    await delayPromise;
    throw errorResponses.loginError();
  }
}

async function logout(req: FastifyRequest, res: FastifyReply): Promise<void> {
  const result = refreshSchema.safeParse(req.body);

  if (!result.success) {
    res.statusCode = 422;
    throw {
      errors: zod.formatErrors(result.error.errors),
    } satisfies TemplateResponse;
  }

  try {
    await authService.logout(result.data.refreshToken);
    res.code(200);
  } catch (error) {
    res.code(500);
    throw errorResponses.serverError(error);
  }
}

async function refresh(
  req: FastifyRequest,
  res: FastifyReply
): Promise<TemplateResponse> {
  const result = refreshSchema.safeParse(req.body);

  if (!result.success) {
    res.statusCode = 422;
    throw {
      errors: zod.formatErrors(result.error.errors),
    } satisfies TemplateResponse;
  }

  try {
    const accessToken = await authService.refresh(result.data.refreshToken);
    return { data: { accessToken } };
  } catch {
    res.statusCode = 403;
    throw errorResponses.refreshTokenInvalid();
  }
}

async function register(
  req: FastifyRequest,
  res: FastifyReply
): Promise<TemplateResponse> {
  const result = await registerSchema.safeParseAsync(req.body);

  if (!result.success) {
    res.statusCode = 422;
    throw {
      errors: zod.formatErrors(result.error.errors),
    } satisfies TemplateResponse;
  }

  try {
    const { accessToken, refreshToken } = await authService.register(
      result.data,
      settings.register.roleName
    );

    return { data: { accessToken, refreshToken } };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "the username already exist") {
        res.statusCode = 422;
        throw errorResponses.usernameAlreadyExist();
      }
    }

    res.statusCode = 500;
    throw errorResponses.serverError(error);
  }
}

export default { login, logout, refresh, register };
