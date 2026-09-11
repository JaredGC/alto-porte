const defaultAllowedOrigins = [
  "http://localhost:3000",
];

const extraAllowedOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const allowedOrigins = Array.from(
  new Set([...defaultAllowedOrigins, ...extraAllowedOrigins]),
);
