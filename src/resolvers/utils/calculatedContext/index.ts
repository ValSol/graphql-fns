import type { DataObject, ResolverArg } from '@/tsTypes';

// data that root resolvers leave to field resolvers of calculated fields
export type CalculatedContext = {
  data: DataObject; // the entity as it was before "transformAfter" (mongo ids)
  asyncFuncResults: Record<string, any>;
  index: number;
  resolverArg: ResolverArg; // arg of the root resolver
};

// kept outside of entities, so entities stay plain objects (e.g. for "toEqual" in tests);...
// ... code that rebuilds an entity has to pass the context on with "copyCalculatedContext"
const calculatedContexts = new WeakMap<object, CalculatedContext>();

export const attachCalculatedContext = <T extends DataObject>(
  entity: T,
  calculatedContext: Omit<CalculatedContext, 'data'>,
): T => {
  calculatedContexts.set(entity, { ...calculatedContext, data: entity });

  return entity;
};

export const getCalculatedContext = (entity: any): CalculatedContext | undefined =>
  entity && typeof entity === 'object' ? calculatedContexts.get(entity) : undefined;

export const copyCalculatedContext = <T>(from: any, to: T): T => {
  const calculatedContext = getCalculatedContext(from);

  if (calculatedContext && to && typeof to === 'object') {
    calculatedContexts.set(to as object, calculatedContext);
  }

  return to;
};
