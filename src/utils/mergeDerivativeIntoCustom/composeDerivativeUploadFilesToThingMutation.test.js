// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import uploadFilesToThingMutationAttributes from '../../types/actionAttributes/uploadFilesToThingMutationAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeUploadFilesToThingMutation', () => {
  const imageConfig: ThingConfig = {
    name: 'Image',
    type: 'file',
    textFields: [
      {
        name: 'fileId',
      },
      {
        name: 'address',
      },
    ],
  };

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
    fileFields: [
      {
        name: 'logo',
        config: imageConfig,
      },
    ],
  };
  const ForCatalog: DerivativeAttributes = {
    allow: { Example: ['uploadFilesToThing'] },
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

  test('should return correct derivative config', () => {
    const result = composeCustomAction(ForCatalog, uploadFilesToThingMutationAttributes);

    const expectedResult = {
      name: 'uploadFilesToThingForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('uploadFilesToThing')
          ? `uploadFilesTo${name}ForCatalog`
          : '',
      argNames: () => ['whereOne', 'data', 'files', 'options'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereOneInput!`,
        `UploadFilesTo${name}ForCatalogInput`,
        '[Upload!]!',
        `FilesOf${name}ForCatalogOptionsInput!`,
      ],
      type: ({ name }) => `${name}ForCatalog!`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, thingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, thingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
