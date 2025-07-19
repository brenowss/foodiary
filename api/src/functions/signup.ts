import { APIGatewayProxyEventV2 } from 'aws-lambda';

import { SignUpController } from '../controllers/SignUpController';
import { parseHttpEvent } from '../utils/parseHttpEvent';
import { parseResponse } from '../utils/parseResponse';

export async function handler(event: APIGatewayProxyEventV2) {
  const request = parseHttpEvent(event);

  const response = await SignUpController.handle(request);

  return parseResponse(response);
}
