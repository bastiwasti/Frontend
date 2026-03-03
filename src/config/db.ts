export const DB_CONFIG = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'vmpostgres',
  user: process.env.PG_USER || 'jobsearch',
  password: process.env.PG_PASSWORD || 'jobsearch',
  schema: process.env.PG_SCHEMA || 'webscraper',
};
