const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.vamhkvjoznxlbssdoqlq:XyzAiSecure202@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database!");

    console.log("Querying auth.users...");
    const resAuth = await client.query("SELECT id, email, created_at, confirmed_at FROM auth.users ORDER BY created_at DESC LIMIT 5");
    console.log("auth.users results:", resAuth.rows);

    console.log("Querying public.users...");
    const resPublic = await client.query("SELECT id, email, name, plan, created_at FROM public.users ORDER BY created_at DESC LIMIT 5");
    console.log("public.users results:", resPublic.rows);

  } catch (error) {
    console.error("DB Query Failed:", error);
  } finally {
    await client.end();
  }
}

main();
