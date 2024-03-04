import {
  MethodDefinition,
  MethodRequest,
  MethodResponse,
} from '../service-definitions/generic';
import {Observable} from 'rxjs';

export type ClientMethod<
  Definition extends MethodDefinition<unknown, unknown>,
> = Definition['requestStream'] extends false
  ? Definition['responseStream'] extends false
    ? UnaryClientMethod<MethodRequest<Definition>, MethodResponse<Definition>>
    : Definition['responseStream'] extends true
      ? ServerStreamingClientMethod<
          MethodRequest<Definition>,
          MethodResponse<Definition>
        >
      : never
  : Definition['requestStream'] extends true
    ? Definition['responseStream'] extends false
      ? ClientStreamingClientMethod<
          MethodRequest<Definition>,
          MethodResponse<Definition>
        >
      : Definition['responseStream'] extends true
        ? BidiStreamingClientMethod<
            MethodRequest<Definition>,
            MethodResponse<Definition>
          >
        : never
    : never;

export type UnaryClientMethod<Request, Response> = (
  request: Request
) => Observable<Response>;
export type ServerStreamingClientMethod<Request, Response> = (
  request: Request
) => Observable<Response>;
export type ClientStreamingClientMethod<Request, Response> = (
  request: Observable<Request>
) => Observable<Response>;
export type BidiStreamingClientMethod<Request, Response> = (
  request: Observable<Request>
) => Observable<Response>;
