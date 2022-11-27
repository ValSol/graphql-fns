// @flow
/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

import createCopyEntityMutationResolver from './index';

describe('createCopyEntityMutationResolver', () => {
  test('should create mutation add entity type', () => {
    const menuCloneConfig: EntityConfig = {};
    const menuSectionConfig: EntityConfig = {};
    const menuCloneSectionConfig: EntityConfig = {};
    const menuConfig: EntityConfig = {
      name: 'Menu',
      type: 'tangible',

      textFields: [
        {
          name: 'name',
          required: true,
        },
      ],

      duplexFields: [
        {
          name: 'clone',
          oppositeName: 'original',
          config: menuCloneConfig,
          parent: true,
        },

        {
          name: 'sections',
          oppositeName: 'menu',
          array: true,
          config: menuSectionConfig,
          parent: true,
        },
      ],
    };

    Object.assign(menuCloneConfig, {
      name: 'MenuClone',
      type: 'tangible',

      textFields: [
        {
          name: 'name',
          required: true,
        },
      ],

      duplexFields: [
        {
          name: 'original',
          oppositeName: 'clone',
          config: menuConfig,
        },

        {
          name: 'sections',
          oppositeName: 'menu',
          array: true,
          config: menuCloneSectionConfig,
          parent: true,
        },
      ],
    });

    Object.assign(menuSectionConfig, {
      name: 'MenuSection',
      type: 'tangible',

      textFields: [
        {
          name: 'name',
          required: true,
        },
      ],

      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'sections',
          config: menuConfig,
        },
      ],
    });

    Object.assign(menuCloneSectionConfig, {
      name: 'MenuCloneSection',
      type: 'tangible',

      textFields: [
        {
          name: 'name',
          required: true,
        },
      ],

      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'sections',
          config: menuCloneConfig,
        },
      ],
    });

    const entityConfigs = {
      Menu: menuConfig,
      MenuClone: menuCloneConfig,
      MenuSection: menuSectionConfig,
      MenuCloneSection: menuCloneSectionConfig,
    };

    const generalConfig: GeneralConfig = { entityConfigs };

    const serversideConfig = {};
    const result = createCopyEntityMutationResolver(menuConfig, generalConfig, serversideConfig);

    expect(typeof result).toBe('function');
  });
});
