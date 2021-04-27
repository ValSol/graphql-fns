// @flow
import type { GeneralConfig, ActionSignatureMethods, ThingConfig } from '../flowTypes';

import composeSpecificActionName from '../utils/composeSpecificActionName';

const composeActionSignature = (
  signatureMethods: ActionSignatureMethods,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): string => {
  const {
    name: actionName,
    specificName: composeName,
    argNames: composeArgNames,
    argTypes: composeArgTypes,
    type: composeType,
  } = signatureMethods;

  const specificName = composeName(thingConfig, generalConfig);

  // by making specificName = '' filter unnecessary action
  if (!specificName) return '';

  // *** test correctness of the specificName name
  const { name: thingName } = thingConfig;
  if (specificName !== composeSpecificActionName({ actionName, thingName })) {
    throw new TypeError(
      `Specific action name: "${specificName}" is not corresponding with generic action name "${actionName}"!`,
    );
  }
  // ***

  const argNames = composeArgNames(thingConfig, generalConfig);
  const argTypes = composeArgTypes(thingConfig, generalConfig);
  const returningType = composeType(thingConfig, generalConfig);

  if (argNames.length !== argTypes.length) {
    throw new TypeError('argNames & argTypes arrays have to have equal length!');
  }

  const args = argNames.map((argName, i) => `${argName}: ${argTypes[i]}`).join(', ');

  return argNames.length
    ? `${specificName}(${args}): ${returningType}`
    : `${specificName}: ${returningType}`;
};

export default composeActionSignature;
