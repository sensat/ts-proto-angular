import {HttpError} from './error';
import {Call, Transport} from './transport';
import {Observable, map, filter, concatMap, takeWhile} from 'rxjs';
import {fromFetch} from 'rxjs/fetch';

/**
 * Transport for browsers based on `fetch` API.
 */
export class FetchTransport implements Transport {
  call$({method, url, body, headers}: Call): Observable<string> {
    if (method === 'GET') body = undefined;

    return fromFetch(url.href, {
      method,
      body,
      headers: headers,
      credentials: 'include',
    }).pipe(
      map(response => {
        if (!response.ok || response.body === null) {
          throw new HttpError({
            headers,
            method,
            url: url.href,
            status: response.status,
            statusText: response.statusText,
            responseText: 'responseText', // todo use response.text()
          });
        }

        return response.body.getReader().read();
      }),
      concatMap(body => body),
      takeWhile(result => !result.done),
      filter(result => !!result.value),
      map(result => new TextDecoder().decode(result.value))
    );
  }
}
