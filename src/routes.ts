import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";

import authController from "./controller.js";
import authMiddleware from "./middleware.js";
import type { FastifyAuthOptions } from "./plugin.js";

async function authRoutes(
  fastify: FastifyInstance,
  _options: FastifyAuthOptions,
  done: HookHandlerDoneFunction
): Promise<void> {
  fastify.route({
    method: "POST",
    url: "/login",
    handler: authController.login,
  });

  fastify.route({
    method: "POST",
    url: "/logout",
    preHandler: [authMiddleware.loggedIn],
    handler: authController.logout,
  });

  fastify.route({
    method: "POST",
    url: "/refresh",
    handler: authController.refresh,
  });

  fastify.route({
    method: "POST",
    url: "/register",
    handler: authController.register,
  });

  done();
}

export { authRoutes };
