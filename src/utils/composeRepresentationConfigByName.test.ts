import type { RepresentationAttributes, GeneralConfig, EntityConfig } from '../tsTypes';

import composeRepresentationConfigByName from './composeRepresentationConfigByName';

describe('composeRepresentationConfigByName', () => {
  test('should return correct representation config', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
      ],
    };
    const ForCatalog: RepresentationAttributes = {
      allow: { Example: ['entity', 'entities'] },
      representationKey: 'ForCatalog',
      addFields: {
        Example: {
          floatFields: [{ name: 'floatField' }],
        },
      },
    };

    const representations = { ForCatalog };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
      representations,
    };

    const result = composeRepresentationConfigByName('ForCatalog', entityConfig, generalConfig);

    const expectedResult = {
      name: 'ExampleForCatalog',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
      ],
      floatFields: [
        {
          name: 'floatField',
          type: 'floatFields',
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
