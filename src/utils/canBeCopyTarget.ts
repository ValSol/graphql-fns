import type { EntityConfig } from '@/tsTypes';

import getMatchingFields from '@/utils/getMatchingFields';

// existing X can be selected as target of "copy…" mutations ("whereTarget" arg) only if some duplex...
// ... field (with common fields to copy) has array opposite field
const canBeCopyTarget = (entityConfig: EntityConfig): boolean => {
  if (entityConfig.type !== 'tangible') return false;

  const { duplexFields = [] } = entityConfig;

  return duplexFields.some(({ name, oppositeName, config }) => {
    if (!getMatchingFields(entityConfig, config).some((fieldName) => fieldName !== name)) {
      return false;
    }

    const oppositeField = config.duplexFields.find(({ name: name2 }) => name2 === oppositeName);

    return Boolean(oppositeField?.array);
  });
};

export default canBeCopyTarget;
