// @flow

import type { GeneralConfig, NearInput, ServersideConfig, ThingConfig } from '../../../flowTypes';

import createThingsQueryResolver from '../createThingsQueryResolver';

type Args = {
  where?: Object,
  near?: NearInput,
  sort?: { sortBy: Array<string> },
  pagination?: { skip: number, first: number },
  search?: string,
};
type Context = { mongooseConn: Object };

const createChildThingsQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { name } = thingConfig;

  const thingsQueryResolver = createThingsQueryResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!thingsQueryResolver) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilter: Array<Object>,
  ): Object => {
    if (!parent) {
      throw new TypeError(`Got undefined parent in resolver: "childThings" for thing: "${name}"!`);
    }

    const { fieldName } = info;

    const id_in = parent[fieldName]; // eslint-disable-line camelcase

    if (!id_in || !id_in.length) return []; // eslint-disable-line camelcase

    const { where, sort } = args || {};

    const were2 = where ? { AND: [where, id_in] } : { id_in }; // eslint-disable-line camelcase

    const things = await thingsQueryResolver(
      null,
      { ...args, where: were2 },
      context,
      info,
      parentFilter,
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

export default createChildThingsQueryResolver;
