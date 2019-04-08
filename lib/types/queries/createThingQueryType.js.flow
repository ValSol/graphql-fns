// @flow

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
type ThingConfig = { textFields?: Array<TextField>, thingName: string };

const createThingQueryType = (thingConfig: ThingConfig): string => {
  const { thingName } = thingConfig;

  const result = `  ${thingName}(where: ${thingName}WhereInput!): ${thingName}`;

  return result;
};

module.exports = createThingQueryType;
