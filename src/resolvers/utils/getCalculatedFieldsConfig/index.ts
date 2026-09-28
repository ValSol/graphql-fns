import type { ResolverArg, ResolverCreatorArg, TangibleEntityConfig } from '@/tsTypes';

// config whose calculated fields a root resolver calculates: a representation config passes...
// ... itself in "resolverOptions" because its resolver works with the root entity config
const getCalculatedFieldsConfig = (
  { entityConfig }: ResolverCreatorArg,
  { resolverOptions }: ResolverArg,
): TangibleEntityConfig =>
  (resolverOptions?.calculatedFieldsConfig || entityConfig) as TangibleEntityConfig;

export default getCalculatedFieldsConfig;
