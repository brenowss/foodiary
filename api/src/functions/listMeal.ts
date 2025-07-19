import { APIGatewayProxyEventV2 } from 'aws-lambda';

import { ListMealController } from '../controllers/ListMealController';
import { unauthorized } from '../utils/http';
import { parseProtectedEvent } from '../utils/parseProtectedEvent';
import { parseResponse } from '../utils/parseResponse';

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const request = parseProtectedEvent(event);
    const response = await ListMealController.handle(request);
    return parseResponse(response);
  } catch {
    return parseResponse(unauthorized({ error: 'Invalid access token.' }));
  }
}
