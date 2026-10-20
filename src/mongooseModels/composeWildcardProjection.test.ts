import type { TangibleEntityConfig } from '../tsTypes';

import composeWildcardProjection from './composeWildcardProjection';

describe('composeWildcardProjection', () => {
  test('should compose projection of the fields with "wildcardIndex"', () => {
    const ownerConfig = {} as TangibleEntityConfig;

    Object.assign(ownerConfig, {
      name: 'Owner',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
    });

    const entityConfig: TangibleEntityConfig = {
      name: 'Item',
      type: 'tangible',
      textFields: [
        { name: 'title', index: true, type: 'textFields' },
        { name: 'code', wildcardIndex: true, type: 'textFields' },
      ],
      intFields: [{ name: 'rank', array: true, wildcardIndex: true, type: 'intFields' }],
      booleanFields: [{ name: 'active', index: true, wildcardIndex: true, type: 'booleanFields' }],
      relationalFields: [
        {
          name: 'owner',
          oppositeName: 'items',
          config: ownerConfig,
          wildcardIndex: true,
          type: 'relationalFields',
        },
      ],
    };

    expect(composeWildcardProjection(entityConfig)).toEqual({
      code: 1,
      rank: 1,
      active: 1,
      owner: 1,
    });
  });

  test('should compose empty projection without "wildcardIndex" fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Item',
      type: 'tangible',
      textFields: [{ name: 'title', index: true, type: 'textFields' }],
    };

    expect(composeWildcardProjection(entityConfig)).toEqual({});
  });
});
