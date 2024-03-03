import _m0 from 'protobufjs/minimal';
import {HttpRule} from './http';

export const protobufPackage = 'google.api';

export const http: Extension<HttpRule> = {
  number: 72295728,
  tag: 578365826,
  repeated: false,
  packed: false,
  encode: (value: HttpRule): Uint8Array[] => {
    const encoded: Uint8Array[] = [];
    const writer = _m0.Writer.create();
    HttpRule.encode(value, writer.fork()).ldelim();
    encoded.push(writer.finish());
    return encoded;
  },
  decode: (tag: number, input: Uint8Array[]): HttpRule => {
    const reader = _m0.Reader.create(input[input.length - 1]);
    return HttpRule.decode(reader, reader.uint32());
  },
};

export interface Extension<T> {
  number: number;
  tag: number;
  singularTag?: number;
  encode?: (message: T) => Uint8Array[];
  decode?: (tag: number, input: Uint8Array[]) => T;
  repeated: boolean;
  packed: boolean;
}
