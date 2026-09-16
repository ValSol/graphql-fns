import type { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo, type FieldsByTypeName, type ResolveTree } from 'graphql-parse-resolve-info';

// "graphql-parse-resolve-info" (last published for graphql@<=16) reads
// resolveInfo.variableValues as a flat { [name]: value } map. graphql@17 changed
// GraphQLResolveInfo.variableValues to { sources, coerced }, which breaks that
// package's handling of variable-driven @skip/@include directives (it silently
// treats every such directive as if the variable were undefined).
// This proxy keeps the new shape intact (so graphql@17's own internals, which
// read `.coerced`, keep working) while also answering flat lookups by variable
// name (what the outdated package expects), without needing to patch the
// dependency itself.
const makeGraphql17CompatibleVariableValues = (variableValues: unknown): unknown => {
  if (
    !variableValues ||
    typeof variableValues !== 'object' ||
    !('coerced' in variableValues)
  ) {
    return variableValues;
  }

  const { coerced } = variableValues as { coerced: Record<string, unknown> };

  return new Proxy(variableValues as object, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver);
      }

      return typeof prop === 'string' ? coerced[prop] : undefined;
    },
  });
};

const parseResolveInfoCompat = (
  info: GraphQLResolveInfo,
): ResolveTree | FieldsByTypeName | null | undefined => {
  const compatInfo =
    'variableValues' in info
      ? { ...info, variableValues: makeGraphql17CompatibleVariableValues(info.variableValues) }
      : info;

  return parseResolveInfo(compatInfo as GraphQLResolveInfo);
};

export default parseResolveInfoCompat;
