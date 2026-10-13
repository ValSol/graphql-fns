import type { EntityConfig } from '@/tsTypes';

import checkWhereCompoundOne from '@/resolvers/utils/checkWhereCompoundOne';

// check "whereOne" & "whereCompoundOne" args that select exactly one entity (as in "entity" query)
const checkWhereOneArgs = (
  whereOne: undefined | null | Record<string, any>,
  whereCompoundOne: undefined | null | Record<string, any>,
  entityConfig: EntityConfig,
): void => {
  if (whereCompoundOne && whereOne) {
    throw new TypeError('Expected exactly one input from "whereCompoundOne" && "whereOne"!');
  }

  if (whereOne) {
    const whereOneKeys = Object.keys(whereOne);

    if (whereOneKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in whereOne arg!');
    }

    return;
  }

  if (!whereCompoundOne) {
    throw new TypeError('Expected "whereCompoundOne" or "whereOne" input!');
  }

  checkWhereCompoundOne(whereCompoundOne, entityConfig);
};

export default checkWhereOneArgs;
