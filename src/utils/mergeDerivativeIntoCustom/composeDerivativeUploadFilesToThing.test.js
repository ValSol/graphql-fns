// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeDerivativeUploadFilesToThing from './composeDerivativeUploadFilesToThing';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';

describe('composeDerivativeUploadFilesToThing', () => {
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
      allow: { uploadFilesToThing: ['Example'] },
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

    const result = composeDerivativeUploadFilesToThing(ForCatalog);

    const expectedResult = {
      name: ({ name }) =>
        ForCatalog.allow.uploadFilesToThing && ForCatalog.allow.uploadFilesToThing.includes(name)
          ? `uploadFilesTo${name}ForCatalog`
          : '',
      argNames: () => ['whereOne', 'data', 'files', 'options'],
      argTypes: ({ name }) => [
        `${name}WhereOneInput!`,
        `UploadFilesTo${name}Input!`,
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
