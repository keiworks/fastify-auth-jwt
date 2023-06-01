import type {
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from "fastify";

import { verfiyToken } from "./jwt.js";
import { errorResponses } from "./response.js";

function guard<T extends string[] = string[]>(requiredRoleNames: T) {
  return (
    req: FastifyRequest,
    res: FastifyReply,
    done: HookHandlerDoneFunction
  ): FastifyReply | void => {
    const userRole = req.user?.role ?? "";

    if (!requiredRoleNames.includes(userRole)) {
      return res.status(401).send(errorResponses.noPermission());
    }

    return done();
  };
}

function loggedIn(
  req: FastifyRequest,
  res: FastifyReply,
  done: HookHandlerDoneFunction
): FastifyReply | void {
  const authHeader = req.headers.authorization;

  if (authHeader === undefined) {
    return res.status(403).send(errorResponses.accessTokenRequired());
  }

  const splitted = authHeader.split(" ");
  const bearer = splitted.at(0);
  const accessToken = splitted.at(1);

  if (bearer !== "Bearer" || accessToken === undefined) {
    return res.status(403).send(errorResponses.accessTokenInvalid());
  }

  const user = verfiyToken(accessToken);

  if (user === undefined) {
    return res.status(403).send(errorResponses.accessTokenInvalid());
  }

  req.user = user;

  return done();
}

export default { guard, loggedIn };
