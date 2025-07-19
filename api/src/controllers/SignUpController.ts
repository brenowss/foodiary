import { z } from 'zod';
import { HttpRequest, HttpResponse } from '../types/http';
import { badRequest, created } from '../utils/http';
import { Goal, Gender } from '../types/enums';

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

    const { goal, gender, weight, height, birthDate, activityLevel, account } =
      data;

    return created({
      data,
    });
  }
}
