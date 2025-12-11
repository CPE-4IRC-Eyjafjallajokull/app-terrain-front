import "server-only";

type ServerEnv = {
  API_URL: string;
  KEYCLOAK_ISSUER: string;
  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_CLIENT_SECRET: string;
  AUTH_SECRET: string;
};

// Avoid failing Docker/CI builds that do not inject runtime secrets; still enforce at runtime.
const isBuildTime = () =>
  process.env["npm_lifecycle_event"] === "build" ||
  process.env["NEXT_PHASE"] === "phase-production-build";

const requiredServerEnv = (key: keyof ServerEnv) => {
  const value = process.env[key];

  if (!value) {
    if (isBuildTime()) {
      return `__MISSING_${key}__`;
    }

    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const serverEnv: ServerEnv = {
  API_URL: requiredServerEnv("API_URL"),
  KEYCLOAK_ISSUER: requiredServerEnv("KEYCLOAK_ISSUER"),
  KEYCLOAK_CLIENT_ID: requiredServerEnv("KEYCLOAK_CLIENT_ID"),
  KEYCLOAK_CLIENT_SECRET: requiredServerEnv("KEYCLOAK_CLIENT_SECRET"),
  AUTH_SECRET: requiredServerEnv("AUTH_SECRET"),
};
