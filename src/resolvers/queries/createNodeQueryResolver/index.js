// @flow

import type { GeneralConfig, ServersideConfig } from '../../../flowTypes';

import executeAuthorisation from '../../utils/executeAuthorisation';
import fromGlobalId from '../../utils/fromGlobalId';
import transformAfter from '../../utils/resolverDecorator/transformAfter';

import createThingFileQueryResolver from '../createThingFileQueryResolver';
import createThingQueryResolver from '../createThingQueryResolver';

type Context = { mongooseConn: Object };

const createNodeQueryResolver = (
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function | null => {
  const { thingConfigs } = generalConfig;

  const resolver = async (
    parent: Object,
    args: { id: string },
    context: Context,
    info: Object,
  ): Object => {
    const { id: globalId } = args;

    const { _id: id, thingName, suffix } = fromGlobalId(globalId);

    if (!id) return null;

    const thingConfig = thingConfigs[thingName];

    const inAnyCase = true;

    if (thingConfig.file) {
      const inventoryChain = ['Query', `thingFile${suffix}`, thingName];

      const filter = await executeAuthorisation(inventoryChain, context, serversideConfig);

      const thingFileQueryResolver = createThingFileQueryResolver(
        thingConfig,
        generalConfig,
        serversideConfig,
        inAnyCase,
      );

      if (!thingFileQueryResolver) return null;

      const thingFile = await thingFileQueryResolver(
        null,
        { whereOne: { id } },
        context,
        info,
        filter,
      );

      return {
        ...transformAfter(thingFile, thingConfig, null),
        __typename: `${thingName}${suffix}`,
      };
    }

    const inventoryChain = ['Query', `thing${suffix}`, thingName];

    const filter = await executeAuthorisation(inventoryChain, context, serversideConfig);

    const thingQueryResolver = createThingQueryResolver(
      thingConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    );

    if (!thingQueryResolver) return null;

    const thing = await thingQueryResolver(null, { whereOne: { id } }, context, info, filter);

    return { ...transformAfter(thing, thingConfig, null), __typename: `${thingName}${suffix}` };
  };

  return resolver;
};

export default createNodeQueryResolver;
