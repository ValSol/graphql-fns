// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import entityFileQueryAttributes from '../../types/actionAttributes/entityFileQueryAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeEntityFileQuery', () => {
  const entityConfig: EntityConfig = {
    name: 'TangiblePhoto',
    type: 'tangibleFile',
    textFields: [
      {
        name: 'textField',
        index: true,
      },
    ],
  };
  const ForCatalog: DerivativeAttributes = {
    allow: { TangiblePhoto: ['entityFile'] },
    suffix: 'ForCatalog',
    TangiblePhoto: {
      floatFields: [{ name: 'floatField' }],
    },
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    entityConfigs: { TangiblePhoto: entityConfig },
    derivative,
  };

  test('should return correct derivative config', () => {
    const result = composeCustomAction(ForCatalog, entityFileQueryAttributes);

    const expectedResult = {
      name: 'entityFileForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entityFile')
          ? `${name}FileForCatalog`
          : '',
      argNames: () => ['whereOne'],
      argTypes: () => ['FileWhereOneInput!'],
      type: ({ name }) => `${name}ForCatalog!`,
      config: (entityConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, entityConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, entityConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
