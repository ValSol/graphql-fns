// @flow

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
type ThingConfig = { textFields?: Array<TextField>, thingName: string };

const createThingWhereInputType = (thingConfig: ThingConfig): string => {
  const { thingName } = thingConfig;

  const result = `input ${thingName}WhereInput {
  id: ID!
}`;

  return result;
};

module.exports = createThingWhereInputType;
