export type HttpRequest = {
  body: Record<string, unknown>;
  queryParams: Record<string, unknown>;
  params: Record<string, unknown>;
};

export type HttpResponse = {
  statusCode: number;
  body?: Record<string, unknown>;
};
