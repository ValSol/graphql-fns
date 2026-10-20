import type { EntityConfig } from '../tsTypes';

import wildcardIndexFieldKinds from './wildcardIndexFieldKinds';

// fields with "wildcardIndex" are filtered as indexed ones (but not sorted, see "getSortableFieldNames")
const wildcardAsIndexed = <T extends EntityConfig>(entityConfig: T): T =>
  wildcardIndexFieldKinds.reduce<Record<string, any>>(
    (prev, fieldKind) => {
      const fields = prev[fieldKind] as { index?: boolean; wildcardIndex?: boolean }[] | undefined;

      if (fields?.some(({ wildcardIndex }) => wildcardIndex)) {
        prev[fieldKind] = fields.map((field) =>
          field.wildcardIndex ? { ...field, index: true } : field,
        );
      }

      return prev;
    },
    { ...entityConfig },
  ) as T;

export default wildcardAsIndexed;
