import z from 'zod';
import { db } from '../db';
import { mealsTable } from '../db/schema';
import { HttpResponse, ProtectedHttpRequest } from '../types/http';
import { badRequest, notFound, ok } from '../utils/http';
import { and, eq } from 'drizzle-orm';

const schema = z.object({
  mealId: z.uuid(),
});

export class GetMealByIdController {
  static async handle({
    userId,
    params,
  }: ProtectedHttpRequest): Promise<HttpResponse> {
    const { success, error, data } = schema.safeParse(params);
    if (!success) {
      return badRequest({ errors: error.issues });
    }

    const meal = await db.query.mealsTable.findFirst({
      columns: {
        id: true,
        foods: true,
        icon: true,
        createdAt: true,
        name: true,
        status: true,
      },
      where: and(eq(mealsTable.userId, userId), eq(mealsTable.id, data.mealId)),
    });

    if (!meal) {
      return notFound({ error: 'Meal not found.' });
    }

    return ok({ meal });
  }
}
