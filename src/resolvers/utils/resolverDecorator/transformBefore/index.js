// @flow

import type { ThingConfig } from '../../../../flowTypes';

type ArgNamesToTransformers = { [argName: string]: [Function, ThingConfig | null] };

const transformBefore = (
  args: Object,
  argNamesToTransformers: ArgNamesToTransformers,
): { [argName: string]: Object } =>
  Object.keys(args).reduce((prev, key) => {
    if (argNamesToTransformers[key]) {
      const [transformer, thingConfig] = argNamesToTransformers[key];

      prev[key] = transformer(args[key], thingConfig); // eslint-disable-line no-param-reassign
    } else {
      prev[key] = args[key]; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

export default transformBefore;
