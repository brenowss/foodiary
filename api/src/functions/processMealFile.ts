import { SQSEvent } from 'aws-lambda';
import { ProcessMealFile } from '../queues/ProcessMealFile';

export async function handler(event: SQSEvent) {
  await Promise.all(
    event.Records.map(async (record) => {
      const body = JSON.parse(record.body);
      await ProcessMealFile.process(body);
    })
  );
}
