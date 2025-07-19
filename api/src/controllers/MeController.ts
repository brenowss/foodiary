import { eq } from 'drizzle-orm';
import { db } from '../db';
import { mealsTable, usersTable } from '../db/schema';
import { HttpResponse, ProtectedHttpRequest } from '../types/http';

import { badRequest, ok } from '../utils/http';
import { MealInputType, MealStatus } from '../types/enums';
import z from 'zod';

const schema = z.object({
  fileType: z.string(),
});

export class MeController {
  static async handle({
    userId,
    body,
  }: ProtectedHttpRequest): Promise<HttpResponse> {
    const { success, error, data } = schema.safeParse(body);
    if (!success) {
      return badRequest({ errors: error.issues });
    }

    const meal = await db.insert(mealsTable).values({
      userId,
      inputFileKey: 'input_file_key',
      inputType:
        data.fileType === 'audio/m4a'
          ? MealInputType.AUDIO
          : MealInputType.PICTURE,
      status: MealStatus.UPLOADING,
      icon: '',
      name: '',
      foods: [],
    });

    return ok({});
  }
}
