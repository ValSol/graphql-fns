// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeDerivativeThingQuery from './composeDerivativeThingQuery';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';

describe('composeDerivativeThingQuery', () => {
  test('should return correct derivative config', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const ForCatalog: DerivativeAttributes = {
      allow: { Example: ['thing', 'things'] },
      suffix: 'ForCatalog',
      Example: {
        floatFields: [{ name: 'floatField' }],
      },
    };

    const derivative = { ForCatalog };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: thingConfig },
      derivative,
    };

    const result = composeDerivativeThingQuery(ForCatalog);

    const expectedResult = {
      name: 'thing',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('thing')
          ? `${name}ForCatalog`
          : '',
      argNames: () => ['whereOne'],
      argTypes: ({ name }) => [`${name}WhereOneInput`],
      type: ({ name }) => `${name}ForCatalog`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, thingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, thingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
