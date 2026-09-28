import type { SimplifiedEntityConfig } from '@/tsTypes';

import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import testSubscriptionNode from './testSubscriptionNode';

describe('testSubscriptionNode', () => {
  const simplifiedEntityConfigs: SimplifiedEntityConfig[] = [
    { name: 'Tag', type: 'embedded', textFields: [{ name: 'label' }] },
    { name: 'Summary', type: 'virtual', textFields: [{ name: 'text' }] },
    {
      name: 'Doc',
      textFields: [{ name: 'title' }],
      calculatedFields: [
        {
          name: 'mainTag',
          calculatedType: 'embeddedFields',
          configName: 'Tag',
        } as any,
        {
          name: 'summary',
          calculatedType: 'virtualFields',
          configName: 'Summary',
        } as any,
      ],
    },
  ];

  const { Doc: entityConfig } = composeAllEntityConfigs(simplifiedEntityConfigs);

  test('should filter by calculated embedded field', () => {
    const node = { title: 'x', mainTag: { label: 'news' }, summary: { text: 'short' } };

    expect(
      testSubscriptionNode([node], { mainTag: { label: 'news' } }, {} as any, entityConfig),
    ).toBe(true);

    expect(
      testSubscriptionNode([node], { mainTag: { label: 'sport' } }, {} as any, entityConfig),
    ).toBe(false);
  });
});
