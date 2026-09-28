import type { CalculatedField, Context, ResolverArg, ResolverCreatorArg } from '@/tsTypes';

import getCalculatedFieldCallbacks from '@/resolvers/utils/getCalculatedFieldCallbacks';
import { getCalculatedContext } from '@/resolvers/utils/calculatedContext';

// results of the fallback calculation, so "x" and "xCount" of the same parent run "asyncFunc" once
const fallbackResults = new WeakMap<object, Map<string, Promise<any>>>();

// returns the value synchronously if it is already calculated or the root resolver left the context
const composeCalculatedFieldResolver = (
  { name, async }: CalculatedField,
  resolverCreatorArg: ResolverCreatorArg,
) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;

  const { func, asyncFunc } = getCalculatedFieldCallbacks(
    entityConfig,
    name,
    generalConfig,
    serversideConfig,
  );

  return (parent: any, args: Record<string, any>, context: Context, info: any): any => {
    // calculated at once ("materializeCalculatedFields"), e.g. published by a subscription
    if (Object.prototype.hasOwnProperty.call(parent, name)) {
      return parent[name];
    }

    const calculatedContext = getCalculatedContext(parent);

    // the root resolver calculated "asyncFunc" only for fields of its own entity config, so e.g. an...
    // ... async field added by a representation ("addFields") falls back to the calculation below
    if (calculatedContext && (!async || name in calculatedContext.asyncFuncResults)) {
      const { data, asyncFuncResults, index, resolverArg } = calculatedContext;

      return func(args, data, resolverArg, asyncFuncResults[name], index);
    }

    // the entity was not produced by a root resolver: calculate it like a single-entity action
    const resolverArg = { parent, args, context, info, resolverOptions: {} } as ResolverArg;

    if (!async) {
      return func(args, parent, resolverArg, undefined, 0);
    }

    if (!fallbackResults.has(parent)) {
      fallbackResults.set(parent, new Map());
    }

    const parentResults = fallbackResults.get(parent) as Map<string, Promise<any>>;

    const key = `${name}:${JSON.stringify(args ?? {})}`;

    if (!parentResults.has(key)) {
      parentResults.set(
        key,
        (asyncFunc as NonNullable<typeof asyncFunc>)(args, resolverCreatorArg, resolverArg, parent),
      );
    }

    return (parentResults.get(key) as Promise<any>).then((asyncFuncResult) =>
      func(args, parent, resolverArg, asyncFuncResult, 0),
    );
  };
};

export default composeCalculatedFieldResolver;
