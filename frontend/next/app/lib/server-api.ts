import "server-only";

import { getUserData } from "./session";

const getApiRoot = () => {
  const apiRoot = process.env.NEXT_PUBLIC_API ?? process.env.NEXT_PRIVATE_API;

  if (!apiRoot) {
    throw new Error(
      "NEXT_PUBLIC_API o NEXT_PRIVATE_API debe estar configurada.",
    );
  }

  return apiRoot.replace(/\/+$/, "");
};

export const getPrivateApiUrl = (path: string) =>
  `${getApiRoot()}/${path.replace(/^\/+/, "")}`;

export const getPrivateApiAuthHeaders = async (
  headers: Record<string, string> = {},
) => {
  const user = await getUserData();
  const accessToken = user?.userAccessToken;

  if (!accessToken) {
    return headers;
  }

  return {
    ...headers,
    authorization: `Bearer ${accessToken}`,
  };
};
