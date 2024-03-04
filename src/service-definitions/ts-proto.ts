import {http} from './http-rule-extension/annotations';
import {HttpRule} from './http-rule-extension/http';
import {MethodOptions} from 'ts-proto-descriptors';
import {MethodDefinition, ServiceDefinition} from './generic';

export type TsProtoServiceDefinition = {
  name: string;
  fullName: string;
  methods: {
    [method: string]: TsProtoMethodDefinition<unknown, unknown>;
  };
};

export type TsProtoMethodDefinition<
  Request,
  Response,
  RequestStream extends boolean = boolean,
  ResponseStream extends boolean = boolean,
> = {
  name: string;
  requestType: TsProtoMessageType<Request>;
  requestStream: RequestStream;
  responseType: TsProtoMessageType<Response>;
  responseStream: ResponseStream;
  options: {
    idempotencyLevel?: 'IDEMPOTENT' | 'NO_SIDE_EFFECTS';
    _unknownFields?: {};
  };
};

export type FromTsProtoServiceDefinition<
  Service extends TsProtoServiceDefinition,
> = {
  [M in keyof Service['methods']]: FromTsProtoMethodDefinition<
    Service['methods'][M]
  >;
};

type FromTsProtoMethodDefinition<Method> =
  Method extends TsProtoMethodDefinition<infer Request, infer Response>
    ? MethodDefinition<
        Request,
        Response,
        Method['requestStream'],
        Method['responseStream']
      >
    : never;

type TsProtoMessageType<Message> = {
  fromJSON(object: unknown): Message;
  toJSON(message: Message): unknown;
};

export function fromTsProtoServiceDefinition(
  definition: TsProtoServiceDefinition
): ServiceDefinition {
  const result: ServiceDefinition = {};

  for (const [key, method] of Object.entries(definition.methods)) {
    const rules = MethodOptions.getExtension(
      method.options as unknown as MethodOptions,
      http
    );

    result[key] = {
      ...getCallParameters(rules, `/${definition.fullName}/${method.name}`),
      requestStream: method.requestStream,
      responseStream: method.responseStream,
      requestDeserialize: method.requestType.fromJSON,
      requestSerialize: method.requestType.toJSON,
      responseDeserialize: method.responseType.fromJSON,
      responseSerialize: method.responseType.toJSON,
      options: method.options,
    };
  }

  return result;
}

function getCallParameters(
  rule: HttpRule | undefined,
  defaultPath: string
): {method: string; path: string; body: string} {
  if (rule?.post) return {method: 'POST', path: rule.post, body: rule.body};
  if (rule?.get) return {method: 'GET', path: rule.get, body: rule.body};
  if (rule?.patch) return {method: 'PATCH', path: rule.patch, body: rule.body};
  if (rule?.delete)
    return {method: 'DELETE', path: rule.delete, body: rule.body};
  if (rule?.put) return {method: 'PUT', path: rule.put, body: rule.body};
  return {method: 'POST', path: defaultPath, body: '*'};
}
