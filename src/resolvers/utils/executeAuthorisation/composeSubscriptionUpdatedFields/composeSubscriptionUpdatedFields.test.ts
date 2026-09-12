/* eslint-env jest */
import type {
  ActionSignatureMethods,
  RepresentationAttributes,
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

  const ForCatalog: RepresentationAttributes = {
    representationKey: 'ForCatalog',
    allow: { Example: ['entitiesThroughConnection', 'updatedEntity'] },
    involvedOutputRepresentationKeys: { Example: { outputEntity: 'ForView' } },
    excludeFields: { Example: ['textField2'] },
  };

  const ForView: RepresentationAttributes = {
    representationKey: 'ForView',
    allow: { Example: [], ExampleEdge: [], ExampleConnection: [], ExampleUpdatedPayload: [] },
    // "involvedOutputRepresentationKeys" not change types that are returned by "ForCatalog" representation actions
    involvedOutputRepresentationKeys: { Example: { outputEntity: 'ForGuest' } },
  };

  const ForGuest: RepresentationAttributes = {
    representationKey: 'ForGuest',
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

  const representation = { ForCatalog, ForView, ForGuest };
  const generalConfig: GeneralConfig = { allEntityConfigs, representation, inventory };

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
