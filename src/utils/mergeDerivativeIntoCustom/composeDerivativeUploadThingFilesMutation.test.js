// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeDerivativeUploadThingFilesMutation from './composeDerivativeUploadThingFilesMutation';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';

describe('composeDerivativeUploadThingFilesMutation', () => {
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

    const ForCatalog: DerivativeAttributes = {
      allow: { Image: ['uploadThingFiles'] },
      suffix: 'ForCatalog',
      Example: {
        floatFields: [{ name: 'floatField' }],
      },
    };

    const derivative = { ForCatalog };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: imageConfig },
      derivative,
    };

    const result = composeDerivativeUploadThingFilesMutation(ForCatalog);

    const expectedResult = {
      name: 'uploadThingFilesForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('uploadThingFiles')
          ? `upload${name}FilesForCatalog`
          : '',
      argNames: () => ['files', 'hashes'],
      argTypes: () => ['[Upload!]!', '[String!]!'],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, imageConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, imageConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
