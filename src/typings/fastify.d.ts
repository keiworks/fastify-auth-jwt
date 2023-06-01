import type { UserJwt } from "../service.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: UserJwt;
  }
}

export {};
