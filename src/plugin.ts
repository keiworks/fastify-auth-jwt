import { ZodFormatter } from "@keiworks/js-utilities/library/zod";
import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { z, type ZodIssue, ZodSchema } from "zod";

import { type ErrorResponses, errorResponses } from "./response.js";
import { authRoutes } from "./routes.js";
import { type DefaultSettings, settings } from "./settings.js";

type FastifyAuthOptions = {
  argon2Opts?: Partial<DefaultSettings["argon2"]>;
  errorKey?: string;
  errorResponses?: Partial<ErrorResponses>;
  prefix?: string;
  prisma: PrismaClient;
  register?: Partial<DefaultSettings["register"]>;
  secretKey: string;
  token?: Partial<DefaultSettings["token"]>;
};

let prisma: PrismaClient;
let secretKey: string;
let zod: ZodFormatter;

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

let registerSchema: ZodSchema<{
  username: string;
  password: string;
  passwordConfirm: string;
}>;

function zodCustomError(error: ZodIssue): { key: string; value?: string } {
  if (error.message === "The password confirm must match!") {
    return {
      key: `${settings.response.errorKey}.password_confirm_not_matched`,
    };
  }

  return { key: `${settings.response.errorKey}.unknown` };
}

async function authJwtPlugin(
  fastify: FastifyInstance,
  opts: FastifyAuthOptions,
  done: (err?: Error) => void
): Promise<void> {
  if (opts.argon2Opts?.hashLength !== undefined) {
    settings.argon2.hashLength = opts.argon2Opts.hashLength;
  }

  if (opts.argon2Opts?.memoryCost !== undefined) {
    settings.argon2.memoryCost = opts.argon2Opts.memoryCost;
  }

  if (opts.argon2Opts?.type !== undefined) {
    settings.argon2.type = opts.argon2Opts.type;
  }

  if (opts.register?.usernameMinLength !== undefined) {
    settings.register.usernameMinLength = opts.register.usernameMinLength;
  }

  if (opts.register?.usernameMaxLength !== undefined) {
    settings.register.usernameMaxLength = opts.register.usernameMaxLength;
  }

  if (opts.register?.passwordMinLength !== undefined) {
    settings.register.passwordMinLength = opts.register.passwordMinLength;
  }

  if (opts.register?.passwordMaxLength !== undefined) {
    settings.register.passwordMaxLength = opts.register.passwordMaxLength;
  }

  if (opts.register?.roleName !== undefined) {
    settings.register.roleName = opts.register.roleName;
  }

  if (opts.token?.accessExpiresIn !== undefined) {
    settings.token.accessExpiresIn = opts.token.accessExpiresIn;
  }

  if (opts.token?.refreshExpiresIn !== undefined) {
    settings.token.refreshExpiresIn = opts.token.refreshExpiresIn;
  }

  if (opts.errorKey !== undefined) {
    settings.response.errorKey = opts.errorKey;
  }

  if (opts.errorResponses?.accessTokenInvalid !== undefined) {
    errorResponses.accessTokenInvalid = opts.errorResponses.accessTokenInvalid;
  }

  if (opts.errorResponses?.accessTokenRequired !== undefined) {
    errorResponses.accessTokenRequired =
      opts.errorResponses.accessTokenRequired;
  }

  if (opts.errorResponses?.loginError !== undefined) {
    errorResponses.loginError = opts.errorResponses.loginError;
  }

  if (opts.errorResponses?.noPermission !== undefined) {
    errorResponses.noPermission = opts.errorResponses.noPermission;
  }

  if (opts.errorResponses?.refreshTokenInvalid !== undefined) {
    errorResponses.refreshTokenInvalid =
      opts.errorResponses.refreshTokenInvalid;
  }

  if (opts.errorResponses?.serverError !== undefined) {
    errorResponses.serverError = opts.errorResponses.serverError;
  }

  if (opts.errorResponses?.usernameAlreadyExist !== undefined) {
    errorResponses.usernameAlreadyExist =
      opts.errorResponses.usernameAlreadyExist;
  }

  prisma = opts.prisma;

  secretKey = opts.secretKey;

  zod = new ZodFormatter({
    errorKey: settings.response.errorKey,
    customError: zodCustomError,
  });

  registerSchema = z
    .object({
      username: z
        .string()
        .min(settings.register.usernameMinLength)
        .max(settings.register.usernameMaxLength),
      password: z
        .string()
        .min(settings.register.passwordMinLength)
        .max(settings.register.passwordMaxLength),
      passwordConfirm: z.string(),
    })
    .superRefine(({ passwordConfirm, password }, ctx) => {
      if (passwordConfirm !== password) {
        ctx.addIssue({
          code: "custom",
          message: "The password confirm must match!",
          path: ["passwordConfirm"],
        });
      }
    });

  fastify.register(authRoutes, opts);

  done();
}

const fastifyAuthJwt = fp.default(authJwtPlugin, {
  fastify: "4.x",
  name: "fastifyAuthJwt",
});

export {
  fastifyAuthJwt,
  loginSchema,
  prisma,
  refreshSchema,
  registerSchema,
  secretKey,
  zod,
};

export type { ErrorResponses, FastifyAuthOptions };
