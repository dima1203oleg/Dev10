import type { PoolClient } from 'pg';
import { createAdminPool } from './index.ts';

type Migration = { id: string; statements: string[] };

const tenantTables = [
  'organizations',
  'team_members',
  'team_tasks',
  'team_comments',
  'audit_logs',
  'company_profiles',
  'tenders',
  'tender_documents',
  'favorites',
  'complaints',
  'search_sessions',
  'jobs',
  'requirements',
  'boq_items',
  'gantt_tasks',
  'bid_packages',
  'analysis_results',
] as const;

const policyStatements = tenantTables.flatMap((table) => [
  `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS ${table}_tenant_isolation ON ${table}`,
  table === 'organizations'
    ? `CREATE POLICY ${table}_tenant_isolation ON ${table} USING (id = NULLIF(current_setting('app.current_org_id', true), '')::integer) WITH CHECK (id = NULLIF(current_setting('app.current_org_id', true), '')::integer)`
    : `CREATE POLICY ${table}_tenant_isolation ON ${table} USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::integer) WITH CHECK (org_id = NULLIF(current_setting('app.current_org_id', true), '')::integer)`,
]);

export const migrations: Migration[] = [
  {
    id: '0001_core_tenant_schema',
    statements: [
      `CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, uid TEXT NOT NULL UNIQUE, email TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS organizations (id SERIAL PRIMARY KEY, name TEXT NOT NULL, edrpou TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS team_members (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), org_id INTEGER NOT NULL REFERENCES organizations(id), display_name TEXT, email TEXT, role TEXT NOT NULL DEFAULT 'MEMBER', role_name_uk TEXT, avatar TEXT, status TEXT NOT NULL DEFAULT 'OFFLINE', joined_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE UNIQUE INDEX IF NOT EXISTS team_members_org_user_idx ON team_members(org_id, user_id)`,
      `CREATE TABLE IF NOT EXISTS company_profiles (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), org_id INTEGER REFERENCES organizations(id), name TEXT NOT NULL, edrpou TEXT NOT NULL, legal_address TEXT, director_name TEXT, email TEXT, phone TEXT, vault_data JSONB, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS tenders (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), org_id INTEGER REFERENCES organizations(id), tender_number TEXT NOT NULL, title TEXT NOT NULL, customer TEXT, budget_uah TEXT, status TEXT, foul_score INTEGER, risk_level TEXT, summary TEXT, detailed_data JSONB, source_id TEXT, source_url TEXT, source_fetched_at TIMESTAMPTZ, source_hash TEXT, freshness_status TEXT NOT NULL DEFAULT 'UNKNOWN', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS tender_documents (id TEXT PRIMARY KEY, tender_id INTEGER REFERENCES tenders(id), name TEXT NOT NULL, type TEXT NOT NULL, status TEXT NOT NULL, size INTEGER, storage_key TEXT, content_hash TEXT, uploaded_at TIMESTAMPTZ DEFAULT NOW(), extracted_data JSONB, mime_type TEXT, is_vault BOOLEAN DEFAULT FALSE, user_id INTEGER REFERENCES users(id), org_id INTEGER REFERENCES organizations(id))`,
      `CREATE TABLE IF NOT EXISTS team_tasks (id SERIAL PRIMARY KEY, org_id INTEGER NOT NULL REFERENCES organizations(id), tender_id INTEGER REFERENCES tenders(id), title TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'TODO', priority TEXT NOT NULL DEFAULT 'MEDIUM', assignee_id INTEGER REFERENCES team_members(id), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS team_comments (id SERIAL PRIMARY KEY, org_id INTEGER NOT NULL REFERENCES organizations(id), task_id INTEGER REFERENCES team_tasks(id), author_id INTEGER NOT NULL REFERENCES users(id), content TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS audit_logs (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), org_id INTEGER REFERENCES organizations(id), action TEXT NOT NULL, entity_type TEXT, entity_id TEXT, details JSONB, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS favorites (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), org_id INTEGER REFERENCES organizations(id), tender_id INTEGER NOT NULL REFERENCES tenders(id), created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE UNIQUE INDEX IF NOT EXISTS favorites_org_tender_idx ON favorites(org_id, tender_id)`,
      `CREATE TABLE IF NOT EXISTS complaints (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), org_id INTEGER REFERENCES organizations(id), tender_id INTEGER NOT NULL REFERENCES tenders(id), content TEXT NOT NULL, status TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS search_sessions (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), org_id INTEGER REFERENCES organizations(id), raw_query TEXT NOT NULL, structured_query JSONB NOT NULL, source TEXT DEFAULT 'Prozorro', source_cursor TEXT, pages_scanned INTEGER DEFAULT 0, records_scanned INTEGER DEFAULT 0, records_matched INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), expires_at TIMESTAMPTZ, status TEXT DEFAULT 'active')`,
    ],
  },
  {
    id: '0002_production_domain_and_rls',
    statements: [
      `ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id)`,
      `ALTER TABLE tenders ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id)`,
      `ALTER TABLE favorites ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id)`,
      `ALTER TABLE complaints ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id)`,
      `ALTER TABLE search_sessions ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id)`,
      `ALTER TABLE tenders ADD COLUMN IF NOT EXISTS source_id TEXT`,
      `ALTER TABLE tenders ADD COLUMN IF NOT EXISTS source_url TEXT`,
      `ALTER TABLE tenders ADD COLUMN IF NOT EXISTS source_fetched_at TIMESTAMPTZ`,
      `ALTER TABLE tenders ADD COLUMN IF NOT EXISTS source_hash TEXT`,
      `ALTER TABLE tenders ADD COLUMN IF NOT EXISTS freshness_status TEXT NOT NULL DEFAULT 'UNKNOWN'`,
      `CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, org_id INTEGER NOT NULL REFERENCES organizations(id), user_id INTEGER NOT NULL REFERENCES users(id), kind TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'QUEUED', progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100), input JSONB NOT NULL DEFAULT '{}'::jsonb, result JSONB, error_code TEXT, error_message TEXT, provenance JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ DEFAULT NOW(), started_at TIMESTAMPTZ, finished_at TIMESTAMPTZ)`,
      `CREATE TABLE IF NOT EXISTS requirements (id TEXT PRIMARY KEY, org_id INTEGER NOT NULL REFERENCES organizations(id), tender_id INTEGER NOT NULL REFERENCES tenders(id), document_id TEXT NOT NULL REFERENCES tender_documents(id), document_hash TEXT NOT NULL, source_text TEXT NOT NULL, page_number INTEGER NOT NULL CHECK (page_number > 0), section TEXT, bbox JSONB NOT NULL, confidence DOUBLE PRECISION NOT NULL CHECK (confidence BETWEEN 0 AND 1), status TEXT NOT NULL DEFAULT 'UNKNOWN', evidence JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS boq_items (id TEXT PRIMARY KEY, org_id INTEGER NOT NULL REFERENCES organizations(id), tender_id INTEGER NOT NULL REFERENCES tenders(id), code TEXT, name TEXT NOT NULL, unit TEXT NOT NULL, quantity DOUBLE PRECISION NOT NULL CHECK (quantity >= 0), unit_price_uah DOUBLE PRECISION CHECK (unit_price_uah >= 0), source_document_id TEXT REFERENCES tender_documents(id), source_page INTEGER, source_bbox JSONB, updated_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS gantt_tasks (id TEXT PRIMARY KEY, org_id INTEGER NOT NULL REFERENCES organizations(id), tender_id INTEGER NOT NULL REFERENCES tenders(id), title TEXT NOT NULL, starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL, status TEXT NOT NULL DEFAULT 'TODO', critical BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), CHECK (ends_at >= starts_at))`,
      `CREATE TABLE IF NOT EXISTS bid_packages (id TEXT PRIMARY KEY, org_id INTEGER NOT NULL REFERENCES organizations(id), tender_id INTEGER NOT NULL REFERENCES tenders(id), status TEXT NOT NULL DEFAULT 'DRAFT', storage_key TEXT, content_hash TEXT, manifest JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS analysis_results (id TEXT PRIMARY KEY, org_id INTEGER NOT NULL REFERENCES organizations(id), tender_id INTEGER NOT NULL REFERENCES tenders(id), kind TEXT NOT NULL, algorithm_version TEXT NOT NULL, result JSONB NOT NULL, provenance JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE UNIQUE INDEX IF NOT EXISTS analysis_results_tender_kind_version_idx ON analysis_results(org_id, tender_id, kind, algorithm_version)`,
      `INSERT INTO organizations(name) SELECT 'Організація користувача ' || u.id FROM users u WHERE NOT EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = u.id)`,
      `INSERT INTO team_members(user_id, org_id, role) SELECT u.id, o.id, 'ADMIN' FROM users u JOIN organizations o ON o.name = 'Організація користувача ' || u.id WHERE NOT EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = u.id)`,
      `UPDATE company_profiles p SET org_id = tm.org_id FROM team_members tm WHERE p.user_id = tm.user_id AND p.org_id IS NULL`,
      `UPDATE tenders t SET org_id = tm.org_id FROM team_members tm WHERE t.user_id = tm.user_id AND t.org_id IS NULL`,
      `UPDATE favorites f SET org_id = tm.org_id FROM team_members tm WHERE f.user_id = tm.user_id AND f.org_id IS NULL`,
      `UPDATE complaints c SET org_id = tm.org_id FROM team_members tm WHERE c.user_id = tm.user_id AND c.org_id IS NULL`,
      `UPDATE search_sessions s SET org_id = tm.org_id FROM team_members tm WHERE s.user_id = tm.user_id AND s.org_id IS NULL`,
      `ALTER TABLE company_profiles ALTER COLUMN org_id SET NOT NULL`,
      `ALTER TABLE tenders ALTER COLUMN org_id SET NOT NULL`,
      `ALTER TABLE favorites ALTER COLUMN org_id SET NOT NULL`,
      `ALTER TABLE complaints ALTER COLUMN org_id SET NOT NULL`,
      `ALTER TABLE search_sessions ALTER COLUMN org_id SET NOT NULL`,
      `CREATE OR REPLACE FUNCTION tenderai_provision_identity(p_uid TEXT, p_email TEXT) RETURNS TABLE(user_id INTEGER, org_id INTEGER) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ DECLARE v_user_id INTEGER; v_org_id INTEGER; BEGIN INSERT INTO users(uid, email) VALUES (p_uid, p_email) ON CONFLICT (uid) DO UPDATE SET email = EXCLUDED.email RETURNING id INTO v_user_id; SELECT tm.org_id INTO v_org_id FROM team_members tm WHERE tm.user_id = v_user_id ORDER BY CASE WHEN tm.role = 'ADMIN' THEN 0 ELSE 1 END, tm.id LIMIT 1; IF v_org_id IS NULL THEN INSERT INTO organizations(name) VALUES ('Організація користувача ' || v_user_id) RETURNING id INTO v_org_id; INSERT INTO team_members(user_id, org_id, email, role) VALUES (v_user_id, v_org_id, p_email, 'ADMIN'); END IF; RETURN QUERY SELECT v_user_id, v_org_id; END; $$`,
      ...policyStatements,
    ],
  },
];

async function runMigration(client: PoolClient, migration: Migration) {
  const applied = await client.query('SELECT 1 FROM tenderai_migrations WHERE id = $1', [migration.id]);
  if (applied.rowCount) return;
  for (const statement of migration.statements) await client.query(statement);
  await client.query('INSERT INTO tenderai_migrations(id) VALUES ($1)', [migration.id]);
}

export async function runMigrations() {
  const client = await createAdminPool().connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('tenderai:migrations'))");
    await client.query('CREATE TABLE IF NOT EXISTS tenderai_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    for (const migration of migrations) await runMigration(client, migration);
    const appRole = process.env.SQL_USER;
    if (!appRole || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(appRole)) throw new Error('SQL_USER is not a valid PostgreSQL role name');
    const quotedRole = `"${appRole}"`;
    await client.query(`GRANT USAGE ON SCHEMA public TO ${quotedRole}`);
    await client.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${quotedRole}`);
    await client.query(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${quotedRole}`);
    await client.query(`GRANT EXECUTE ON FUNCTION tenderai_provision_identity(TEXT, TEXT) TO ${quotedRole}`);
    await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${quotedRole}`);
    await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${quotedRole}`);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
