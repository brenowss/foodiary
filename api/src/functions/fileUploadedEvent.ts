import { SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import { S3Event } from 'aws-lambda';
import { sqsClient } from '../clients/sqsClient';

export const fileUploadedEvent = async (event: S3Event) => {
  const entries = event.Records.map((record, index) => ({
    Id: `message-${index}`,
    MessageBody: JSON.stringify({
      fileKey: record.s3.object.key,
    }),
  }));

  if (entries.length > 0) {
    const command = new SendMessageBatchCommand({
      QueueUrl: process.env.MEALS_QUEUE_URL,
      Entries: entries,
    });

    await sqsClient.send(command);
  }
};
