// @flow
import type { ThingConfig } from '../flowTypes';

type Result = { [ThingConfig]: Array<Object> };

const getRelations = (thingConfig: ThingConfig, thingConfigs: Array<ThingConfig>): Result => {
  const result = new Map();

  thingConfigs.forEach((currentThingConfig) => {
    const { relationalFields, type: configType } = currentThingConfig;
    if (relationalFields && configType === 'tangible') {
      const fields = relationalFields
        .filter(({ config }) => config === thingConfig)
        .map(({ name, array }) => ({ name, array }));
      if (fields.length) {
        result.set(currentThingConfig, fields);
      }
    }
  });
  return result;
};

export default getRelations;
