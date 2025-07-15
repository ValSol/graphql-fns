import type { GeneralConfig, ObjectSignatureMethods, EntityConfig } from '../tsTypes';

import composeSpecificActionName from '../utils/composeSpecificActionName';

const composeObjectSignature = (
  signatureMethods: ObjectSignatureMethods,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  input?: boolean,
): string => {
  const {
    name: actionName,
    specificName: composeName,
    fieldNames: composeFieldNames,
    fieldTypes: composeFieldTypes,
  } = signatureMethods;

  const specificName = composeName(entityConfig, generalConfig);

  // by making specificName = '' filter unnecessary objects
  if (!specificName) return '';

  // *** test correctness of the specificName name
  const { name: entityName } = entityConfig;
  if (specificName !== composeSpecificActionName({ actionName, entityName })) {
    throw new TypeError(
      `Specific action name: "${specificName}" is not corresponding with generic action specificName "${actionName}"!`,
    );
  }
  // ***

  const fieldNames = composeFieldNames(entityConfig, generalConfig);
  const fieldTypes = composeFieldTypes(entityConfig, generalConfig);

  if (fieldNames.length !== fieldTypes.length) {
    throw new TypeError('fieldNames & fieldTypes arrays have to have equal length!');
  }

  const fields = fieldNames.map((fieldName, i) => `  ${fieldName}: ${fieldTypes[i]}`).join('\n');

  return `${input ? 'input' : 'type'} ${specificName} {
${fields}
}`;
};

export default composeObjectSignature;
