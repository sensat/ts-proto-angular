import {ServiceDefinition} from './generic';
import {
  FromTsProtoServiceDefinition,
  TsProtoServiceDefinition,
  fromTsProtoServiceDefinition,
} from './ts-proto';

export type CompatServiceDefinition =
  | ServiceDefinition
  | TsProtoServiceDefinition;

export type NormalizedServiceDefinition<
  Service extends CompatServiceDefinition,
> = Service extends TsProtoServiceDefinition
  ? FromTsProtoServiceDefinition<Service>
  : never;

export function normalizeServiceDefinition(
  definition: CompatServiceDefinition
): ServiceDefinition {
  if (isTsProtoServiceDefinition(definition)) {
    return fromTsProtoServiceDefinition(definition);
  }

  return definition;
}

function isTsProtoServiceDefinition(
  definition: CompatServiceDefinition
): definition is TsProtoServiceDefinition {
  return (
    'name' in definition && 'fullName' in definition && 'methods' in definition
  );
}
