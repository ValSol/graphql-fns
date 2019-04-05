// @flow

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
type ThingConfig = { textFields?: Array<TextField>, thingName: string };

const createAddThingMutationType = (thingConfig: ThingConfig): string => {
  const { thingName } = thingConfig;

  const result = `  add${thingName}(input: ${thingName}Input): ${thingName}!`;

  return result;
};

module.exports = createAddThingMutationType;
