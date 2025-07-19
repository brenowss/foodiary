import { HttpRequest, HttpResponse } from '../types/http';
import { badRequest, ok } from '../utils/http';
import { z } from 'zod';

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

    const { email, password } = data;

    return ok({
      data,
    });
  }
}
