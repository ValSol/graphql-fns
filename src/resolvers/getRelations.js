// @flow
import type { ThingConfig } from '../flowTypes';

type Result = { [ThingConfig]: Array<Object> };

const getRelations = (thingConfig: ThingConfig, thingConfigs: Array<ThingConfig>): Result => {
  const result = new Map();

  thingConfigs.forEach(currentThingConfig => {
    const { relationalFields, isEmbedded } = currentThingConfig;
    if (relationalFields && !isEmbedded) {
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

module.exports = getRelations;
