import z from 'zod';
import { db } from '../db';
import { mealsTable } from '../db/schema';
import { HttpResponse, ProtectedHttpRequest } from '../types/http';
import { badRequest, ok } from '../utils/http';
import { and, eq, gte, lte } from 'drizzle-orm';
import { MealStatus } from '../types/enums';

const schema = z.object({
  date: z.iso.date().transform((date) => new Date(date)),
});

export class ListMealController {
  static async handle({
    userId,
    queryParams,
  }: ProtectedHttpRequest): Promise<HttpResponse> {
    const { success, error, data } = schema.safeParse(queryParams);
    if (!success) {
      return badRequest({ errors: error.issues });
    }

    const endDate = new Date(data.date);
    endDate.setUTCHours(23, 59, 59, 999);

    const meals = await db.query.mealsTable.findMany({
      columns: {
        id: true,
        foods: true,
        icon: true,
        createdAt: true,
        name: true,
      },
      where: and(
        eq(mealsTable.userId, userId),
        gte(mealsTable.createdAt, data.date),
        lte(mealsTable.createdAt, endDate),
        eq(mealsTable.status, MealStatus.SUCCESS)
      ),
    });

    return ok({ meals });
  }
}
