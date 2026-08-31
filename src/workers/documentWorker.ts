import dotenv from 'dotenv';
import { NativeConnection, Worker } from '@temporalio/worker';
import { processDocumentJob, type DocumentJobContext } from '../services/documentProcessor.ts';

dotenv.config();

async function processDocumentActivity(context: DocumentJobContext) {
  await processDocumentJob(context);
}

const address = process.env.TEMPORAL_ADDRESS;
if (!address) throw new Error('TEMPORAL_ADDRESS is required');

const connection = await NativeConnection.connect({ address });
const worker = await Worker.create({
  connection,
  namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  taskQueue: 'tenderai-documents',
  workflowsPath: new URL('../workflows/documentWorkflow.ts', import.meta.url).pathname,
  activities: { processDocumentActivity },
});

await worker.run();
