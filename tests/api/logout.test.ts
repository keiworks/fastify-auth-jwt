import { beforeAll, expect, it } from "vitest";

import { buildSampleApp } from "../app.js";
import { prisma } from "../db.js";

const app = buildSampleApp(prisma);

let setupAccessToken = "";
let setupRefreshToken = "";

beforeAll(async () => {
  const response = await app.inject({
    url: "/api/auth/login",
    payload: JSON.stringify({ username: "admin", password: "12345678" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  const body = await response.json();

  setupAccessToken = body.data.accessToken;
  setupRefreshToken = body.data.refreshToken;
});

it.concurrent(
  "should return a 403 error when the authorization header is missing",
  async () => {
    const response = await app.inject({
      url: "/api/auth/logout",
      payload: { refreshToken: setupRefreshToken },
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const body = await response.json();

    expect(response.statusCode).toStrictEqual(403);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body.errors.at(0)).toStrictEqual({
      key: "server.validation.access_token_required",
    });
  }
);

it.concurrent(
  "should return a 422 error when the refresh token is missing",
  async () => {
    const response = await app.inject({
      url: "/api/auth/logout",
      payload: { unrelatedKey: "random" },
      headers: {
        authorization: `Bearer ${setupAccessToken}`,
        "content-type": "application/json",
      },
      method: "POST",
    });

    const body = await response.json();

    expect(response.statusCode).toStrictEqual(422);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body.errors.at(0)).toStrictEqual({
      key: "server.validation.expected_string",
      name: "refreshToken",
    });
  }
);

it.concurrent(
  "should return a 200 status code when successfully logging out",
  async () => {
    const response = await app.inject({
      url: "/api/auth/logout",
      payload: { refreshToken: setupRefreshToken },
      headers: {
        authorization: `Bearer ${setupAccessToken}`,
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.statusCode).toStrictEqual(200);
    expect(response.headers["content-type"]).toStrictEqual(undefined);
  }
);
