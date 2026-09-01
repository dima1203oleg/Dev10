import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';
import { AsyncLocalStorage } from 'node:async_hooks';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

declare global {
  var _postgresPool: pg.Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL?.trim();
    global._postgresPool = new Pool(connectionString ? {
      connectionString,
      max: 10,
      connectionTimeoutMillis: 15000,
    } : {
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

let adminPool: pg.Pool | undefined;
export const createAdminPool = () => {
  if (!adminPool) {
    const connectionString = process.env.DATABASE_ADMIN_URL?.trim() || process.env.DATABASE_URL?.trim();
    adminPool = new Pool(connectionString ? {
      connectionString,
      max: 2,
      connectionTimeoutMillis: 15000,
    } : {
      host: process.env.SQL_HOST,
      user: process.env.SQL_ADMIN_USER || process.env.SQL_USER,
      password: process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 2,
      connectionTimeoutMillis: 15000,
    });
  }
  return adminPool;
};

const pool = createPool();
const baseDb = drizzle(pool, { schema });

type Database = typeof baseDb;
const requestDatabase = new AsyncLocalStorage<{ db: Database }>();

// Existing route code imports `db`. The proxy makes those queries use the
// request's dedicated transaction when tenant middleware is active, while
// startup/health/migration code continues to use the base pool explicitly.
export const db = new Proxy(baseDb, {
  get(target, property, receiver) {
    const scoped = requestDatabase.getStore()?.db;
    const source = scoped || target;
    const value = Reflect.get(source, property, receiver);
    return typeof value === 'function' ? value.bind(source) : value;
  },
}) as Database;

export function runWithRequestDatabase<T>(database: Database, callback: () => T): T {
  return requestDatabase.run({ db: database }, callback);
}
