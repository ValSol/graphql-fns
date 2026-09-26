import { Types } from 'mongoose';

import type { SimplifiedEntityConfig, TangibleEntityConfig } from '@/tsTypes';
import type { PreparedData } from '@/resolvers/tsTypes';

import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import processCreateInputData from '.';

describe('processCreateInputData for "push" into duplex field with required opposite', () => {
  test('should fill opposite field of created children with id of the parent', () => {
    const simplifiedEntityConfigs: SimplifiedEntityConfig[] = [
      {
        name: 'Menu',
        textFields: [{ name: 'title' }],
        duplexFields: [
          { name: 'sections', array: true, oppositeName: 'menu', configName: 'Section' },
        ],
      },
      {
        name: 'Section',
        textFields: [{ name: 'title' }],
        duplexFields: [
          { name: 'menu', oppositeName: 'sections', configName: 'Menu', required: true },
        ],
      },
    ];

    const { Menu: menuConfig, Section: sectionConfig } =
      composeAllEntityConfigs(simplifiedEntityConfigs);

    const menuId = new Types.ObjectId();

    const preparedData: PreparedData = { mains: [], core: new Map(), periphery: new Map() };

    // "menu" is absent in created section (as "SectionCreateThru_menu_FieldInput" allows)
    const { core } = processCreateInputData(
      { id: menuId, sections: { create: [{ title: 'Section 1' }] } },
      preparedData,
      menuConfig as TangibleEntityConfig,
      'push',
    );

    const [
      {
        insertOne: { document: section },
      },
    ] = core.get(sectionConfig as TangibleEntityConfig) as any;

    expect(section.title).toBe('Section 1');
    expect(section.menu).toEqual(menuId);
  });
});
