export type ServiceDefinition = {
  [method: string]: MethodDefinition<unknown, unknown>;
};

export type MethodDefinition<
  Request,
  Response,
  RequestStream extends boolean = boolean,
  ResponseStream extends boolean = boolean,
> = {
  method: string;
  path: string;
  body: string;
  requestStream: RequestStream;
  responseStream: ResponseStream;
  requestSerialize(value: Request): unknown;
  requestDeserialize(object: unknown): Request;
  responseSerialize(value: Response): unknown;
  responseDeserialize(object: unknown): Response;
  options: {
    idempotencyLevel?: 'IDEMPOTENT' | 'NO_SIDE_EFFECTS';
  };
};

export type MethodRequest<
  Definition extends MethodDefinition<unknown, unknown>,
> = Definition extends MethodDefinition<infer T, unknown> ? T : never;

export type MethodResponse<
  Definition extends MethodDefinition<unknown, unknown>,
> = Definition extends MethodDefinition<unknown, infer T> ? T : never;
