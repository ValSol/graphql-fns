// @flow

import type { ThingConfig, GeneralConfig } from '../../../flowTypes';

import transformAfter from './transformAfter';
import transformBefore from './transformBefore';

const resolverDecorator =
  (
    func: Function,
    thingConfig: ThingConfig,
    returnConfig: null | ThingConfig,
    generalConfig?: null | GeneralConfig = null,
  ): Function =>
  async (...resolverArgs) => {
    const [parent, args, ...rest] = resolverArgs;

    const rawResult = await func(parent, transformBefore(args, thingConfig), ...rest);

    if (Array.isArray(rawResult)) {
      return rawResult.map((item) => transformAfter(item, returnConfig, generalConfig));
    }

    return transformAfter(rawResult, returnConfig, generalConfig);
  };

export default resolverDecorator;
