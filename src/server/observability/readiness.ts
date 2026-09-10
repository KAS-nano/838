export type RuntimeFlags = Record<string, string | undefined>;

export function requiredDependencies(env: RuntimeFlags) {
  return { databaseRequired: env.CATALOG_SOURCE === "database" || env.AUTH_ENABLED === "true" || env.COMMUNITY_BENCHMARKS_ENABLED === "true" };
}
