// @flow

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
type ThingConfig = { textFields?: Array<TextField>, thingName: string };

const createThingType = (thingConfig: ThingConfig): string => {
  const { textFields, thingName } = thingConfig;

  const thingTypeArray = [
    `type ${thingName} {`,
    '  id: ID!',
    '  createdAt: DateTime!',
    '  updatedAt: DateTime',
    '  deletedAt: DateTime',
    '  permanentlyDeleted: DateTime',
  ];

  if (textFields) {
    textFields.reduce((prev, { array, name, required }) => {
      prev.push(
        `  ${name}: ${array ? '[' : ''}String${array ? '!]!' : ''}${!array && required ? '!' : ''}`,
      );
      return prev;
    }, thingTypeArray);
  }

  thingTypeArray.push('}');

  const result = thingTypeArray.join('\n');

  return result;
};

module.exports = createThingType;
