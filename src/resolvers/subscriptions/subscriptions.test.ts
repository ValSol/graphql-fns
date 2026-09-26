import type {
  GeneralConfig,
  InventoryByRoles,
  ServersideConfig,
  TangibleEntityConfig,
} from '@/tsTypes';

import toGlobalId from '@/resolvers/utils/toGlobalId';
import subscriptionResolverDecorator from '@/resolvers/utils/resolverDecorator/subscriptionResolverDecorator';
import createCreatedEntitySubscriptionResolver from './createCreatedEntitySubscriptionResolver';
import createDeletedEntitySubscriptionResolver from './createDeletedEntitySubscriptionResolver';
import createUpdatedEntitySubscriptionResolver from './createUpdatedEntitySubscriptionResolver';

const Restaurant: TangibleEntityConfig = {
  name: 'Restaurant',
  type: 'tangible',
  textFields: [
    { name: 'title', type: 'textFields' },
    { name: 'owner', type: 'textFields' },
    { name: 'address', type: 'textFields' },
  ],
};

const generalConfig: GeneralConfig = { allEntityConfigs: { Restaurant } };

const nodeA = { id: '1', title: 'A', owner: 'user1', address: 'a1' };
const nodeB = { id: '2', title: 'B', owner: 'user2', address: 'b1' };

const kinds = {
  created: {
    actionName: 'createdEntity',
    creator: createCreatedEntitySubscriptionResolver,
    payloads: [{ createdRestaurant: { node: nodeA } }, { createdRestaurant: { node: nodeB } }],
  },
  deleted: {
    actionName: 'deletedEntity',
    creator: createDeletedEntitySubscriptionResolver,
    payloads: [{ deletedRestaurant: { node: nodeA } }, { deletedRestaurant: { node: nodeB } }],
  },
  updated: {
    actionName: 'updatedEntity',
    creator: createUpdatedEntitySubscriptionResolver,
    payloads: [
      {
        updatedRestaurant: {
          node: nodeA,
          previousNode: { ...nodeA, address: 'a0' },
          updatedFields: ['address'],
        },
      },
      {
        updatedRestaurant: {
          node: nodeB,
          previousNode: { ...nodeB, address: 'b0' },
          updatedFields: ['address'],
        },
      },
    ],
  },
} as const;

type Kind = keyof typeof kinds;

const createPubsub = (payloads: ReadonlyArray<any>) => ({
  subscribe: jest.fn(() => ({
    async *[Symbol.asyncIterator]() {
      yield* payloads;
    },
  })),
});

const collect = async (asyncIterable: AsyncIterable<any>) => {
  const result: any[] = [];

  for await (const item of asyncIterable) {
    result.push(item);
  }

  return result;
};

const subscribe = async (
  kind: Kind,
  serversideConfig: ServersideConfig,
  args: Record<string, any> = {},
  payloads: ReadonlyArray<any> = kinds[kind].payloads,
  generalConfig2: GeneralConfig = generalConfig,
) => {
  const { actionName, creator } = kinds[kind];

  const { subscribe: decorated } = subscriptionResolverDecorator(
    creator(actionName, Restaurant, generalConfig2, serversideConfig) as any,
    ['Subscription', actionName, 'Restaurant'],
    Restaurant,
    generalConfig2,
    serversideConfig,
  );

  const pubsub = createPubsub(payloads);

  const items = await collect(await decorated(null, args, { pubsub }, {}));

  expect(pubsub.subscribe).toHaveBeenCalledWith(`${kind}-Restaurant`);

  return items.map((item) => item[`${kind}Restaurant`]);
};

const titles = (items: any[]) => items.map(({ node }) => node.title);

