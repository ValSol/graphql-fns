import type { InputCreator } from '../../tsTypes';

import getMatchingFields from '../../utils/getMatchingFields';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

// "whereTarget" arg of "copy…" mutations uses "XWhereOneInput", but only if some duplex field...
// ... (with common fields) has array opposite field, i.e. existing X can be selected as copy target
const createEntityWhereTargetInputType: InputCreator = (entityConfig) => {
  const { name, type: entityType } = entityConfig;

  const inputName = `${name}WhereOneInput`;

  if (entityType !== 'tangible') {
    return [inputName, '', {}];
  }
  const { duplexFields = [] } = entityConfig;

  if (!duplexFields.length) {
    return [inputName, '', {}];
  }

  const notEmptyResult = duplexFields.some(({ name: name2, oppositeName, config }) => {
    if (
      getMatchingFields(entityConfig, config).filter((matchingField) => matchingField !== name2)
        .length
    ) {
      const oppositeField = config.duplexFields.find(({ name: name3 }) => name3 === oppositeName);

      return oppositeField && oppositeField.array;
    }

    return false;
  });

  if (!notEmptyResult) return [inputName, '', {}];

  return createEntityWhereOneInputType(entityConfig);
};

export default createEntityWhereTargetInputType;
