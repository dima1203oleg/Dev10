import { Readable } from 'node:stream';
import { drizzle } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import { createPool } from '../db/index.ts';
import * as schema from '../db/schema.ts';
import { createStorageProvider } from '../lib/storage.ts';

const storage = createStorageProvider();

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

const DOCLING_TIMEOUT_MS = 180_000;
const DOCLING_POLL_MS = 2_000;

async function fetchDoclingJson(url: string, init: RequestInit, timeoutMs = 30_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) throw new Error(`DOCLING_HTTP_${response.status}`);
    return await response.json() as Record<string, unknown>;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new Error('DOCLING_TIMEOUT');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function convertWithDocling(doclingUrl: string, form: FormData, headers: Record<string, string>) {
  const task = await fetchDoclingJson(`${doclingUrl}/v1/convert/file/async`, {
    method: 'POST', headers, body: form,
  });
  const taskId = typeof task.task_id === 'string' ? task.task_id : undefined;
  if (!taskId) throw new Error('DOCLING_TASK_MISSING');
  const deadline = Date.now() + DOCLING_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const status = await fetchDoclingJson(`${doclingUrl}/v1/status/poll/${encodeURIComponent(taskId)}`, { headers });
    const taskStatus = String(status.task_status || status.status || '').toLowerCase();
    if (['failure', 'failed', 'error'].includes(taskStatus)) throw new Error('DOCLING_CONVERSION_FAILED');
    if (['success', 'succeeded', 'completed', 'partial_success'].includes(taskStatus)) {
      return await fetchDoclingJson(`${doclingUrl}/v1/result/${encodeURIComponent(taskId)}`, { headers });
    }
    await new Promise((resolve) => setTimeout(resolve, DOCLING_POLL_MS));
  }
  throw new Error('DOCLING_TIMEOUT');
}

export async function processDocumentJob(context: DocumentJobContext) {
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
    form.append('files', new Blob([buffer], { type: document.mimeType || 'application/octet-stream' }), document.name);
    form.append('to_formats', 'json');
    form.append('do_ocr', 'true');
    form.append('table_mode', 'accurate');
    const headers: Record<string, string> = {};
    if (process.env.DOCLING_API_KEY) headers['X-Api-Key'] = process.env.DOCLING_API_KEY;
    const conversion = await convertWithDocling(doclingUrl, form, headers) as {
      status?: string;
      document?: { json_content?: string | Record<string, unknown> };
      errors?: unknown[];
    };
    if (!['success', 'partial_success'].includes(conversion.status || '')) throw new Error('DOCLING_CONVERSION_FAILED');
    const rawContent = conversion.document?.json_content;
    const parsed = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
    if (!parsed || typeof parsed !== 'object') throw new Error('DOCLING_DOCUMENT_MISSING');
    const pages = (parsed as { pages?: unknown[] | Record<string, unknown> }).pages;
    const pageCount = Array.isArray(pages) ? pages.length : pages && typeof pages === 'object' ? Object.keys(pages).length : 0;
    const provenanceItems = ['texts', 'tables', 'pictures'].flatMap((key) => {
      const value = (parsed as Record<string, unknown>)[key];
      return Array.isArray(value) ? value : [];
    });
    const hasBbox = provenanceItems.some((item: any) => Array.isArray(item?.prov) && item.prov.some((p: any) => p?.bbox));
    if (pageCount === 0 || !hasBbox) throw new Error('DOCLING_PROVENANCE_MISSING');

    await client.query('BEGIN');
    await client.query("SELECT set_config('app.current_user_id', $1, true)", [String(context.userId)]);
    await client.query("SELECT set_config('app.current_org_id', $1, true)", [String(context.orgId)]);
    await scopedDb.update(schema.tenderDocuments).set({ status: 'EXTRACTED', extractedData: parsed })
      .where(and(eq(schema.tenderDocuments.id, context.documentId), eq(schema.tenderDocuments.orgId, context.orgId)));
    await scopedDb.update(schema.jobs).set({
      status: 'SUCCEEDED', progress: 100, finishedAt: new Date(),
      result: { documentId: context.documentId, pages: pageCount },
      provenance: { documentHash: document.contentHash, parser: 'docling-serve-v1.21.0', bboxVerified: true },
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
