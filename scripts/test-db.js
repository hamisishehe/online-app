/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");
const { Client } = require("pg");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();
  const result = await client.query("select current_database() as db");
  const tables = await client.query(
    `select
      to_regclass('public."User"') as user_pascal_table,
      to_regclass('public.users') as users_table,
      to_regclass('public."Application"') as application_table,
      to_regclass('public.site_settings') as site_settings_table,
      to_regclass('public.courses') as courses_table`
  );
  await client.end();

  console.log("DB connection OK:", result.rows[0]?.db);
  console.log("User table (\"User\"):", tables.rows[0]?.user_pascal_table || "MISSING");
  console.log("User table (users):", tables.rows[0]?.users_table || "MISSING");
  console.log("Application table:", tables.rows[0]?.application_table || "MISSING");
  console.log("SiteSettings table:", tables.rows[0]?.site_settings_table || "MISSING");
  console.log("Courses table:", tables.rows[0]?.courses_table || "MISSING");
}

main().catch((err) => {
  console.error("DB connection failed:");
  console.error(err.message || err);
  process.exit(1);
});
