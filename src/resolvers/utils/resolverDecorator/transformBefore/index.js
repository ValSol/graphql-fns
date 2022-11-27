// @flow

import type { EntityConfig } from '../../../../flowTypes';

type ArgNamesToTransformers = { [argName: string]: [Function, EntityConfig | null] };

const transformBefore = (
  args: Object,
  argNamesToTransformers: ArgNamesToTransformers,
): { [argName: string]: Object } =>
  Object.keys(args).reduce((prev, key) => {
    if (argNamesToTransformers[key]) {
      const [transformer, entityConfig] = argNamesToTransformers[key];

      prev[key] = transformer(args[key], entityConfig); // eslint-disable-line no-param-reassign
    } else {
      prev[key] = args[key]; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

export default transformBefore;
