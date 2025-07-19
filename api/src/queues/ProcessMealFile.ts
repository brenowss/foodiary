import { eq } from 'drizzle-orm';
import { db } from '../db';
import { mealsTable } from '../db/schema';
import { MealStatus } from '../types/enums';

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
      // CHAMAR A IA...

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
