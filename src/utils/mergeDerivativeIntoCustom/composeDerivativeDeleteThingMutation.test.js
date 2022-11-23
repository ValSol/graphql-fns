// @flow
/* eslint-env jest */

import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import deleteThingMutationAttributes from '../../types/actionAttributes/deleteThingMutationAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeDeleteThingMutation', () => {
  const thingConfig: ThingConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        array: true,
        index: true,
      },
    ],
  };
  const ForCatalog: DerivativeAttributes = {
    allow: { Example: ['deleteThing'] },
    suffix: 'ForCatalog',
    addFields: {
      Example: () => ({
        floatFields: [{ name: 'floatField' }],
      }),
    },
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    thingConfigs: { Example: thingConfig },
    derivative,
  };

  test('should return correct derivative config', () => {
    const result = composeCustomAction(ForCatalog, deleteThingMutationAttributes);

    const expectedResult = {
      name: 'deleteThingForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('deleteThing')
          ? `delete${name}ForCatalog`
          : '',
      argNames: () => ['whereOne'],
      argTypes: ({ name }) => [`${name}ForCatalogWhereOneInput!`],
      type: ({ name }) => `${name}ForCatalog!`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, thingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, thingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
