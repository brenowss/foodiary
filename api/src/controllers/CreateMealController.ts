import z from 'zod';
import { db } from '../db';
import { mealsTable } from '../db/schema';
import { HttpResponse, ProtectedHttpRequest } from '../types/http';
import { badRequest, created } from '../utils/http';
import { MealInputType, MealStatus } from '../types/enums';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { s3Client } from '../clients/s3client';

const schema = z.object({
  fileType: z.enum(['audio/m4a', 'image/jpeg']),
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

    const fileId = randomUUID();
    const ext = data.fileType === 'audio/m4a' ? '.m4a' : '.jpeg';
    const fileKey = `meals/${fileId}${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 60 * 24,
    });

    const [meal] = await db
      .insert(mealsTable)
      .values({
        userId,
        inputFileKey: fileKey,
        inputType:
          data.fileType === 'audio/m4a'
            ? MealInputType.AUDIO
            : MealInputType.PICTURE,
        status: MealStatus.UPLOADING,
        icon: '',
        name: '',
        foods: [],
      })
      .returning({ id: mealsTable.id });

    return created({ mealId: meal.id, url });
  }
}
