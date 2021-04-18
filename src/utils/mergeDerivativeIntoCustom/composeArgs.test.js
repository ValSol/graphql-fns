// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeArgs from './composeArgs';

describe('composeArgs', () => {
  test('should return correct args', () => {
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
      allow: { Example: ['createThing'] },
      suffix: 'ForCatalog',
      Example: {
        floatFields: [{ name: 'floatField' }],
      },
    };

    const derivative = { ForCatalog };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Image: imageConfig, Example: thingConfig },
      derivative,
    };

    const nameGenerators = [() => 'where', () => 'sort', () => 'near', () => 'page'];
    const predicates = [() => 'aaa', () => 'bbb', () => false, () => 'ccc'];

    const result = composeArgs(
      nameGenerators,
      predicates,
      'ForCatalog',
    )(thingConfig, generalConfig);

    const expectedResult = ['where', 'sort', 'page'];

    expect(result).toEqual(expectedResult);
  });
});
