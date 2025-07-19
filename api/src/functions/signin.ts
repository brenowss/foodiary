import { APIGatewayProxyEventV2 } from 'aws-lambda';

import { SignInController } from '../controllers/SignInController';
import { parseHttpEvent } from '../utils/parseHttpEvent';
import { parseResponse } from '../utils/parseResponse';

export async function handler(event: APIGatewayProxyEventV2) {
  const request = parseHttpEvent(event);

  const response = await SignInController.handle(request);

  return parseResponse(response);
}
