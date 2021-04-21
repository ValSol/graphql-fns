// @flow

import type { DerivativeAttributes } from '../flowTypes';

type Result = { [derivativeName: string]: DerivativeAttributes };

const actionGenericNames = [
  'thing',
  'thingCount',
  'thingDistinctValues',
  'things',
  'thingFileCount',
  'thingFile',
  'thingFiles',
  'createThing',
  'createManyThings',
  'deleteThing',
  'importThings',
  'pushIntoThing',
  'updateThing',
  'uploadFilesToThing',
  'uploadThingFiles',
];

const composeDerivative = (derivativeAttributesArray: Array<DerivativeAttributes>): Result => {
  const result = derivativeAttributesArray.reduce((prev, item) => {
    const { suffix } = item;
    if (!suffix) {
      throw new TypeError('Derivative attributes must have suffix!');
    }
    if (prev[suffix]) {
      throw new TypeError(`Unique derivative attributes suffix: "${suffix}" is used twice!`);
    }

    prev[suffix] = item; // eslint-disable-line no-param-reassign

    return prev;
  }, {});

  // *** check derivativeFields correctness

  const derivativeKeys = Object.keys(result);

  derivativeAttributesArray.forEach(({ allow, derivativeFields, suffix }) => {
    Object.keys(allow).forEach((key) => {
      allow[key].forEach((actionGenericName) => {
        if (!actionGenericNames.includes(actionGenericName)) {
          throw new TypeError(`Incorrect action generic name: "${actionGenericName}"!`);
        }
      });
    });
    if (derivativeFields) {
      Object.keys(derivativeFields).forEach((thingName) => {
        const thingDerivativeFields = derivativeFields[thingName];
        Object.keys(thingDerivativeFields).forEach((fieldName) => {
          if (!derivativeKeys.includes(thingDerivativeFields[fieldName])) {
            throw new TypeError(
              `Incorrect derivative suffix: "${thingDerivativeFields[fieldName]}" for derivativeField: "${fieldName}" for thingName: "${thingName}" in derivative: "${suffix}"`,
            );
          }
        });
      });
    }
  });

  // ***

  return result;
};

export default composeDerivative;