describe('subscriptions', () => {
  const containedRoles = { viewer: [], user: ['viewer'], admin: ['user'] };

  const inventoryByRoles = {
    viewer: { name: 'viewer', include: { Query: { entities: ['Restaurant'] } } },
    user: {
      name: 'user',
      include: {
        Subscription: {
          createdEntity: ['Restaurant'],
          deletedEntity: ['Restaurant'],
          updatedEntity: ['Restaurant'],
        },
      },
    },
    admin: { name: 'admin' },
  } as InventoryByRoles;

  const subscribePayloadFilters = {
    Restaurant: [
      true,
      ({ role, id }: { role: string; id: string }) => {
        switch (role) {
          case 'admin':
            return [];
          case 'user':
            return [{ owner: id }];
          default:
            return null;
        }
      },
    ],
  } as ServersideConfig['subscribePayloadFilters'];

  describe.each(Object.keys(kinds) as Kind[])('"%s" subscription', (kind) => {
    test('should send all events without authorisation settings', async () => {
      const items = await subscribe(kind, {});

      expect(titles(items)).toEqual(['A', 'B']);
    });

    test('should transform events', async () => {
      const [item] = await subscribe(kind, {});

      const id = toGlobalId('1', 'Restaurant');

      expect(item.node).toEqual({ ...nodeA, id });

      if (kind === 'updated') {
        expect(item.previousNode).toEqual({ ...nodeA, id, address: 'a0' });
        expect(item.updatedFields).toEqual(['address']);
      }
    });

    test('should not send events to the role without access to subscription', async () => {
      const items = await subscribe(kind, {
        containedRoles,
        getUserAttributes: async () => ({ id: 'user1', roles: ['viewer'] }),
        inventoryByRoles,
      });

      expect(items).toEqual([]);
    });

    test('should send events to the role with access to subscription', async () => {
      const items = await subscribe(kind, {
        containedRoles,
        getUserAttributes: async () => ({ id: 'user1', roles: ['admin'] }),
        inventoryByRoles,
      });

      expect(titles(items)).toEqual(['A', 'B']);
    });

    test('should not send events to the role absent in "containedRoles"', async () => {
      const items = await subscribe(kind, {
        containedRoles,
        getUserAttributes: async () => ({ id: 'user1', roles: ['unknown'] }),
        inventoryByRoles,
      });

      expect(items).toEqual([]);
    });

    test('should filter events by "subscribePayloadFilters"', async () => {
      const serversideConfig = {
        containedRoles,
        inventoryByRoles,
        subscribePayloadFilters,
      };

      const userItems = await subscribe(kind, {
        ...serversideConfig,
        getUserAttributes: async () => ({ id: 'user1', roles: ['user'] }),
      });

      expect(titles(userItems)).toEqual(['A']);

      const adminItems = await subscribe(kind, {
        ...serversideConfig,
        getUserAttributes: async () => ({ id: 'user1', roles: ['admin'] }),
      });

      expect(titles(adminItems)).toEqual(['A', 'B']);
    });

    test('should filter events by "wherePayload" arg', async () => {
      const items = await subscribe(kind, {}, { wherePayload: { title: 'B' } });

      expect(titles(items)).toEqual(['B']);
    });

    test('should combine "wherePayload" arg with "subscribePayloadFilters"', async () => {
      const items = await subscribe(
        kind,
        {
          containedRoles,
          getUserAttributes: async () => ({ id: 'user1', roles: ['user'] }),
          inventoryByRoles,
          subscribePayloadFilters,
        },
        { wherePayload: { title: 'B' } },
      );

      expect(items).toEqual([]);
    });

    test('should call "getUserAttributes" once per subscription', async () => {
      const getUserAttributes = jest.fn(async () => ({ id: 'user1', roles: ['admin'] }));

      await subscribe(kind, { containedRoles, getUserAttributes, inventoryByRoles });

      expect(getUserAttributes).toHaveBeenCalledTimes(1);
    });

    test('should not create resolver for subscription excluded by inventory', () => {
      const { actionName, creator } = kinds[kind];

      const generalConfig2 = {
        ...generalConfig,
        inventory: { name: 'test', exclude: { Subscription: true } },
      } as GeneralConfig;

      expect(creator(actionName, Restaurant, generalConfig2, {})).toBeNull();
    });
  });

  describe('"updated" subscription', () => {
    test('should check both "previousNode" & "node" by "wherePayload"', async () => {
      const payloads = [
        {
          updatedRestaurant: {
            node: { ...nodeA, title: 'B' },
            previousNode: nodeA,
            updatedFields: ['title'],
          },
        },
        {
          updatedRestaurant: {
            node: { ...nodeB, address: 'b2' },
            previousNode: nodeB,
            updatedFields: ['address'],
          },
        },
      ];

      const items = await subscribe('updated', {}, { wherePayload: { title: 'B' } }, payloads);

      expect(items.map(({ node }) => node.title)).toEqual(['B']);
      expect(items.map(({ node }) => node.address)).toEqual(['b2']);
    });

    test('should filter events by "whichUpdated" arg', async () => {
      const payloads = [
        {
          updatedRestaurant: {
            node: { ...nodeA, title: 'A2' },
            previousNode: nodeA,
            updatedFields: ['title'],
          },
        },
        {
          updatedRestaurant: {
            node: { ...nodeB, address: 'b2' },
            previousNode: nodeB,
            updatedFields: ['address'],
          },
        },
      ];

      const items = await subscribe(
        'updated',
        {},
        { whichUpdated: { updatedFields_in: ['address'] } },
        payloads,
      );

      expect(items.map(({ updatedFields }) => updatedFields)).toEqual([['address']]);
    });
  });
});
