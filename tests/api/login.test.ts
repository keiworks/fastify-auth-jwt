import { expect, it } from "vitest";

import { buildSampleApp } from "../app.js";
import { prisma } from "../db.js";

const app = buildSampleApp(prisma);

it.concurrent(
  "should return a 403 error when the username is wrong",
  async () => {
    const startMs = Date.now();

    const response = await app.inject({
      url: "/api/auth/login",
      payload: { username: "admin1", password: "12345678" },
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const endMs = Date.now();
    const ms = endMs - startMs;
    const seconds = Math.floor(ms / 1000);
    const body = await response.json();

    expect(seconds).toBeGreaterThanOrEqual(2);
    expect(response.statusCode).toStrictEqual(403);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body).not.toHaveProperty("data");
    expect(body).toStrictEqual({
      errors: [
        { key: "server.validation.invalid_login", name: "username" },
        { key: "server.validation.invalid_login", name: "password" },
      ],
    });
  }
);

it.concurrent(
  "should return a 403 error when the password is wrong",
  async () => {
    const startMs = Date.now();

    const response = await app.inject({
      url: "/api/auth/login",
      payload: { username: "admin", password: "wrong_password" },
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const endMs = Date.now();
    const ms = endMs - startMs;
    const seconds = Math.floor(ms / 1000);
    const body = await response.json();

    expect(seconds).toBeGreaterThanOrEqual(2);
    expect(response.statusCode).toStrictEqual(403);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body).not.toHaveProperty("data");
    expect(body).toStrictEqual({
      errors: [
        { key: "server.validation.invalid_login", name: "username" },
        { key: "server.validation.invalid_login", name: "password" },
      ],
    });
  }
);

it.concurrent(
  "should login the user & return the access token & refresh token",
  async () => {
    const startMs = Date.now();

    const response = await app.inject({
      url: "/api/auth/login",
      payload: JSON.stringify({ username: "admin", password: "12345678" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const endMs = Date.now();
    const ms = endMs - startMs;
    const seconds = Math.floor(ms / 1000);
    const body = await response.json();

    expect(seconds).toBeGreaterThanOrEqual(2);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body).not.toHaveProperty("errors");
    expect(body.data).toHaveProperty("accessToken");
    expect(body.data).toHaveProperty("refreshToken");
  }
);
