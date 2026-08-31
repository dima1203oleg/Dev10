import { Readable } from 'node:stream';
import { drizzle } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import { createPool } from '../db/index.ts';
import * as schema from '../db/schema.ts';
import { LocalStorageProvider } from '../lib/storage.ts';

const storage = new LocalStorageProvider('uploads');

async function streamToBuffer(stream: Readable) {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export interface DocumentJobContext {
  jobId: string;
  orgId: number;
  userId: number;
  tenderId: number;
  documentId: string;
}

export function dispatchDocumentJob(context: DocumentJobContext) {
  setImmediate(() => {
    void processDocumentJob(context).catch((error) => {
      console.error('Document job crashed', { jobId: context.jobId, error });
    });
  });
}

async function processDocumentJob(context: DocumentJobContext) {
  const client = await createPool().connect();
  const scopedDb = drizzle(client, { schema });
  let document: typeof schema.tenderDocuments.$inferSelect | undefined;
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.current_user_id', $1, true)", [String(context.userId)]);
    await client.query("SELECT set_config('app.current_org_id', $1, true)", [String(context.orgId)]);
    await scopedDb.update(schema.jobs).set({ status: 'RUNNING', progress: 10, startedAt: new Date() })
      .where(and(eq(schema.jobs.id, context.jobId), eq(schema.jobs.orgId, context.orgId)));
    await scopedDb.update(schema.tenderDocuments).set({ status: 'PROCESSING' })
      .where(and(eq(schema.tenderDocuments.id, context.documentId), eq(schema.tenderDocuments.orgId, context.orgId)));
    [document] = await scopedDb.select().from(schema.tenderDocuments).where(and(
      eq(schema.tenderDocuments.id, context.documentId),
      eq(schema.tenderDocuments.orgId, context.orgId),
    ));
    await client.query('COMMIT');
    if (!document?.storageKey) throw new Error('DOCUMENT_CONTENT_MISSING');

    const doclingUrl = process.env.DOCLING_URL?.replace(/\/$/, '');
    if (!doclingUrl) throw new Error('DOCLING_UNAVAILABLE');
    const buffer = await streamToBuffer(await storage.download(document.storageKey));
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: document.mimeType || 'application/octet-stream' }), document.name);
    form.append('include_bbox', 'true');
    const response = await fetch(`${doclingUrl}/v1/parse`, { method: 'POST', body: form });
    if (!response.ok) throw new Error(`DOCLING_HTTP_${response.status}`);
    const parsed = await response.json() as { pages?: unknown[]; markdown?: string; blocks?: unknown[] };
    if (!Array.isArray(parsed.pages) || parsed.pages.length === 0) throw new Error('DOCLING_PROVENANCE_MISSING');

    await client.query('BEGIN');
    await client.query("SELECT set_config('app.current_user_id', $1, true)", [String(context.userId)]);
    await client.query("SELECT set_config('app.current_org_id', $1, true)", [String(context.orgId)]);
    await scopedDb.update(schema.tenderDocuments).set({ status: 'EXTRACTED', extractedData: parsed })
      .where(and(eq(schema.tenderDocuments.id, context.documentId), eq(schema.tenderDocuments.orgId, context.orgId)));
    await scopedDb.update(schema.jobs).set({
      status: 'SUCCEEDED', progress: 100, finishedAt: new Date(),
      result: { documentId: context.documentId, pages: parsed.pages.length },
      provenance: { documentHash: document.contentHash, parser: 'docling-wrapper-v1' },
    }).where(and(eq(schema.jobs.id, context.jobId), eq(schema.jobs.orgId, context.orgId)));
    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
      await client.query('BEGIN');
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [String(context.userId)]);
      await client.query("SELECT set_config('app.current_org_id', $1, true)", [String(context.orgId)]);
      const code = error instanceof Error ? error.message.slice(0, 80) : 'DOCUMENT_PROCESSING_FAILED';
      await scopedDb.update(schema.tenderDocuments).set({ status: 'ERROR' })
        .where(and(eq(schema.tenderDocuments.id, context.documentId), eq(schema.tenderDocuments.orgId, context.orgId)));
      await scopedDb.update(schema.jobs).set({
        status: 'FAILED', progress: 100, finishedAt: new Date(), errorCode: code,
        errorMessage: 'Document processing failed. Inspect service logs using the request and job identifiers.',
      }).where(and(eq(schema.jobs.id, context.jobId), eq(schema.jobs.orgId, context.orgId)));
      await client.query('COMMIT');
    } catch (updateError) {
      await client.query('ROLLBACK');
      console.error('Failed to persist document job failure', { jobId: context.jobId, updateError });
    }
  } finally {
    client.release();
  }
}
