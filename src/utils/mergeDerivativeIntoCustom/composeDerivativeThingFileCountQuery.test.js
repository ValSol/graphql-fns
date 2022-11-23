// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import thingFileCountQueryAttributes from '../../types/actionAttributes/thingFileCountQueryAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeThingFileCountQuery', () => {
  const thingConfig: ThingConfig = {
    name: 'RootPhoto',
    type: 'file',
    textFields: [
      {
        name: 'textField',
        index: true,
      },
    ],
  };

  const ForCatalog: DerivativeAttributes = {
    allow: { RootPhoto: ['thingFileCount'] },
    suffix: 'ForCatalog',
    RootPhoto: {
      floatFields: [{ name: 'floatField' }],
    },
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    thingConfigs: { RootPhoto: thingConfig },
    derivative,
  };

  test('should return correct derivative config', () => {
    const result = composeCustomAction(ForCatalog, thingFileCountQueryAttributes);

    const expectedResult = {
      name: 'thingFileCountForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('thingFileCount')
          ? `${name}FileCountForCatalog`
          : '',
      argNames: () => ['where'],
      argTypes: () => ['FileWhereInput'],
      type: () => 'Int!',
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, thingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, thingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
