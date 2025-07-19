import { SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import { S3Event } from 'aws-lambda';
import { sqsClient } from '../clients/sqsClient';

export async function handler(event: S3Event) {
  const BATCH_SIZE = 10;
  const records = event.Records;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    const command = new SendMessageBatchCommand({
      QueueUrl: process.env.MEALS_QUEUE_URL,
      Entries: batch.map((record, index) => ({
        Id: `${i + index}`,
        MessageBody: JSON.stringify({ fileKey: record.s3.object.key }),
      })),
    });

    await sqsClient.send(command);
  }
}
