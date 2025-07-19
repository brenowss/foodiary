import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { MeController } from '../controllers/MeController';
import { parseProtectedEvent } from '../utils/parseProtectedEvent';
import { parseResponse } from '../utils/parseResponse';

export const handler = async (event: APIGatewayProxyEventV2) => {
  const request = parseProtectedEvent(event);

  const response = await MeController.handle(request);

  return parseResponse(response);
};
