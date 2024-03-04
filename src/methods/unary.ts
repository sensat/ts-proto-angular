import {Channel} from '../transport/channel';
import {MethodDefinition} from '../service-definitions/generic';
import {buildCall} from './call';
import {UnaryClientMethod} from '../client-definitions/observable';
import {Observable, map} from 'rxjs';

export function createUnaryMethod<Request, Response>(
  definition: MethodDefinition<Request, Response>,
  channel: Channel,
  headers: Headers
): UnaryClientMethod<Request, Response> {
  function unaryMethod(request: Request): Observable<Response> {
    const call = buildCall(channel.address, definition, request, headers);
    return channel.transport
      .call$(call)
      .pipe(
        map(event => definition.responseDeserialize(JSON.parse(event) || {}))
      );

    // let unaryResponse: string | undefined;

    // for (const message of response) {
    //   if (unaryResponse != null) {
    //     throw new ClientError(
    //       definition.path,
    //       Status.INTERNAL,
    //       'Received more than one message from server for unary method'
    //     );
    //   }

    //   unaryResponse = message;
    // }

    // if (unaryResponse == null) {
    //   throw new ClientError(
    //     definition.path,
    //     Status.INTERNAL,
    //     'Server did not return a response'
    //   );
    // }

    // return definition.responseDeserialize(JSON.parse(unaryResponse));
  }

  return unaryMethod;
}
