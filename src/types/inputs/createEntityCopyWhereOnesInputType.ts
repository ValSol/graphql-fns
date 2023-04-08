import type { InputCreator } from '../../tsTypes';

import getMatchingFields from '../../utils/getMatchingFields';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

const createEntityCopyWhereOnesInputType: InputCreator = (entityConfig) => {
  const { name, type: entityType } = entityConfig;

  const inputName = `${name}CopyWhereOnesInput`;

  if (entityType !== 'tangible') {
    return [inputName, '', {}];
  }

  const { duplexFields } = entityConfig;

  if (!duplexFields || !duplexFields.length) {
    return [inputName, '', {}];
  }

  const fieldLines: Array<string> = [];

  const childChain: Record<string, any> = {};

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
