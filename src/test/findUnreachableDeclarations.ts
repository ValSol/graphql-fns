import {
  buildASTSchema,
  getNamedType,
  isInputObjectType,
  isInterfaceType,
  isSpecifiedScalarType,
  isObjectType,
  isUnionType,
  parse,
} from 'graphql';
import type { GraphQLNamedType } from 'graphql';

// declared by every schema on purpose (see "composeCommonUseTypes" & "commonInputTypes" of "fillInputDicForCustom")
const commonNames = [
  'DateTime',
  'Node',
  'RegExp',
  'SliceInput',
  'GeospatialPointInput',
  'GeospatialPolygonRingInput',
  'GeospatialPolygonInput',
  'GeospatialMultiPolygonInput',
];

// test helper: names of types, inputs, enums, interfaces & scalars declared in "typeDefs" ...
// ... but not reachable from "Query", "Mutation", "Subscription" or the types implementing "Node"

const findUnreachableDeclarations = (typeDefs: string): string[] => {
  const schema = buildASTSchema(parse(typeDefs));
  const typeMap = schema.getTypeMap();

  const reached = new Set<string>();

  const visit = (type?: GraphQLNamedType | null) => {
    if (!type || reached.has(type.name)) return;

    reached.add(type.name);

    if (isObjectType(type) || isInterfaceType(type)) {
      type.getInterfaces().forEach(visit);

      Object.values(type.getFields()).forEach(({ type: fieldType, args }) => {
        visit(getNamedType(fieldType));

        args.forEach((arg) => visit(getNamedType(arg.type)));
      });
    }

    if (isInterfaceType(type)) {
      schema.getImplementations(type).objects.forEach(visit);
      schema.getImplementations(type).interfaces.forEach(visit);
    }

    if (isUnionType(type)) type.getTypes().forEach(visit);

    if (isInputObjectType(type)) {
      Object.values(type.getFields()).forEach(({ type: fieldType }) =>
        visit(getNamedType(fieldType)),
      );
    }
  };

  visit(schema.getQueryType());
  visit(schema.getMutationType());
  visit(schema.getSubscriptionType());

  const node = schema.getType('Node');
  if (node) visit(node);

  return Object.keys(typeMap).filter(
    (name) =>
      !name.startsWith('__') &&
      !isSpecifiedScalarType(typeMap[name]) &&
      !reached.has(name) &&
      !commonNames.includes(name) &&
      // enums of "generalConfig.enums" are declared in any case (to be used by manually created actions)
      !name.endsWith('Enumeration'),
  );
};

export default findUnreachableDeclarations;
