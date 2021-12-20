// @flow

import type { InputCreator } from '../../flowTypes';

import getMatchingFields from '../../utils/getMatchingFields';
import createThingWhereOneInputType from './createThingWhereOneInputType';

const createThingWhereOneToCopyInputType: InputCreator = (thingConfig) => {
  const { duplexFields, name } = thingConfig;

  const inputName = `${name}WhereOneToCopyInput`;

  if (!duplexFields || !duplexFields.length) {
    return [inputName, '', {}];
  }

  const notEmptyResult = duplexFields.some(({ name: name2, oppositeName, config }) => {
    if (
      getMatchingFields(thingConfig, config).filter((matchingField) => matchingField !== name2)
        .length
    ) {
      const oppositeField = (config.duplexFields || []).find(
        ({ name: name3 }) => name3 === oppositeName,
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
