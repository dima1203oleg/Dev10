import { Client, Connection } from '@temporalio/client';
import type { DocumentJobContext } from './documentProcessor.ts';
import { documentWorkflow } from '../workflows/documentWorkflow.ts';

let clientPromise: Promise<Client> | undefined;

async function getClient() {
  if (!clientPromise) {
    clientPromise = Connection.connect({ address: process.env.TEMPORAL_ADDRESS || '127.0.0.1:7233' })
      .then((connection) => new Client({ connection, namespace: process.env.TEMPORAL_NAMESPACE || 'default' }));
  }
  return clientPromise;
}

export async function dispatchDocumentJob(context: DocumentJobContext) {
  const client = await getClient();
  await client.workflow.start(documentWorkflow, {
    taskQueue: 'tenderai-documents',
    workflowId: `document-${context.jobId}`,
    args: [context],
  });
}
