import type { EntityConfig } from '../../../../tsTypes';

type ArgNamesToTransformers = {
  [argName: string]: [any, EntityConfig | null];
};

const transformBefore = (
  args: any,
  argNamesToTransformers: ArgNamesToTransformers,
): {
  [argName: string]: any;
} =>
  Object.keys(args).reduce<Record<string, any>>((prev, key) => {
    if (argNamesToTransformers[key]) {
      const [transformer, entityConfig] = argNamesToTransformers[key];

      prev[key] = transformer(args[key], entityConfig);
    } else {
      prev[key] = args[key];
    }

    return prev;
  }, {});

export default transformBefore;
