// @flow

import type { InputCreator } from '../../flowTypes';

import getMatchingFields from '../../utils/getMatchingFields';
import createThingWhereOneInputType from './createThingWhereOneInputType';

const createThingToCopyWhereOneInputType: InputCreator = (thingConfig) => {
  const { duplexFields, name } = thingConfig;

  const inputName = `${name}CopyWhereOnesInput`;

  if (!duplexFields || !duplexFields.length) {
    return [inputName, '', {}];
  }

  const fieldLines = [];

  const childChain = {};

  duplexFields.forEach(({ name: fieldName, config }) => {
    if (
      getMatchingFields(thingConfig, config).filter((matchingField) => matchingField !== fieldName)
        .length
    ) {
      fieldLines.push(`  ${fieldName}: ${config.name}WhereOneInput`);

      childChain[`${config.name}WhereOneInput`] = [createThingWhereOneInputType, config];
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

export default createThingToCopyWhereOneInputType;
