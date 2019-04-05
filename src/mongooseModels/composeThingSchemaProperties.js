// @flow

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
type ThingConfig = { textFields?: Array<TextField>, thingName: string };

type ThingSchemaProperty = { type: String | [String], default: string, required: boolean };
type ThingSchemaProperties = { [key: string]: ThingSchemaProperty };

const composeThingSchemaProperties = (thingConfig: ThingConfig): ThingSchemaProperties => {
  const { textFields } = thingConfig;

  const textFieldsObject = {};
  if (textFields) {
    textFields.reduce((prev, { array, default: defaultValue, name, required }) => {
      if (defaultValue) {
        if (!array && !(typeof defaultValue === 'string')) {
          throw new TypeError('Expected a string as defalut value');
        }
        if (array && !Array.isArray(defaultValue)) {
          throw new TypeError('Expected an array as defalut value');
        }
      }

      // eslint-disable-next-line no-param-reassign
      prev[name] = {
        default: defaultValue || (array ? [] : ''),
        type: array ? [String] : String,
        required: !!required,
      };
      return prev;
    }, textFieldsObject);
  }

  const result = {
    ...textFieldsObject,
  };

  return result;
};

module.exports = composeThingSchemaProperties;
