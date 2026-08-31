import { proxyActivities } from '@temporalio/workflow';
import type { DocumentJobContext } from '../services/documentProcessor.ts';

export interface DocumentActivities {
  processDocumentActivity(context: DocumentJobContext): Promise<void>;
}

const { processDocumentActivity } = proxyActivities<DocumentActivities>({
  startToCloseTimeout: '30 minutes',
  heartbeatTimeout: '2 minutes',
  retry: {
    initialInterval: '2 seconds',
    maximumInterval: '1 minute',
    maximumAttempts: 5,
  },
});

export async function documentWorkflow(context: DocumentJobContext): Promise<void> {
  await processDocumentActivity(context);
}
