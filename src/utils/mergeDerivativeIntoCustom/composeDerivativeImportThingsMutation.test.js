// @flow
/* eslint-env jest */

import pluralize from 'pluralize';

import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeDerivativeImportThingsMutation from './composeDerivativeImportThingsMutation';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';

describe('composeDerivativeImportThingsMutation', () => {
  test('should return correct derivative config', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          array: true,
          index: true,
        },
      ],
    };
    const ForCatalog: DerivativeAttributes = {
      allow: { importThings: ['Example'] },
      suffix: 'ForCatalog',
      config: (config) => ({
        ...config,
        floatFields: [{ name: 'floatField' }],
      }),
    };

    const derivative = { ForCatalog };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: thingConfig },
      derivative,
    };

    const result = composeDerivativeImportThingsMutation(ForCatalog);

    const expectedResult = {
      name: ({ name }) =>
        ForCatalog.allow.importThings && ForCatalog.allow.importThings.includes(name)
          ? `import${pluralize(name)}ForCatalog`
          : '',
      argNames: () => ['file', 'options'],
      argTypes: () => ['Upload!', 'ImportOptionsInput'],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, thingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, thingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
