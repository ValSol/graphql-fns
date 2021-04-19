// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeDerivativeUploadFilesToThingMutation from './composeDerivativeUploadFilesToThingMutation';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';

describe('composeDerivativeUploadFilesToThingMutation', () => {
  test('should return correct derivative config', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      file: true,
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

    const result = composeDerivativeUploadFilesToThingMutation(ForCatalog);

    const expectedResult = {
      name: 'uploadFilesToThingForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('uploadFilesToThing')
          ? `uploadFilesTo${name}ForCatalog`
          : '',
      argNames: () => ['whereOne', 'data', 'files', 'options'],
      argTypes: ({ name }) => [
        `${name}WhereOneInput!`,
        `UploadFilesTo${name}Input`,
        '[Upload!]!',
        `FilesOf${name}OptionsInput!`,
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
