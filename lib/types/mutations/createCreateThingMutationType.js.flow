// @flow

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
type ThingConfig = { textFields?: Array<TextField>, thingName: string };

const createCreateThingMutationType = (thingConfig: ThingConfig): string => {
  const { thingName } = thingConfig;

  const result = `  create${thingName}(data: ${thingName}CreateInput!): ${thingName}!`;

  return result;
};

module.exports = createCreateThingMutationType;
