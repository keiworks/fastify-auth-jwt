import type { TemplateResponse } from "@keiworks/js-utilities/types";
import { PrismaClient } from "@prisma/client";
import { fastify, type FastifyInstance } from "fastify";

import { authMiddleware, fastifyAuthJwt } from "../src/index.js";

function buildSampleApp(prisma: PrismaClient): FastifyInstance {
  const app = fastify();

  app.register(fastifyAuthJwt, {
    prefix: "/api/auth",
    prisma,
    register: {
      passwordMaxLength: 48,
    },
    secretKey: "sampleSecretKey",
    token: {
      accessExpiresIn: "3s",
      refreshExpiresIn: "5s",
    },
  });

  app.get("/api/posts", { preHandler: authMiddleware.loggedIn }, async () => {
    return {
      data: [
        { id: 1, title: "test 1" },
        { id: 2, title: "test 2" },
      ],
    } satisfies TemplateResponse;
  });

  app.get(
    "/api/posts-guarded",
    {
      preHandler: [authMiddleware.loggedIn, authMiddleware.guard(["admin"])],
    },
    async () => {
      return {
        data: [
          { id: 1, title: "test 1" },
          { id: 2, title: "test 2" },
        ],
      } satisfies TemplateResponse;
    }
  );

  return app;
}

export { buildSampleApp };
