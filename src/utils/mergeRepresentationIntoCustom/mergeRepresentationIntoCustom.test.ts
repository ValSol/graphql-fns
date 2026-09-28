import type { GeneralConfig } from '@/tsTypes';

import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import mergeRepresentationIntoCustom from './index';

describe('mergeRepresentationIntoCustom', () => {
  const allEntityConfigs = composeAllEntityConfigs([
    { name: 'Example', textFields: [{ name: 'title' }] },
  ]);

  const representations = {
    ForView: { representationKey: 'ForView', allow: { Example: ['createdEntity' as const] } },
  };

  test('should forbid custom subscriptions', () => {
    const generalConfig = {
      allEntityConfigs,
      custom: { Subscription: {} },
    } as unknown as GeneralConfig;

    expect(() => mergeRepresentationIntoCustom(generalConfig)).toThrow(
      'Custom subscriptions are not supported',
    );

    expect(() =>
      mergeRepresentationIntoCustom({ ...generalConfig, representations } as GeneralConfig),
    ).toThrow('Custom subscriptions are not supported');
  });

  test('should keep representation subscriptions', () => {
    const result = mergeRepresentationIntoCustom({
      allEntityConfigs,
      custom: { Query: {} },
      representations,
    } as GeneralConfig);

    expect(Object.keys(result?.Subscription || {})).toEqual(['createdEntityForView']);
  });
});
