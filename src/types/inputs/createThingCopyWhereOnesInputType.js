// @flow

import type { InputCreator } from '../../flowTypes';

import createThingWhereOneInputType from './createThingWhereOneInputType';
import getMatchingFields from './getMatchingFields';

const createThingToCopyWhereOneInputType: InputCreator = (thingConfig) => {
  const { duplexFields, name } = thingConfig;

  const inputName = `${name}CopyWhereOnesInput`;

  if (!duplexFields || !duplexFields.length) {
    return [inputName, '', {}];
  }

  const fieldLines = [];

  const childChain = {};

  duplexFields.forEach(({ name: fieldName, config }) => {
    if (getMatchingFields(thingConfig, config).length) {
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
