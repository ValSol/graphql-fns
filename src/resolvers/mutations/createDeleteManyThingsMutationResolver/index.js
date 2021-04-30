// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import createThing from '../../../mongooseModels/createThing';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import addIdsToThing from '../../utils/addIdsToThing';
import executeAuthorisation from '../../utils/executeAuthorisation';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';
import processDeleteData from '../processDeleteData';

type Args = { whereOne: Array<{ id: string }> };
type Context = { mongooseConn: Object, pubsub?: Object };

const createDeleteManyThingsMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  const inventoryChain = ['Mutation', 'deleteManyThings', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilter: Array<Object>,
  ): Object => {
    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);
    if (!filter) return null;

    const { whereOne } = args;

    const { mongooseConn } = context;

    const Thing = await createThing(mongooseConn, thingConfig, enums);

    whereOne.forEach((item) => {
      const whereOneKeys = Object.keys(item);
      if (whereOneKeys.length !== 1) {
        throw new TypeError('Expected exactly one key in where arg!');
      }
    });

    const { lookups, where: preConditions } = mergeWhereAndFilter(
      filter,
      { OR: whereOne },
      thingConfig,
    );

    let conditions = preConditions;

    if (lookups.length) {
      const arg = [...lookups];

      if (Object.keys(preConditions).length) {
        arg.push({ $match: preConditions });
      }

      arg.push({ $project: { _id: 1 } });

      const things = await Thing.aggregate(arg).exec();

      if (things.length !== whereOne.length) return null;

      conditions = { _id: { $in: things.map(({ _id }) => _id) } };
    }

    const things = await Thing.find(conditions, null, { lean: true });
    if (things.length !== whereOne.length) return null;

    const promises = [];
    const toDelete = true;

    let bulkItemsMap = new Map();
    things.forEach((thing) => {
      bulkItemsMap = processDeleteData(thing, bulkItemsMap, thingConfig, toDelete);
    });

    bulkItemsMap.forEach((bulkItems, config) => {
      const { name: name2 } = config;
      const thingSchema2 = createThingSchema(config, enums);
      const Thing2 = mongooseConn.model(`${name2}_Thing`, thingSchema2);
      promises.push(Thing2.bulkWrite(bulkItems));
    });

    await Promise.all(promises);

    const things2 = things.map((thing) => addIdsToThing(thing, thingConfig));

    return things2;
  };

  return resolver;
};

export default createDeleteManyThingsMutationResolver;
