// @flow

import type { InputCreator } from '../../flowTypes';

import createThingWhereOneInputType from './createThingWhereOneInputType';
import getMatchingFields from './getMatchingFields';

const createThingWhereOneToCopyInputType: InputCreator = (thingConfig) => {
  const { duplexFields, name } = thingConfig;

  const inputName = `${name}WhereOneToCopyInput`;

  if (!duplexFields || !duplexFields.length) {
    return [inputName, '', {}];
  }

  const notEmptyResult = duplexFields.some(({ oppositeName, config }) => {
    if (getMatchingFields(thingConfig, config).length) {
      const oppositeField = (config.duplexFields || []).find(
        ({ name: name2 }) => name2 === oppositeName,
      );

      return oppositeField && oppositeField.array;
    }

    return false;
  });

  if (!notEmptyResult) return [inputName, '', {}];

  const [, preInputDefinition] = createThingWhereOneInputType(thingConfig);

  const preInputDefinitionArr = preInputDefinition.split(' ');

  preInputDefinitionArr[1] = inputName;

  return [inputName, preInputDefinitionArr.join(' '), {}];
};

export default createThingWhereOneToCopyInputType;
