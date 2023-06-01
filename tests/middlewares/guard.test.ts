import { expect, it } from "vitest";

import { buildSampleApp } from "../app.js";
import { prisma } from "../db.js";

const app = buildSampleApp(prisma);

it.concurrent(
  "should return 403 when the user doesn't have the admin role",
  async () => {
    const responseRegister = await app.inject({
      url: "/api/auth/register",
      payload: {
        username: "sampleUser",
        password: "12345678",
        passwordConfirm: "12345678",
      },
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const bodyRegister = await responseRegister.json();
    const accessToken = bodyRegister.data.accessToken;

    const response = await app.inject({
      url: "/api/posts-guarded",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      method: "GET",
    });

    const body = await response.json();

    expect(response.statusCode).toStrictEqual(401);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body.errors.at(0)).toStrictEqual({
      key: "server.validation.no_permission",
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
    url: "/api/posts-guarded",
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
