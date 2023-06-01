import type { TemplateResponse } from "@keiworks/js-utilities/types";

import { settings } from "./settings.js";

type ErrorResponses = {
  accessTokenInvalid: () => TemplateResponse;
  accessTokenRequired: () => TemplateResponse;
  loginError: () => TemplateResponse;
  noPermission: () => TemplateResponse;
  refreshTokenInvalid: () => TemplateResponse;
  serverError: (error: unknown) => TemplateResponse;
  usernameAlreadyExist: () => TemplateResponse;
};

const errorResponses: ErrorResponses = {
  accessTokenInvalid: () => {
    return {
      errors: [{ key: `${settings.response.errorKey}.access_token_invalid` }],
    };
  },
  accessTokenRequired: () => {
    return {
      errors: [{ key: `${settings.response.errorKey}.access_token_required` }],
    };
  },
  loginError: () => {
    return {
      errors: [
        {
          key: `${settings.response.errorKey}.invalid_login`,
          name: "username",
        },
        {
          key: `${settings.response.errorKey}.invalid_login`,
          name: "password",
        },
      ],
    };
  },
  noPermission: () => {
    return { errors: [{ key: `${settings.response.errorKey}.no_permission` }] };
  },
  refreshTokenInvalid: () => {
    return {
      errors: [{ key: `${settings.response.errorKey}.refresh_token_invalid` }],
    };
  },
  serverError: () => {
    return { errors: [{ key: "server.500" }] };
  },
  usernameAlreadyExist: () => {
    return {
      errors: [
        {
          key: `${settings.response.errorKey}.username_already_exist`,
          name: "username",
        },
      ],
    };
  },
};

export { errorResponses };

export type { ErrorResponses };
