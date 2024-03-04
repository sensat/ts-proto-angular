/* eslint-disable @typescript-eslint/no-explicit-any */
import {MethodDefinition} from '../service-definitions/generic';
import {Call} from '../transport/transport';

export function buildCall(
  baseUrl: string,
  definition: MethodDefinition<unknown, unknown>,
  request: any,
  headers: Headers = new Headers()
): Call {
  const pathBodyAndParams = definition.requestSerialize(request);
  const [bodyAndParams, path] = replacePathParams(
    definition.path,
    pathBodyAndParams
  );
  const [params, body] = formatBody(definition, bodyAndParams);
  const url = encodeSearchParams(new URL(path, baseUrl), params);

  // ensure content-type header is present
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return {
    method: definition.method,
    url,
    body,
    headers,
  };
}

function encodeSearchParams(url: URL, request: any): URL {
  const searchparams = new URLSearchParams();
  for (const [name, value] of Object.entries(request)) {
    for (const param of encodeSearchParam(name, value)) {
      if (value !== '' && value !== undefined && value !== null) {
        searchparams.append(param.name, param.value as string);
        url.searchParams.append(param.name, param.value);
      }
    }
  }

  return url;
}

function encodeSearchParam(
  name: string,
  value: any
): {name: string; value: any}[] {
  const result: Array<{name: string; value: string}> = [];

  // repeated search params aren't allowed by grpc-gateway: see
  // https://github.com/grpc-ecosystem/grpc-gateway/blob/v2.15.2/runtime/query.go#L100-L103
  if (Array.isArray(value)) {
    return result;
  }

  // if this is an object, recursively encode it.
  // for {param: {param2: val}} the encoding should be
  // param.param2=val
  if (typeof value === 'object' && value !== null) {
    for (const key in value) {
      for (const encoded of encodeSearchParam(key, value[key])) {
        result.push({name: name + '.' + encoded.name, value: encoded.value});
      }
    }

    return result;
  }

  result.push({name, value: value});
  return result;
}

function formatBody(
  definition: MethodDefinition<any, any>,
  request: any
): [any, string] {
  // if no body is specified, no body will be sent in the request
  if (!definition.body) {
    return [request, ''];
  }

  let body = request;

  // "*" is a special value in HttpRule's definition that says we should use the whole object
  // as the request body.
  if (definition.body === '*') {
    request = {};
  } else {
    body = request[definition.body];
    delete request[definition.body];
  }

  return [request, JSON.stringify(body)];
}

// support aip-127 (https://google.aip.dev/127) http to grpc transcoding path params
function replacePathParams(path: string, request: any): [any, string] {
  // capture fields like {abc} or {abc=def/ghi/*}.
  // discard the pattern after the equal sign.
  // relies on greedy capture within first part
  // to avoid matching 2nd group when no equal sign present.
  const pattern = new RegExp(/{([^=}]+)=?([^}]+)?}/g);
  const matches = path.matchAll(pattern);
  for (const match of matches) {
    // a match consists of three groups. For {abc=def/ghi/*}:
    // 1 - {abc=def/ghi/*}
    // 2 - abc
    // 3 - def/ghi/*
    // we replace (1) with (2)'s value in the request object
    // and (3) gets dropped.
    // the replaced value is then deleted from the request object
    const camelCaseKey = toCamelCase(match[1]);
    path = path.replace(match[0], request[camelCaseKey] as string);
    delete request[camelCaseKey];
  }

  return [request, path];
}

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}
