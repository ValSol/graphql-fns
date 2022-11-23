// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import uploadThingFilesMutationAttributes from '../../types/actionAttributes/uploadThingFilesMutationAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeUploadThingFilesMutation', () => {
  const imageConfig: ThingConfig = {
    name: 'RootImage',
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

  const ForCatalog: DerivativeAttributes = {
    allow: { RootImage: ['uploadThingFiles'] },
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

  test('should return correct derivative config', () => {
    const result = composeCustomAction(ForCatalog, uploadThingFilesMutationAttributes);

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
