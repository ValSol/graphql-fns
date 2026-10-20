import type { EntityConfig } from '../tsTypes';

import wildcardIndexFieldKinds from '../utils/wildcardIndexFieldKinds';

// "wildcardProjection" of the root wildcard index: the fields with "wildcardIndex"
const composeWildcardProjection = (entityConfig: EntityConfig): Record<string, 1> =>
  wildcardIndexFieldKinds.reduce<Record<string, 1>>((prev, fieldKind) => {
    const fields = ((entityConfig as Record<string, any>)[fieldKind] || []) as {
      name: string;
      wildcardIndex?: boolean;
    }[];

    fields
      .filter(({ wildcardIndex }) => wildcardIndex)
      .forEach(({ name }) => {
        prev[name] = 1;
      });

    return prev;
  }, {});

export default composeWildcardProjection;
