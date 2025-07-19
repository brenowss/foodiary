import {
  date,
  integer,
  json,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { MealInputType, MealStatus } from '../types/enums';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  goal: varchar({ length: 8 }).notNull(),
  birthDate: date('birth_date').notNull(),
  gender: varchar({ length: 6 }).notNull(),
  weight: integer().notNull(),
  height: integer().notNull(),
  activityLevel: integer('activity_level').notNull(),

  // Goals
  calories: integer().notNull(),
  proteins: integer().notNull(),
  carbohydrates: integer().notNull(),
  fats: integer().notNull(),
});

export const mealStatus = pgEnum('meal_status', [
  MealStatus.UPLOADING,
  MealStatus.PROCESSING,
  MealStatus.SUCCESS,
  MealStatus.FAILED,
  MealStatus.SUCCESS,
]);

export const mealInputType = pgEnum('meal_input_type', [
  MealInputType.AUDIO,
  MealInputType.PICTURE,
]);

export const mealsTable = pgTable('meals', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  status: mealStatus().notNull(),
  inputType: mealInputType('input_type').notNull(),
  inputFileKey: varchar('input_file_key', { length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  icon: varchar({ length: 100 }).notNull(),
  foods: json(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
