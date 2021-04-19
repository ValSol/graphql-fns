// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeDerivativeThingFileCountQuery from './composeDerivativeThingFileCountQuery';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';

describe('composeDerivativeThingFileCountQuery', () => {
  test('should return correct derivative config', () => {
    const thingConfig: ThingConfig = {
      name: 'Photo',
      file: true,
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const ForCatalog: DerivativeAttributes = {
      allow: { Photo: ['thingFileCount'] },
      suffix: 'ForCatalog',
      Photo: {
        floatFields: [{ name: 'floatField' }],
      },
    };

    const derivative = { ForCatalog };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Photo: thingConfig },
      derivative,
    };

    const result = composeDerivativeThingFileCountQuery(ForCatalog);

    const expectedResult = {
      name: 'thingFileCount',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('thingFileCount')
          ? `${name}FileCountForCatalog`
          : '',
      argNames: () => ['where'],
      argTypes: () => ['FileWhereInput'],
      type: ({ name }) => `${name}ForCatalog`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, thingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, thingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
