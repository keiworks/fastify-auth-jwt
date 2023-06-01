import { beforeAll, expect, it } from "vitest";

import { buildSampleApp } from "../app.js";
import { prisma } from "../db.js";

const app = buildSampleApp(prisma);

let setupRefreshToken = "";

beforeAll(async () => {
  const response = await app.inject({
    url: "/api/auth/login",
    payload: { username: "admin", password: "12345678" },
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  const body = await response.json();

  setupRefreshToken = body.data.refreshToken;
});

it.concurrent(
  "should not refresh the access token when an invalid refresh token is given",
  async () => {
    const response = await app.inject({
      url: "/api/auth/refresh",
      payload: { refreshToken: "wrong_token" },
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const body = await response.json();

    expect(response.statusCode).toStrictEqual(403);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body.errors.at(0)).toStrictEqual({
      key: "server.validation.refresh_token_invalid",
    });
  }
);

it.concurrent(
  "should refresh the access token when a valid refresh token is given",
  async () => {
    const response = await app.inject({
      url: "/api/auth/refresh",
      payload: { refreshToken: setupRefreshToken },
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const body = await response.json();

    expect(response.statusCode).toStrictEqual(200);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body.data).toHaveProperty("accessToken");
  }
);
