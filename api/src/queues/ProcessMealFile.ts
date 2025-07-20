import { eq } from 'drizzle-orm';
import { db } from '../db';
import { mealsTable } from '../db/schema';
import { MealInputType, MealStatus } from '../types/enums';
import { transcribeAudio } from '../services/ai';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../clients/s3client';
import { Readable } from 'stream';

export class ProcessMealFile {
  static async process({ fileKey }: { fileKey: string }) {
    const meal = await db.query.mealsTable.findFirst({
      where: eq(mealsTable.inputFileKey, fileKey),
    });

    if (!meal) {
      throw new Error('Meal not found.');
    }

    if (
      meal.status === MealStatus.FAILED ||
      meal.status === MealStatus.SUCCESS
    ) {
      return;
    }

    await db
      .update(mealsTable)
      .set({ status: MealStatus.PROCESSING })
      .where(eq(mealsTable.id, meal.id));

    try {
      if (meal.inputType === MealInputType.AUDIO) {
        const command = new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME!,
          Key: meal.inputFileKey,
        });

        const { Body } = await s3Client.send(command);

        if (!Body || !(Body instanceof Readable)) {
          throw new Error('File not found.');
        }

        const chunks: Buffer[] = [];
        for await (const chunk of Body) {
          chunks.push(Buffer.from(chunk));
        }

        const text = await transcribeAudio(Buffer.concat(chunks));

        console.log('🚀 ~ ProcessMealFile ~ text:', text);
      }

      await db
        .update(mealsTable)
        .set({
          status: MealStatus.SUCCESS,
          name: 'Café da manhã',
          icon: '🍞',
          foods: [
            {
              name: 'Pão',
              quantity: '2 fatias',
              calories: 100,
              proteins: 200,
              carbohydrates: 300,
              fasts: 400,
            },
          ],
        })
        .where(eq(mealsTable.id, meal.id));
    } catch {
      await db
        .update(mealsTable)
        .set({ status: MealStatus.FAILED })
        .where(eq(mealsTable.id, meal.id));
    }
  }
}
