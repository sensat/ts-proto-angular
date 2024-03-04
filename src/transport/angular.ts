import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Call, Transport} from './transport';
import {Observable, catchError, throwError} from 'rxjs';
import {HttpError} from './error';

// can't be used for streaming endpoints
// as HttpClient uses XMLHttpRequest under the hood
// and it doesn't support streaming
export class AngularTransport implements Transport {
  constructor(private readonly http: HttpClient) {}

  call$({method, url, body, headers}: Call): Observable<string> {
    if (method === 'GET') body = undefined;

    const angularHeaders = new HttpHeaders();
    headers.forEach((value, key) => {
      angularHeaders.append(key, value);
    });

    return this.http
      .request(method, url.href, {
        body,
        headers: angularHeaders,
        withCredentials: true,
        responseType: 'text',
      })
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(() => formatError(method, err))
        )
      );
  }
}

function formatError(method: string, err: HttpErrorResponse) {
  const headers = new Headers();
  for (const header of err.headers.keys()) {
    headers.append(header, err.headers.get(header) || '');
  }

  return new HttpError({
    headers: headers,
    method: method,
    responseText: err.message,
    status: err.status,
    statusText: err.statusText,
    url: err.url || '',
  });
}
