// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import createThing from '../../../mongooseModels/createThing';
import addIdsToThing from '../../utils/addIdsToThing';
import executeAuthorisation from '../../utils/executeAuthorisation';
import getProjectionFromInfo from '../../utils/getProjectionFromInfo';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = { whereOne: { id: string } };
type Context = { mongooseConn: Object };

const createThingQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Query', 'thing', name];
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

    const whereOneKeys = Object.keys(whereOne);
    if (whereOneKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in whereOne arg!');
    }

    const projection = info ? getProjectionFromInfo(info) : { _id: 1 };

    const { lookups, where: conditions } = mergeWhereAndFilter(filter, whereOne, thingConfig);

    if (lookups.length) {
      const arg = [...lookups];

      if (Object.keys(conditions).length) {
        arg.push({ $match: conditions });
      }

      arg.push({ $project: projection });

      const [thing] = await Thing.aggregate(arg).exec();

      if (!thing) return null;

      const thing2 = addIdsToThing(thing, thingConfig);
      return thing2;
    }

    const thing = await Thing.findOne(conditions, projection, { lean: true });

    if (!thing) return null;

    const thing2 = addIdsToThing(thing, thingConfig);
    return thing2;
  };

  return resolver;
};

export default createThingQueryResolver;
