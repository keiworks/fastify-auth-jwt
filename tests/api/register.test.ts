import { expect, it } from "vitest";

import { verfiyToken } from "../../src/jwt.js";
import { buildSampleApp } from "../app.js";
import { prisma } from "../db.js";

const app = buildSampleApp(prisma);

it.concurrent(
  "should return an error when the username already exist",
  async () => {
    const response = await app.inject({
      url: "/api/auth/register",
      payload: {
        username: "admin",
        password: "12345",
        passwordConfirm: "12345",
      },
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const body = await response.json();

    expect(response.statusCode).toStrictEqual(422);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body.errors.at(0)).toStrictEqual({
      key: "server.validation.username_already_exist",
      name: "username",
    });
  }
);

it.concurrent(
  "should return an error when the username fails to reach the minimum length requirement",
  async () => {
    const response = await app.inject({
      url: "/api/auth/register",
      payload: {
        username: "us",
        password: "12345",
        passwordConfirm: "12345",
      },
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const body = await response.json();

    expect(response.statusCode).toStrictEqual(422);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body.errors.at(0)).toStrictEqual({
      key: "server.validation.min",
      name: "username",
      value: "3",
    });
  }
);

it.concurrent(
  "should return an error when the username exceeded the maximum length requirement",
  async () => {
    const response = await app.inject({
      url: "/api/auth/register",
      payload: {
        username: "username_exceeded_the_max_length_requirement",
        password: "12345",
        passwordConfirm: "12345",
      },
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const body = await response.json();

    expect(response.statusCode).toStrictEqual(422);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body.errors.at(0)).toStrictEqual({
      key: "server.validation.max",
      name: "username",
      value: "16",
    });
  }
);

it.concurrent(
  "should return an error when the password fails to reach the minimum length requirement",
  async () => {
    const response = await app.inject({
      url: "/api/auth/register",
      payload: JSON.stringify({
        username: "username",
        password: "1234",
        passwordConfirm: "1234",
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const body = await response.json();

    expect(response.statusCode).toStrictEqual(422);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body.errors.at(0)).toStrictEqual({
      key: "server.validation.min",
      name: "password",
      value: "5",
    });
  }
);

it.concurrent(
  "should return an error when the password exceeded the maximum length requirement",
  async () => {
    const response = await app.inject({
      url: "/api/auth/register",
      payload: JSON.stringify({
        username: "username",
        password: "12345678901234567890123456789012345678901234567890",
        passwordConfirm: "12345678901234567890123456789012345678901234567890",
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const body = await response.json();

    expect(response.statusCode).toStrictEqual(422);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body.errors.at(0)).toStrictEqual({
      key: "server.validation.max",
      name: "password",
      value: "48",
    });
  }
);

it.concurrent(
  "should return an error when the password is not the same as the password confirm",
  async () => {
    const response = await app.inject({
      url: "/api/auth/register",
      payload: JSON.stringify({
        username: "username",
        password: "12345_different",
        passwordConfirm: "12345_password",
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const body = await response.json();

    expect(response.statusCode).toStrictEqual(422);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(body.errors.at(0)).toStrictEqual({
      key: "server.validation.password_confirm_not_matched",
      name: "passwordConfirm",
    });
  }
);

it.concurrent(
  "should register the user & return the access token & refresh token",
  async () => {
    const response = await app.inject({
      url: "/api/auth/register",
      payload: JSON.stringify({
        username: "username",
        password: "12345678",
        passwordConfirm: "12345678",
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const body = await response.json();

    const user = verfiyToken(body.data.accessToken);

    expect(response.statusCode).toStrictEqual(200);
    expect(response.headers["content-type"]).toMatch("application/json");
    expect(user?.role).toStrictEqual("regular");
    expect(body).not.toHaveProperty("errors");
    expect(body.data).toHaveProperty("accessToken");
    expect(body.data).toHaveProperty("refreshToken");
  }
);
