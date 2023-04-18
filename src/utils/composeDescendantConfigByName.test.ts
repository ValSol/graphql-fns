/* eslint-env jest */
import type { DescendantAttributes, GeneralConfig, EntityConfig } from '../tsTypes';

import composeDescendantConfigByName from './composeDescendantConfigByName';

describe('composeDescendantConfigByName', () => {
  test('should return correct descendant config', () => {
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
    const ForCatalog: DescendantAttributes = {
      allow: { Example: ['entity', 'entities'] },
      descendantKey: 'ForCatalog',
      addFields: {
        Example: {
          floatFields: [{ name: 'floatField' }],
        },
      },
    };

    const descendant = { ForCatalog };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
      descendant,
    };

    const result = composeDescendantConfigByName('ForCatalog', entityConfig, generalConfig);

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
