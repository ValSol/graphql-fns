/* eslint-env jest */
import type {
  ActionSignatureMethods,
  DescendantAttributes,
  EntityConfig,
  Inventory,
  GeneralConfig,
  SimplifiedTangibleEntityConfig,
  TangibleEntityConfig,
  ThreeSegmentInventoryChain,
} from '@/tsTypes';

import composeAllEntityConfigsAndEnums from '@/utils/composeAllEntityConfigs';
import composeSubscriptionUpdatedFields from '.';

describe('composeSubscriptionUpdatedFields', () => {
  const entityConfig: SimplifiedTangibleEntityConfig = {
    name: 'Example',
    type: 'tangible',

    textFields: [{ name: 'textField' }, { name: 'textField2' }],
  };

  const ForCatalog: DescendantAttributes = {
    descendantKey: 'ForCatalog',
    allow: { Example: ['entitiesThroughConnection', 'updatedEntity'] },
    involvedOutputDescendantKeys: { Example: { outputEntity: 'ForView' } },
    excludeFields: { Example: ['textField2'] },
  };

  const ForView: DescendantAttributes = {
    descendantKey: 'ForView',
    allow: { Example: [], ExampleEdge: [], ExampleConnection: [], ExampleUpdatedPayload: [] },
    // "involvedOutputDescendantKeys" not change types that are returned by "ForCatalog" descendant actions
    involvedOutputDescendantKeys: { Example: { outputEntity: 'ForGuest' } },
  };

  const ForGuest: DescendantAttributes = {
    descendantKey: 'ForGuest',
    allow: { Example: [] },
  };

  const simplifiedEntityConfigs = [entityConfig];
  const inventory: Inventory = {
    name: 'test',
    include: {
      Query: { entitiesThroughConnectionForCatalog: true },
      Subscription: { updatedEntity: ['Example'], updatedEntityForCatalog: ['Example'] },
    },
  };
  const allEntityConfigs = composeAllEntityConfigsAndEnums(simplifiedEntityConfigs);

  const descendant = { ForCatalog, ForView, ForGuest };
  const generalConfig: GeneralConfig = { allEntityConfigs, descendant, inventory };

  test('actionName: "updatedEntity"', () => {
    const actionName = 'updatedEntity';

    const inventoryChain = ['Subscription', actionName, 'Example'] as ThreeSegmentInventoryChain;

    const result = composeSubscriptionUpdatedFields(inventoryChain, generalConfig);

    const expectedResult = ['textField', 'textField2'];

    expect(result).toEqual(expectedResult);
  });

  test('actionName: "updatedEntityForCatalog"', () => {
    const actionName = 'updatedEntityForCatalog';

    const inventoryChain = ['Subscription', actionName, 'Example'] as ThreeSegmentInventoryChain;

    const result = composeSubscriptionUpdatedFields(inventoryChain, generalConfig);

    const expectedResult = ['textField'];

    expect(result).toEqual(expectedResult);
  });
});
