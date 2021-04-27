// @flow
import type { GeneralConfig, ObjectSignatureMethods, ThingConfig } from '../flowTypes';

import composeSpecificActionName from '../utils/composeSpecificActionName';

const composeObjectSignature = (
  signatureMethods: ObjectSignatureMethods,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  input?: boolean,
): string => {
  const {
    name: actionName,
    specificName: composeName,
    fieldNames: composeFieldNames,
    fieldTypes: composeFieldTypes,
  } = signatureMethods;

  const specificName = composeName(thingConfig, generalConfig);

  // by making specificName = '' filter unnecessary objects
  if (!specificName) return '';

  // *** test correctness of the specificName name
  const { name: thingName } = thingConfig;
  if (specificName !== composeSpecificActionName({ actionName, thingName })) {
    throw new TypeError(
      `Specific action name: "${specificName}" is not corresponding with generic action specificName "${actionName}"!`,
    );
  }
  // ***

  const fieldNames = composeFieldNames(thingConfig, generalConfig);
  const fieldTypes = composeFieldTypes(thingConfig, generalConfig);

  if (fieldNames.length !== fieldTypes.length) {
    throw new TypeError('fieldNames & fieldTypes arrays have to have equal length!');
  }

  const fields = fieldNames.map((fieldName, i) => `  ${fieldName}: ${fieldTypes[i]}`).join('\n');

  return `${input ? 'input' : 'type'} ${specificName} {
${fields}
}`;
};

export default composeObjectSignature;
