import { HttpRequest, HttpResponse } from '../types/http';
import { badRequest, ok, unauthorized } from '../utils/http';
import { z } from 'zod';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { compare } from 'bcryptjs';

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export class SignInController {
  static async handle(request: HttpRequest): Promise<HttpResponse> {
    const { data, error } = schema.safeParse(request.body);

    if (error) {
      return badRequest({
        message: error.message,
      });
    }

    const user = await db.query.usersTable.findFirst({
      columns: {
        id: true,
        email: true,
        password: true,
      },
      where: eq(usersTable.email, data.email),
    });

    if (!user) {
      return unauthorized({
        error: 'Invalid email or password',
      });
    }

    const isPasswordValid = await compare(data.password, user.password);

    if (!isPasswordValid) {
      return unauthorized({
        error: 'Invalid email or password',
      });
    }

    return ok({
      data,
    });
  }
}
