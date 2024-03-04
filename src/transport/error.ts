import {StatusCodes} from 'http-status-codes';

export class HttpError extends Error implements Error {
  readonly name = 'HttpErrorResponse';

  readonly headers?: Headers;
  readonly status?: number;
  readonly statusText?: string;
  readonly url?: string;
  readonly responseText?: string;

  constructor(init: {
    method: string;
    url: string;
    headers: Headers;
    status: number;
    statusText: string;
    responseText: string;
  }) {
    super(
      `${init.method} ${init.url}: ${init.status} ${init.statusText} - ${init.responseText}`
    );

    this.headers = init.headers;
    this.status = init.status;
    this.statusText = init.statusText;
    this.url = init.url;
    this.responseText = init.responseText;
  }
}

const grpcCodes = {
  OK: 0,
  Canceled: 1,
  Unknown: 2,
  InvalidArgument: 3,
  DeadlineExceeded: 4,
  NotFound: 5,
  AlreadyExists: 6,
  PermissionDenied: 7,
  ResourceExhausted: 8,
  FailedPrecondition: 9,
  Aborted: 10,
  OutOfRange: 11,
  Unimplemented: 12,
  Internal: 13,
  Unavailable: 14,
  DataLoss: 15,
  Unauthenticated: 16,
};

// mapping adapted from
// https://github.com/grpc-ecosystem/grpc-gateway/blob/v2.15.2/runtime/errors.go#L36-L77
export function grpcStatusToHttp(code: number): number {
  switch (code) {
    case grpcCodes.OK:
      return StatusCodes.OK;
    case grpcCodes.Canceled:
      return 499;
    case grpcCodes.Unknown:
      return StatusCodes.INTERNAL_SERVER_ERROR;
    case grpcCodes.InvalidArgument:
      return StatusCodes.BAD_REQUEST;
    case grpcCodes.DeadlineExceeded:
      return StatusCodes.GATEWAY_TIMEOUT;
    case grpcCodes.NotFound:
      return StatusCodes.NOT_FOUND;
    case grpcCodes.AlreadyExists:
      return StatusCodes.CONFLICT;
    case grpcCodes.PermissionDenied:
      return StatusCodes.FORBIDDEN;
    case grpcCodes.Unauthenticated:
      return StatusCodes.UNAUTHORIZED;
    case grpcCodes.ResourceExhausted:
      return StatusCodes.TOO_MANY_REQUESTS;
    case grpcCodes.FailedPrecondition:
      // Note, this deliberately doesn't translate to the similarly named '412 Precondition Failed' HTTP response status.
      return StatusCodes.BAD_REQUEST;
    case grpcCodes.Aborted:
      return StatusCodes.CONFLICT;
    case grpcCodes.OutOfRange:
      return StatusCodes.BAD_REQUEST;
    case grpcCodes.Unimplemented:
      return StatusCodes.NOT_IMPLEMENTED;
    case grpcCodes.Internal:
      return StatusCodes.INTERNAL_SERVER_ERROR;
    case grpcCodes.Unavailable:
      return StatusCodes.SERVICE_UNAVAILABLE;
    case grpcCodes.DataLoss:
      return StatusCodes.INTERNAL_SERVER_ERROR;
    default:
      return StatusCodes.INTERNAL_SERVER_ERROR;
  }
}
