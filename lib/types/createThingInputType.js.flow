// @flow

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
type ThingConfig = { textFields?: Array<TextField>, thingName: string };

const createThingInputType = (thingConfig: ThingConfig): string => {
  const { textFields, thingName } = thingConfig;

  const thingTypeArray = [`input ${thingName}Input {`];

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

module.exports = createThingInputType;
