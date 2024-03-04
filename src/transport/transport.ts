import {Observable} from 'rxjs';

export interface Transport {
  call$(call: Call): Observable<string>;
}

export type Call = {
  method: string;
  url: URL;
  headers: Headers;
  body: string | undefined;
};
