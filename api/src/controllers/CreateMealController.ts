import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import z from 'zod';
import { eq } from 'drizzle-orm';

import { s3Client } from '../clients/s3client';
import { db } from '../db';
import { mealsTable } from '../db/schema';
import { HttpResponse, ProtectedHttpRequest } from '../types/http';
import { badRequest, created } from '../utils/http';
import { getMealDetailsFromText } from '../services/ai';

const schema = z.object({
  fileType: z.enum(['audio/m4a', 'image/jpeg', 'text/plain']),
  description: z.string().optional(),
  text: z.string().optional(),
});

export class CreateMealController {
  static async handle({
    userId,
    body,
  }: ProtectedHttpRequest): Promise<HttpResponse> {
    const { success, error, data } = schema.safeParse(body);

    if (!success) {
      return badRequest({ errors: error.issues });
    }

    // Para entrada de texto, não precisamos de arquivo
    if (data.fileType === 'text/plain') {
      if (!data.text) {
        return badRequest({
          errors: [{ message: 'Text is required for text/plain type' }],
        });
      }

      const [meal] = await db
        .insert(mealsTable)
        .values({
          userId,
          inputFileKey: null, // Não há arquivo para texto
          inputType: 'text',
          status: 'processing', // Pode processar imediatamente
          icon: '',
          name: '',
          description: data.text,
          foods: [],
        })
        .returning({ id: mealsTable.id });

      // Processar diretamente sem upload
      await this.processTextMeal(meal.id, data.text);

      return created({
        mealId: meal.id,
        uploadURL: '', // Não há URL de upload para texto
      });
    }

    const fileId = randomUUID();
    const ext = data.fileType === 'audio/m4a' ? '.m4a' : '.jpg';
    const fileKey = `${fileId}${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
    });

    const presignedURL = await getSignedUrl(s3Client, command, {
      expiresIn: 600,
    });

    let inputType: 'audio' | 'picture';
    if (data.fileType === 'audio/m4a') {
      inputType = 'audio';
    } else if (data.fileType === 'image/jpeg') {
      inputType = 'picture';
    } else {
      // Fallback, mas isso não deveria acontecer já que text/plain é tratado acima
      inputType = 'picture';
    }

    const [meal] = await db
      .insert(mealsTable)
      .values({
        userId,
        inputFileKey: fileKey,
        inputType,
        status: 'uploading',
        icon: '',
        name: '',
        description: data.description || null,
        foods: [],
      })
      .returning({ id: mealsTable.id });

    return created({
      mealId: meal.id,
      uploadURL: presignedURL,
    });
  }

  static async processTextMeal(mealId: string, text: string) {
    try {
      const meal = await db.query.mealsTable.findFirst({
        where: eq(mealsTable.id, mealId),
      });

      if (!meal) {
        throw new Error('Meal not found.');
      }

      const mealDetails = await getMealDetailsFromText({
        createdAt: meal.createdAt,
        text: text,
      });

      await db
        .update(mealsTable)
        .set({
          status: 'success',
          icon: mealDetails.icon,
          name: mealDetails.name,
          key: mealDetails.key,
          foods: mealDetails.foods,
        })
        .where(eq(mealsTable.id, mealId));
    } catch (error) {
      await db
        .update(mealsTable)
        .set({ status: 'failed' })
        .where(eq(mealsTable.id, mealId));

      throw error;
    }
  }
}
