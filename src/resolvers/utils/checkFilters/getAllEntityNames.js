// @flow

import type { GeneralConfig } from '../../../flowTypes';

import composeDerivativeConfigName from '../../../utils/composeDerivativeConfig/composeDerivativeConfigName';

const tangibleTypes = ['tangible', 'tangibleFile'];

const getAllEntityNames = (generalConfig: GeneralConfig): Array<string> => {
  const { allEntityConfigs, derivative = {} } = generalConfig;

  const allEntityNames = Object.keys(allEntityConfigs).filter((name) => {
    const { type: entityType } = allEntityConfigs[name];
    return tangibleTypes.includes(entityType);
  });

  Object.keys(derivative).reduce((prev, derivativeKey) => {
    const { allow } = derivative[derivativeKey];

    Object.keys(allow).forEach((entityName) => {
      const { derivativeNameSlicePosition } = allEntityConfigs[entityName];

      prev.push(
        composeDerivativeConfigName(entityName, derivativeKey, derivativeNameSlicePosition),
      );
    });

    return prev;
  }, allEntityNames);

  return allEntityNames;
};
export default getAllEntityNames;
