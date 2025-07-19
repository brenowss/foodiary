import { eq } from 'drizzle-orm';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { HttpResponse, ProtectedHttpRequest } from '../types/http';

import { badRequest, ok } from '../utils/http';

export class MeController {
  static async handle(request: ProtectedHttpRequest): Promise<HttpResponse> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, request.userId),
    });

    if (!user) {
      return badRequest({
        message: 'User not found',
      });
    }

    return ok({
      user,
    });
  }
}
