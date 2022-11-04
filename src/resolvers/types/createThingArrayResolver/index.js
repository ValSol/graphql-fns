// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import childThingsQueryAttributes from '../../../types/actionAttributes/childThingsQueryAttributes';
import createChildThingsQueryResolver from '../../queries/createChildThingsQueryResolver';
import executeAuthorisation from '../../utils/executeAuthorisation';
import createCustomResolver from '../../createCustomResolver';
import parseThingName from '../../utils/parseThingName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = { where: Object, sort: Object };
type Context = { mongooseConn: Object };

const createThingArrayResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { name } = thingConfig;
  const { thingConfigs } = generalConfig;

  const { root: nameRoot, suffix: nameSuffix } = parseThingName(name, generalConfig);

  const childThingsQueryResolver = nameSuffix
    ? createCustomResolver(
        'Query',
        `childThings${nameSuffix}`,
        thingConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildThingsQueryResolver(thingConfig, generalConfig, serversideConfig),
        childThingsQueryAttributes,
        thingConfig,
      );

  if (!childThingsQueryResolver) {
    throw new TypeError(
      `Not defined childThingsQueryResolver "${
        nameSuffix ? `childThings${nameSuffix}` : 'childThings'
      }" for thing: "${thingConfigs[nameRoot].name}"!`,
    );
  }

  const inventoryChain = nameSuffix
    ? ['Query', `childThings${nameSuffix}`, nameRoot]
    : ['Query', 'childThings', name];

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const filter = await executeAuthorisation(inventoryChain, context, serversideConfig);

    if (!filter) {
      throw new TypeError(
        `Not authorized resolver: "${
          nameSuffix ? `childThings${nameSuffix}` : 'childThings'
        }" for thing: "${thingConfigs[nameRoot].name}"!`,
      );
    }

    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childThings${nameSuffix || ''}" for thing: "${name}"!`,
      );
    }

    const { fieldName } = info;

    const id_in = parent[fieldName]; // eslint-disable-line camelcase

    if (!id_in || !id_in.length) return []; // eslint-disable-line camelcase

    const { where, sort } = args || {};

    const where2 = where ? { AND: [where, { id_in }] } : { id_in }; // eslint-disable-line camelcase

    const things = await childThingsQueryResolver(
      parent,
      { ...args, where: where2 },
      context,
      info,
      filter,
    );

    if (sort) return things;

    const thingsObject = things.reduce((prev, thing) => {
      prev[thing.id] = thing; // eslint-disable-line no-param-reassign
      return prev;
    }, {});

    return id_in.map((id) => thingsObject[id]).filter(Boolean);
  };

  return resolver;
};

export default createThingArrayResolver;
