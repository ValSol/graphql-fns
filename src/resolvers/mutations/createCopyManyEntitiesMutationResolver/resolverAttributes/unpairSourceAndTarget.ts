import type { GraphqlObject } from '../../../../tsTypes';

type Item = { whereKeyToSource: GraphqlObject; whereTarget?: GraphqlObject; data?: GraphqlObject };

const isSet = (value: unknown) => value !== undefined && value !== null;

// "copyManyXs" ("sourceAndTargetAndData") & "copyManyXsWithChildren" ("sourceAndTarget") get items...
// ... with paired inputs ("sourceAndCompoundTarget…" is already replaced, see "normalizeWhereCompoundOne");
// returns null if args are not of the "copyMany…" mutations
const unpairSourceAndTarget = (
  args: GraphqlObject,
): null | {
  whereKeyToSource: GraphqlObject[];
  whereTarget?: GraphqlObject[];
  data: GraphqlObject[];
} => {
  const items = (args.sourceAndTargetAndData || args.sourceAndTarget) as undefined | Item[];

  if (!items) return null;

  const targetCount = items.filter(({ whereTarget }) => isSet(whereTarget)).length;

  // existing entities are updated or new entities are created for all items at once
  if (targetCount && targetCount !== items.length) {
    throw new TypeError('Expected "whereTarget" in every item or in none of them!');
  }

  return {
    whereKeyToSource: items.map(({ whereKeyToSource }) => whereKeyToSource),
    ...(targetCount ? { whereTarget: items.map(({ whereTarget }) => whereTarget!) } : {}),
    data: items.map(({ data }) => data || {}),
  };
};

export default unpairSourceAndTarget;
