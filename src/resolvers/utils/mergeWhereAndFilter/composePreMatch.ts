import deepEqual from 'fast-deep-equal';

import type { LookupMongoDB } from '@/tsTypes';

type Condition = Record<string, any>;

const isLookupPath = (path: string, lookupFields: string[]) =>
  lookupFields.includes(path.split('.')[0]);

const touchesLookup = (condition: Condition, lookupFields: string[]): boolean =>
  Object.keys(condition).some((key) => {
    switch (key) {
      case '$and':
      case '$or':
      case '$nor':
        return (condition[key] as Condition[]).some((item) => touchesLookup(item, lookupFields));

      default:
        if (key.startsWith('$')) {
          throw new TypeError(`Got unknown operator "${key}" in composed where!`);
        }

        return isLookupPath(key, lookupFields);
    }
  });

// adds the conjunct "{ [key]: value }" to "target" without losing a conjunct already there
const addConjunct = (target: Condition, key: string, value: any) => {
  if (!(key in target)) {
    target[key] = value;
  } else if (key === '$and') {
    target.$and = [...target.$and, ...value];
  } else if (!deepEqual(target[key], value)) {
    target.$and = [...(target.$and || []), { [key]: value }];
  }
};

const composePreMatchRecursively = (condition: Condition, lookupFields: string[]): Condition => {
  const result: Condition = {};

  Object.keys(condition).forEach((key) => {
    switch (key) {
      case '$and': {
        const items = (condition.$and as Condition[])
          .map((item) => composePreMatchRecursively(item, lookupFields))
          .filter((item) => Object.keys(item).length > 0);

        if (items.length > 0) {
          addConjunct(result, '$and', items);
        }

        break;
      }

      case '$or': {
        const branches = (condition.$or as Condition[]).map((item) =>
          composePreMatchRecursively(item, lookupFields),
        );

        // a branch without local conditions may match any document before the lookups
        if (branches.length === 0 || branches.some((branch) => Object.keys(branch).length === 0)) {
          break;
        }

        const [firstBranch, ...restBranches] = branches;

        const commonKeys = Object.keys(firstBranch).filter((key2) =>
          restBranches.every(
            (branch) => key2 in branch && deepEqual(branch[key2], firstBranch[key2]),
          ),
        );

        commonKeys.forEach((key2) => addConjunct(result, key2, firstBranch[key2]));

        const restOfBranches = branches.reduce<Condition[]>((prev, branch) => {
          const rest = Object.keys(branch).reduce<Condition>((prev2, key2) => {
            if (!commonKeys.includes(key2)) {
              prev2[key2] = branch[key2];
            }

            return prev2;
          }, {});

          if (!prev.some((item) => deepEqual(item, rest))) {
            prev.push(rest);
          }

          return prev;
        }, []);

        // an empty rest is always true so the whole "$or" is always true too
        if (restOfBranches.every((branch) => Object.keys(branch).length > 0)) {
          addConjunct(result, '$or', restOfBranches);
        }

        break;
      }

      case '$nor':
        // dropping a term inside a negation makes the condition stronger so drop the whole "$nor"
        if (!touchesLookup({ $nor: condition.$nor }, lookupFields)) {
          addConjunct(result, '$nor', condition.$nor);
        }

        break;

      default:
        if (key.startsWith('$')) {
          throw new TypeError(`Got unknown operator "${key}" in composed where!`);
        }

        if (!isLookupPath(key, lookupFields)) {
          addConjunct(result, key, condition[key]);
        }
    }
  });

  return result;
};

// returns the necessary condition of "where" that can be checked before "lookups":
// every document that matches "where" matches the result
const composePreMatch = (where: Condition, lookups: LookupMongoDB[]): Condition | null => {
  if (lookups.length === 0) return null;

  const lookupFields = lookups.map(({ $lookup: { as } }) => as);

  const preMatch = composePreMatchRecursively(where, lookupFields);

  return Object.keys(preMatch).length > 0 ? preMatch : null;
};

export default composePreMatch;
