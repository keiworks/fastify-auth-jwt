import { expect, it } from "vitest";

import { buildSampleApp } from "../app.js";
import { prisma } from "../db.js";

const app = buildSampleApp(prisma);

it.concurrent(
  "should return 403 when the user doesn't have the access token",
  async () => {
    const response = await app.inject({
      url: "/api/posts",
      headers: { "content-type": "application/json" },
      method: "GET",
    });

    const body = await response.json();

    expect(response.statusCode).toStrictEqual(403);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body.errors.at(0)).toStrictEqual({
      key: "server.validation.access_token_required",
    });
  }
);

it.concurrent("should return the list of posts", async () => {
  const responseLogin = await app.inject({
    url: "/api/auth/login",
    payload: { username: "admin", password: "12345678" },
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  const bodyLogin = await responseLogin.json();
  const accessToken = bodyLogin.data.accessToken;

  const response = await app.inject({
    url: "/api/posts",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    method: "GET",
  });

  const body = await response.json();

  expect(response.statusCode).toStrictEqual(200);
  expect(response.headers["content-type"]).toMatch("application/json");
  expect(body).not.toHaveProperty("errors");
  expect(body).toStrictEqual({
    data: [
      { id: 1, title: "test 1" },
      { id: 2, title: "test 2" },
    ],
  });
});
