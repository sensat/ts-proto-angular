import {Observable, throwError} from 'rxjs';
import {BidiStreamingClientMethod} from '../client-definitions/observable';
import {MethodDefinition} from '../service-definitions/generic';
import {Channel} from '../transport/channel';

export function createBidiStreamingMethod<Request, Response>(
  _: MethodDefinition<Request, Response>,
  __: Channel
): BidiStreamingClientMethod<Request, Response> {
  function bidiStreamingMethod(
    request: Observable<Request>
  ): Observable<Response> {
    return request.pipe(_ =>
      throwError(() => new Error('bidi streaming methods are not implemented'))
    );
  }

  return bidiStreamingMethod;
}
