import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { HttpRequest } from '../types/http';

export function parseHttpEvent(event: APIGatewayProxyEventV2): HttpRequest {
  const body = event.body ? JSON.parse(event.body) : {};
  const queryParams = event.queryStringParameters
    ? event.queryStringParameters
    : {};
  const params = event.pathParameters ? event.pathParameters : {};

  return { body, queryParams, params };
}
