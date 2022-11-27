// @flow

import type { InputCreator } from '../../flowTypes';

import getMatchingFields from '../../utils/getMatchingFields';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

const createEntityWhereOneToCopyInputType: InputCreator = (entityConfig) => {
  const { duplexFields, name } = entityConfig;

  const inputName = `${name}WhereOneToCopyInput`;

  if (!duplexFields || !duplexFields.length) {
    return [inputName, '', {}];
  }

  const notEmptyResult = duplexFields.some(({ name: name2, oppositeName, config }) => {
    if (
      getMatchingFields(entityConfig, config).filter((matchingField) => matchingField !== name2)
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

  const [, preInputDefinition] = createEntityWhereOneInputType(entityConfig);

  const preInputDefinitionArr = preInputDefinition.split(' ');

  preInputDefinitionArr[1] = inputName;

  return [inputName, preInputDefinitionArr.join(' '), {}];
};

export default createEntityWhereOneToCopyInputType;
