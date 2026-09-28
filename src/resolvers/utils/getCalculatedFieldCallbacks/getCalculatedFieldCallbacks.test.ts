import type { GeneralConfig, RepresentationAttributes, TangibleEntityConfig } from '@/tsTypes';

import getCalculatedFieldCallbacks from '.';

describe('getCalculatedFieldCallbacks', () => {
  const entityConfig: TangibleEntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [{ name: 'text', type: 'textFields' }],
    calculatedFields: [{ name: 'upper', calculatedType: 'textFields', type: 'calculatedFields' }],
  };

  const ForCatalog: RepresentationAttributes = {
    allow: { Example: ['entity'] },
    representationKey: 'ForCatalog',
  };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Example: entityConfig },
    representations: { ForCatalog },
  };

  const representationConfig = { ...entityConfig, name: 'ExampleForCatalog' };

  const rootCallbacks = { func: () => 'root' };
  const ownCallbacks = { func: () => 'own' };

  test('should return callbacks by entity name', () => {
    const result = getCalculatedFieldCallbacks(entityConfig, 'upper', generalConfig, {
      calculatedFields: { Example: { upper: rootCallbacks } },
    });

    expect(result).toBe(rootCallbacks);
  });

  test('should return callbacks of the root entity for a representation config', () => {
    const result = getCalculatedFieldCallbacks(representationConfig, 'upper', generalConfig, {
      calculatedFields: { Example: { upper: rootCallbacks } },
    });

    expect(result).toBe(rootCallbacks);
  });

  test('should prefer callbacks of a representation config', () => {
    const result = getCalculatedFieldCallbacks(representationConfig, 'upper', generalConfig, {
      calculatedFields: {
        Example: { upper: rootCallbacks },
        ExampleForCatalog: { upper: ownCallbacks },
      },
    });

    expect(result).toBe(ownCallbacks);
  });

  test('should throw if callbacks are not found', () => {
    expect(() => getCalculatedFieldCallbacks(entityConfig, 'upper', generalConfig, {})).toThrow(
      'Not found callbacks of calculated field "upper" of entity "Example"',
    );
  });
});
