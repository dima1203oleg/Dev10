import type { NextFunction, Response } from 'express';
import { drizzle } from 'drizzle-orm/node-postgres';
import { createPool, runWithRequestDatabase } from '../db/index.ts';
import * as schema from '../db/schema.ts';
import type { AuthRequest } from './auth.ts';

export async function beginTenantRequest(req: AuthRequest, res: Response, next: NextFunction) {
  const identity = req.user;
  if (!identity?.uid || !identity.email) {
    return res.status(401).json({
      error: { code: 'AUTH_IDENTITY_INCOMPLETE', message: 'Authenticated identity is incomplete.' },
      requestId: req.requestId,
    });
  }

  const client = await createPool().connect();
  let completed = false;
  const finish = async (commit: boolean) => {
    if (completed) return;
    completed = true;
    try {
      await client.query(commit ? 'COMMIT' : 'ROLLBACK');
      if (commit) {
        for (const callback of req.afterCommit || []) callback();
      }
    } catch (error) {
      console.error('Tenant transaction finalization failed', error);
    } finally {
      client.release();
    }
  };

  try {
    await client.query('BEGIN');
    const provisioned = await client.query<{ user_id: number; org_id: number }>(
      'SELECT user_id, org_id FROM tenderai_provision_identity($1, $2)',
      [identity.uid, identity.email],
    );
    const context = provisioned.rows[0];
    if (!context) throw new Error('Tenant provisioning returned no context');

    await client.query("SELECT set_config('app.current_user_id', $1, true)", [String(context.user_id)]);
    await client.query("SELECT set_config('app.current_org_id', $1, true)", [String(context.org_id)]);
    req.dbUserId = context.user_id;
    req.orgId = context.org_id;
    req.afterCommit = [];

    const requestDb = drizzle(client, { schema }) as unknown as Parameters<typeof runWithRequestDatabase>[0];
    res.once('finish', () => void finish(res.statusCode < 500));
    res.once('close', () => void finish(false));
    return runWithRequestDatabase(requestDb, next);
  } catch (error) {
    await finish(false);
    return next(error);
  }
}
