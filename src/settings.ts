import argon2 from "argon2";

type DefaultSettings = {
  argon2: {
    hashLength: number;
    memoryCost: number;
    type: 0 | 1 | 2;
  };
  register: {
    usernameMinLength: number;
    usernameMaxLength: number;
    passwordMinLength: number;
    passwordMaxLength: number;
    roleName: string;
  };
  response: {
    errorKey: string;
  };
  token: {
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
};

const settings: DefaultSettings = {
  argon2: {
    hashLength: 64,
    memoryCost: 2 ** 16,
    type: argon2.argon2id,
  },
  register: {
    usernameMinLength: 3,
    usernameMaxLength: 16,
    passwordMinLength: 5,
    passwordMaxLength: 64,
    roleName: "regular",
  },
  response: {
    errorKey: "server.validation",
  },
  token: {
    accessExpiresIn: "20m",
    refreshExpiresIn: "30d",
  },
};

export { settings };

export type { DefaultSettings };
