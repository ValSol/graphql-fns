import type { TangibleEntityConfig } from '../tsTypes';

import wildcardAsIndexed from './wildcardAsIndexed';

describe('wildcardAsIndexed', () => {
  test('should mark fields with "wildcardIndex" as indexed', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      counter: true,
      textFields: [
        { name: 'title', type: 'textFields' },
        { name: 'code', wildcardIndex: true, type: 'textFields' },
      ],
      intFields: [{ name: 'rank', index: true, type: 'intFields' }],
    };

    const result = wildcardAsIndexed(entityConfig);

    expect(result).toEqual({
      ...entityConfig,
      textFields: [
        { name: 'title', type: 'textFields' },
        { name: 'code', index: true, wildcardIndex: true, type: 'textFields' },
      ],
    });

    // the config itself is not changed
    expect(entityConfig.textFields?.[1]).toEqual({
      name: 'code',
      wildcardIndex: true,
      type: 'textFields',
    });
    expect(result.intFields).toBe(entityConfig.intFields);
  });
});
