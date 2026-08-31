import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();
const enabled = process.env.RUN_DB_INTEGRATION_TESTS === 'true';
const suite = enabled ? describe : describe.skip;
const pool = new pg.Pool({ host: process.env.SQL_HOST, user: process.env.SQL_USER, password: process.env.SQL_PASSWORD, database: process.env.SQL_DB_NAME, max: 1 });

suite('PostgreSQL tenant RLS', () => {
  let client: pg.PoolClient;
  beforeAll(async () => { client = await pool.connect(); await client.query('BEGIN'); });
  afterAll(async () => { if (client) { await client.query('ROLLBACK'); client.release(); } await pool.end(); });

  it('prevents a second tenant from reading the first tenant tender', async () => {
    const a = (await client.query("SELECT * FROM tenderai_provision_identity('vitest-a', 'a@example.invalid')")).rows[0];
    await client.query("SELECT set_config('app.current_user_id', $1, true), set_config('app.current_org_id', $2, true)", [String(a.user_id), String(a.org_id)]);
    await client.query("INSERT INTO tenders(user_id, org_id, tender_number, title) VALUES ($1, $2, 'RLS-VITEST', 'RLS verification')", [a.user_id, a.org_id]);
    expect((await client.query("SELECT count(*)::int AS count FROM tenders WHERE tender_number='RLS-VITEST'")).rows[0].count).toBe(1);

    const b = (await client.query("SELECT * FROM tenderai_provision_identity('vitest-b', 'b@example.invalid')")).rows[0];
    await client.query("SELECT set_config('app.current_user_id', $1, true), set_config('app.current_org_id', $2, true)", [String(b.user_id), String(b.org_id)]);
    expect((await client.query("SELECT count(*)::int AS count FROM tenders WHERE tender_number='RLS-VITEST'")).rows[0].count).toBe(0);
  });
});
