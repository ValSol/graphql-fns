/* eslint-env jest */
import type { GeneralConfig, TangibleEntityConfig } from '../../../tsTypes';

import createCopyEntityWithChildrenMutationResolver from '.';

describe('createCopyEntityWithChildrenMutationResolver', () => {
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
          type: 'textFields',
        },
      ],

      duplexFields: [
        {
          name: 'clone',
          oppositeName: 'original',
          config: menuCloneConfig,
          parent: true,
          type: 'duplexFields',
        },

        {
          name: 'sections',
          oppositeName: 'menu',
          array: true,
          config: menuSectionConfig,
          parent: true,
          type: 'duplexFields',
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
          type: 'textFields',
        },
      ],

      duplexFields: [
        {
          name: 'original',
          oppositeName: 'clone',
          config: menuConfig,
          type: 'duplexFields',
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
          type: 'textFields',
        },
      ],

      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'sections',
          config: menuConfig,
          type: 'duplexFields',
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
          type: 'textFields',
        },
      ],

      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'sections',
          config: menuCloneConfig,
          type: 'duplexFields',
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
    const result = createCopyEntityWithChildrenMutationResolver(
      menuConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof result).toBe('function');
  });
});
