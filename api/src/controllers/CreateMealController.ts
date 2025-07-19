import z from 'zod';
import { db } from '../db';
import { mealsTable } from '../db/schema';
import { HttpResponse, ProtectedHttpRequest } from '../types/http';
import { badRequest, created } from '../utils/http';
import { MealInputType, MealStatus } from '../types/enums';

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

    const [meal] = await db
      .insert(mealsTable)
      .values({
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
      })
      .returning({ id: mealsTable.id });

    return created({ mealId: meal.id });
  }
}
