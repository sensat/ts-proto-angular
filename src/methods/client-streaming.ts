import {Observable, throwError} from 'rxjs';
import {ClientStreamingClientMethod} from '../client-definitions/observable';
import {MethodDefinition} from '../service-definitions/generic';
import {Channel} from '../transport/channel';

export function createClientStreamingMethod<Request, Response>(
  _: MethodDefinition<Request, Response>,
  __: Channel
): ClientStreamingClientMethod<Request, Response> {
  function clientStreamingMethod(
    request: Observable<Request>
  ): Observable<Response> {
    return request.pipe(_ =>
      throwError(
        () => new Error('client streaming methods are not implemented')
      )
    );
  }

  return clientStreamingMethod;
}
