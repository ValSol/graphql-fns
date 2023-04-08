/* eslint-env jest */
import type { GeneralConfig, TangibleEntityConfig } from '../../../tsTypes';

import createCopyManyEntitiesMutationResolver from './index';

describe('createCopyManyEntitiesMutationResolver', () => {
  test('should create mutation add entity type', () => {
    const menuCloneConfig = {} as TangibleEntityConfig;
    const menuSectionConfig = {} as TangibleEntityConfig;
    const menuCloneSectionConfig = {} as TangibleEntityConfig;
    const menuConfig: TangibleEntityConfig = {
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

    const allEntityConfigs = {
      Menu: menuConfig,
      MenuClone: menuCloneConfig,
      MenuSection: menuSectionConfig,
      MenuCloneSection: menuCloneSectionConfig,
    };

    const generalConfig: GeneralConfig = { allEntityConfigs };

    const serversideConfig: Record<string, any> = {};
    const result = createCopyManyEntitiesMutationResolver(
      menuConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof result).toBe('function');
  });
});
