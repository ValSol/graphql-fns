/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../tsTypes';

import composeDerivativeConfigByName from './composeDerivativeConfigByName';

describe('composeDerivativeConfigByName', () => {
  test('should return correct derivative config', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const ForCatalog: DerivativeAttributes = {
      allow: { Example: ['entity', 'entities'] },
      derivativeKey: 'ForCatalog',
      addFields: {
        Example: {
          floatFields: [{ name: 'floatField' }],
        },
      },
    };

    const derivative = { ForCatalog };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
      derivative,
    };

    const result = composeDerivativeConfigByName('ForCatalog', entityConfig, generalConfig);

    const expectedResult = {
      name: 'ExampleForCatalog',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
      floatFields: [
        {
          name: 'floatField',
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
