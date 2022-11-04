// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import childThingQueryAttributes from '../../../types/actionAttributes/childThingQueryAttributes';
import createChildThingQueryResolver from '../../queries/createChildThingQueryResolver';
import executeAuthorisation from '../../utils/executeAuthorisation';
import createCustomResolver from '../../createCustomResolver';
import parseThingName from '../../utils/parseThingName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingScalarResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { name } = thingConfig;
  const { thingConfigs } = generalConfig;

  const { root: nameRoot, suffix: nameSuffix } = parseThingName(name, generalConfig);

  const childThingQueryResolver = nameSuffix
    ? createCustomResolver(
        'Query',
        `childThing${nameSuffix}`,
        thingConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildThingQueryResolver(thingConfig, generalConfig, serversideConfig),
        childThingQueryAttributes,
        thingConfig,
      );

  if (!childThingQueryResolver) {
    throw new TypeError(
      `Not defined childThingQueryResolver "${
        nameSuffix ? `childThing${nameSuffix}` : 'childThing'
      }" for thing: "${thingConfigs[nameRoot].name}"!`,
    );
  }

  const inventoryChain = nameSuffix
    ? ['Query', `childThing${nameSuffix}`, nameRoot]
    : ['Query', 'childThing', name];

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const filter = await executeAuthorisation(inventoryChain, context, serversideConfig);

    if (!filter) {
      throw new TypeError(
        `Not authorized resolver: "${
          nameSuffix ? `childThing${nameSuffix}` : 'childThing'
        }" for thing: "${thingConfigs[nameRoot].name}"!`,
      );
    }

    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childThing${nameSuffix || ''}" for thing: "${name}"!`,
      );
    }
    const { fieldName } = info;

    const id = parent[fieldName]; // eslint-disable-line camelcase

    const whereOne = { id };

    return childThingQueryResolver(parent, { ...args, whereOne }, context, info, filter);
  };

  return resolver;
};

export default createThingScalarResolver;
