import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { eq } from 'drizzle-orm';
import { Readable } from 'node:stream';
import { db } from '../db';
import { mealsTable } from '../db/schema';
import {
  getMealDetailsFromImage,
  getMealDetailsFromText,
  transcribeAudio,
} from '../services/ai';
import { s3Client } from '../clients/s3client';

type MealKey = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extra';

export class ProcessMeal {
  static async process({ fileKey }: { fileKey: string }) {
    console.log('Processing file', {
      fileKey,
    });

    const meal = await db.query.mealsTable.findFirst({
      where: eq(mealsTable.inputFileKey, fileKey),
    });

    if (!meal) {
      throw new Error('Meal not found.');
    }

    if (meal.status === 'failed' || meal.status === 'success') {
      return;
    }

    await db
      .update(mealsTable)
      .set({ status: 'processing' })
      .where(eq(mealsTable.id, meal.id));

    try {
      let icon = '';
      let name = '';
      let key: MealKey = 'extra';
      let foods = [];

      if (meal.inputType === 'audio') {
        const audioFileBuffer = await this.downloadAudioFile(meal.inputFileKey);
        const transcription = await transcribeAudio(audioFileBuffer);

        const mealDetails = await getMealDetailsFromText({
          createdAt: meal.createdAt,
          text: transcription,
        });

        icon = mealDetails.icon;
        name = mealDetails.name;
        key = mealDetails.key;
        foods = mealDetails.foods;
      }

      if (meal.inputType === 'picture') {
        console.log('Getting image URL', {
          fileKey: meal.inputFileKey,
        });

        const imageURL = await this.getImageURL(meal.inputFileKey);

        console.log('Got image URL', {
          imageURL,
        });

        const mealDetails = await getMealDetailsFromImage({
          createdAt: meal.createdAt,
          imageURL,
          description: meal.description || undefined,
        });

        console.log('Got meal details from image', {
          mealDetails,
        });

        icon = mealDetails.icon;
        name = mealDetails.name;
        key = mealDetails.key;
        foods = mealDetails.foods;
      }

      await db
        .update(mealsTable)
        .set({
          status: 'success',
          name,
          icon,
          key,
          foods,
        })
        .where(eq(mealsTable.id, meal.id));
    } catch (error) {
      console.log('Failed to process meal', error);

      await db
        .update(mealsTable)
        .set({ status: 'failed' })
        .where(eq(mealsTable.id, meal.id));
    }
  }

  private static async downloadAudioFile(fileKey: string) {
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
    });

    const { Body } = await s3Client.send(command);

    if (!Body || !(Body instanceof Readable)) {
      throw new Error('Cannot load the audio file.');
    }

    const chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  private static async getImageURL(fileKey: string) {
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
    });

    return getSignedUrl(s3Client, command, { expiresIn: 600 });
  }
}
