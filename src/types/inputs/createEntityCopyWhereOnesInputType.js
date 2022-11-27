// @flow

import type { InputCreator } from '../../flowTypes';

import getMatchingFields from '../../utils/getMatchingFields';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

const createEntityCopyWhereOnesInputType: InputCreator = (entityConfig) => {
  const { duplexFields, name } = entityConfig;

  const inputName = `${name}CopyWhereOnesInput`;

  if (!duplexFields || !duplexFields.length) {
    return [inputName, '', {}];
  }

  const fieldLines = [];

  const childChain = {};

  duplexFields.forEach(({ name: fieldName, config }) => {
    if (
      getMatchingFields(entityConfig, config).filter((matchingField) => matchingField !== fieldName)
        .length
    ) {
      fieldLines.push(`  ${fieldName}: ${config.name}WhereOneInput`);

      childChain[`${config.name}WhereOneInput`] = [createEntityWhereOneInputType, config];
    }
  });

  if (!fieldLines.length) {
    return [inputName, '', {}];
  }

  const inputDefinition = `input ${inputName} {
${fieldLines.join('\n')}
}`;

  return [inputName, inputDefinition, childChain];
};

export default createEntityCopyWhereOnesInputType;
