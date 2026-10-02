import type { GeneralConfig, EntityConfig } from '../../../tsTypes';

import createEntityExistencesQueryResolver from '.';

describe('createEntityExistencesQueryResolver', () => {
  const generalConfig: GeneralConfig = { allEntityConfigs: {} };
  test('should create query entity existences resolver', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
        {
          name: 'textField2',
          default: 'default text',
          type: 'textFields',
        },
        {
          name: 'textField3',
          required: true,
          type: 'textFields',
        },
        {
          name: 'textField4',
          array: true,
          type: 'textFields',
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
          type: 'textFields',
        },
      ],
    };
    const serversideConfig: Record<string, any> = {};
    const result = createEntityExistencesQueryResolver(
      entityConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof result).toBe('function');
  });

  test('should check "entityExistencesConcurrency" of serversideConfig', () => {
    const entityConfig: EntityConfig = { name: 'Example', type: 'tangible' };

    [1, 50].forEach((entityExistencesConcurrency) => {
      const result = createEntityExistencesQueryResolver(entityConfig, generalConfig, {
        entityExistencesConcurrency,
      });

      expect(typeof result).toBe('function');
    });

    [0, -1, 2.5, NaN, '10'].forEach((entityExistencesConcurrency) => {
      expect(() =>
        createEntityExistencesQueryResolver(entityConfig, generalConfig, {
          entityExistencesConcurrency,
        } as any),
      ).toThrow(
        `"entityExistencesConcurrency" has to be a positive integer, got: ${entityExistencesConcurrency}!`,
      );
    });
  });
});
