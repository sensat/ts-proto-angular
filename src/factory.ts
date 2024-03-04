import {
  CompatServiceDefinition,
  NormalizedServiceDefinition,
  normalizeServiceDefinition,
} from './service-definitions/compat';
import {Channel} from './transport/channel';
import {MethodDefinition} from './service-definitions/generic';
import {createServerStreamingMethod} from './methods/server-streaming';
import {createUnaryMethod} from './methods/unary';
import {Client} from './client-definitions/generic';
import {createClientStreamingMethod} from './methods/client-streaming';
import {createBidiStreamingMethod} from './methods/bidi';

export function createClient<Service extends CompatServiceDefinition>(
  definition: Service,
  channel: Channel,
  headers: Headers = new Headers()
): Client<Service> {
  return new ClientFactory().create(definition, channel, headers);
}

export class ClientFactory {
  create<Service extends CompatServiceDefinition>(
    definition: Service,
    channel: Channel,
    headers: Headers
  ): Client<Service> {
    type NormalizedService = NormalizedServiceDefinition<Service>;

    const client = {} as {
      [K in keyof NormalizedService]: CallableFunction;
    };

    const methodEntries = Object.entries(
      normalizeServiceDefinition(definition)
    ) as Array<[keyof NormalizedService, MethodDefinition<unknown, unknown>]>;

    for (const [methodName, methodDefinition] of methodEntries) {
      if (methodDefinition.requestStream && methodDefinition.responseStream) {
        client[methodName] = createBidiStreamingMethod(
          methodDefinition,
          channel
        );
      }

      if (methodDefinition.requestStream && !methodDefinition.responseStream) {
        client[methodName] = createClientStreamingMethod(
          methodDefinition,
          channel
        );
      }

      if (!methodDefinition.requestStream && methodDefinition.responseStream) {
        client[methodName] = createServerStreamingMethod(
          methodDefinition,
          channel,
          headers
        );
      }

      if (!methodDefinition.requestStream && !methodDefinition.responseStream) {
        client[methodName] = createUnaryMethod(
          methodDefinition,
          channel,
          headers
        );
      }
    }

    return client as Client<Service>;
  }
}
