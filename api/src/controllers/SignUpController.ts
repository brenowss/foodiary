import { HttpRequest, HttpResponse } from '../types/http';
import { created } from '../utils/http';

export class SignUpController {
  static async handle(request: HttpRequest): Promise<HttpResponse> {
    return created({
      accessToken: 'accessToken',
    });
  }
}
