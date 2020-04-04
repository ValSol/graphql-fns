// @flow
import type { GeneralConfig, ObjectSignatureMethods, ThingConfig } from '../flowTypes';

const composeObjectSignature = (
  signatureMethods: ObjectSignatureMethods,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  input?: boolean,
): string => {
  const {
    name: composeName,
    fieldNames: composeFieldNames,
    fieldTypes: composeFieldTypes,
  } = signatureMethods;

  const name = composeName(thingConfig, generalConfig);

  // by making name = '' filter unnecessary objects
  if (!name) return '';

  const fieldNames = composeFieldNames(thingConfig, generalConfig);
  const fieldTypes = composeFieldTypes(thingConfig, generalConfig);

  if (fieldNames.length !== fieldTypes.length) {
    throw new TypeError('fieldNames & fieldTypes arrays have to have equal length!');
  }

  const fields = fieldNames.map((fieldName, i) => `  ${fieldName}: ${fieldTypes[i]}`).join('\n');

  return `${input ? 'input' : 'type'} ${name} {
${fields}
}`;
};

export default composeObjectSignature;
