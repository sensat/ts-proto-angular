import {
  CompatServiceDefinition,
  NormalizedServiceDefinition,
} from '../service-definitions/compat';
import {ServiceDefinition} from '../service-definitions/generic';
import {ClientMethod} from './observable';

export type Client<Service extends CompatServiceDefinition> = RawClient<
  NormalizedServiceDefinition<Service>
>;

type RawClient<Service extends ServiceDefinition> = {
  [Method in keyof Service]: ClientMethod<Service[Method]>;
};
