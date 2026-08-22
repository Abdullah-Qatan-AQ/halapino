export const ENV = {
  port: process.env.PORT || "3000",
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  tmdbApiKey: process.env.TMDB_API_KEY || "",
  cookieSecret: process.env.COOKIE_SECRET || "default_secret",
  ...process.env,
};

export const env = ENV;
export default ENV;
