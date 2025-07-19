import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ProtectedHttpRequest } from '../types/http';
import { parseHttpEvent } from './parseHttpEvent';
import { validateAccessToken } from '../lib/jwt';

export function parseProtectedEvent(
  event: APIGatewayProxyEventV2
): ProtectedHttpRequest {
  const baseEvent = parseHttpEvent(event);
  const { authorization } = event.headers;

  if (!authorization) {
    throw new Error('Authorization header is required');
  }

  const [, accessToken] = authorization.split(' ');

  const { sub: userId } = validateAccessToken(accessToken);

  if (!userId) {
    throw new Error('Invalid access token');
  }

  return { ...baseEvent, userId };
}
