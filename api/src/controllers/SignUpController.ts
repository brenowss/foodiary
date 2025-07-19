import { z } from 'zod';
import { HttpRequest, HttpResponse } from '../types/http';
import { badRequest, conflict, created } from '../utils/http';
import { Goal, Gender } from '../types/enums';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';

const schema = z.object({
  goal: z.enum(Object.values(Goal) as [string, ...string[]]),
  gender: z.enum(Object.values(Gender) as [string, ...string[]]),
  weight: z.number().min(40).max(200),
  height: z.number().min(100).max(250),
  birthDate: z.iso.date(),
  activityLevel: z.number().min(1).max(5),
  account: z.object({
    name: z.string().min(3),
    email: z.email(),
    password: z.string().min(8),
  }),
});

export class SignUpController {
  static async handle(request: HttpRequest): Promise<HttpResponse> {
    const { data, error } = schema.safeParse(request.body);

    if (error) {
      return badRequest({
        message: error.message,
      });
    }

    const userAlreadyExists = await db.query.usersTable.findFirst({
      columns: {
        email: true,
      },
      where: eq(usersTable.email, data.account.email),
    });

    if (userAlreadyExists) {
      return conflict({
        error: 'This email is already in use',
      });
    }

    const { account, ...userData } = data;

    const hashedPassword = await hash(account.password, 10);

    const [user] = await db
      .insert(usersTable)
      .values({
        ...userData,
        ...account,
        password: hashedPassword,
        calories: 0,
        proteins: 0,
        carbohydrates: 0,
        fats: 0,
      })
      .returning({
        id: usersTable.id,
      });

    return created({
      data: {
        id: user.id,
      },
    });
  }
}
