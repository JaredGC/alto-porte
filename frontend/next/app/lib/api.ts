const getApiRoot = (value: string | undefined, variableName: string) => {
  if (!value) {
    throw new Error(`${variableName} no esta configurada.`);
  }

  return value.replace(/\/+$/, "");
};

const joinApiPath = (apiRoot: string, path: string) =>
  `${apiRoot}/${path.replace(/^\/+/, "")}`;

export const getPublicApiUrl = (path: string) =>
  joinApiPath(
    getApiRoot(process.env.NEXT_PUBLIC_API, "NEXT_PUBLIC_API"),
    path,
  );
