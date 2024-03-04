import {MethodDefinition} from '../service-definitions/generic';
import {Channel} from '../transport/channel';
import {buildCall} from './call';
import {HttpError, grpcStatusToHttp} from '../transport/error';
import {Observable, filter, map, mergeMap} from 'rxjs';
import {ServerStreamingClientMethod} from '../client-definitions/observable';

export function createServerStreamingMethod<Request, Response>(
  definition: MethodDefinition<Request, Response>,
  channel: Channel,
  headers: Headers
): ServerStreamingClientMethod<Request, Response> {
  function serverStreamingMethod(request: Request): Observable<Response> {
    const call = buildCall(channel.address, definition, request, headers);

    return channel.transport.call$(call).pipe(
      // stream messages are newline-delimited json
      // see https://grpc-ecosystem.github.io/grpc-gateway/docs/mapping/customizing_your_gateway/#stream-error-handler
      map(message => message.split('\n')),
      mergeMap(message => message),
      filter(message => !!message),
      map(message => {
        const event = JSON.parse(message);

        if (event.error) {
          throw new HttpError({
            method: call.method,
            url: call.url.href,
            headers: call.headers,
            responseText: event.error.details,
            status: grpcStatusToHttp(event.error.code),
            statusText: event.error.message,
          });
        }

        return event;
      }),
      map(event => definition.responseDeserialize(event.result || {}))
    );

    // for (const messages of response) {
    //   // stream messages are newline-delimited json
    //   // see https://grpc-ecosystem.github.io/grpc-gateway/docs/mapping/customizing_your_gateway/#stream-error-handler
    //   for (const message of messages.split('\n').filter(msg => msg)) {
    //     const event = JSON.parse(message);

    //     // errors are grpc.status messages
    //     // see https://github.com/googleapis/googleapis/blob/master/google/rpc/status.proto
    //     if (event.error) {
    //       throw new HttpError({
    //         method: call.method,
    //         url: call.url.href,
    //         headers: call.headers,
    //         responseText: event.error.details,
    //         status: grpcStatusToHttp(event.error.code),
    //         statusText: event.error.message,
    //       });
    //     }

    //     // grpc-gateway wraps stream responses in a "result" field.
    //     // see https://github.com/grpc-ecosystem/grpc-gateway/issues/579
    //     yield definition.responseDeserialize(event.result || {});
    //   }
  }

  return serverStreamingMethod;
}
