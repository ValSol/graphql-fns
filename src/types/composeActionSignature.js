// @flow
import type { GeneralConfig, ActionSignatureMethods, ThingConfig } from '../flowTypes';

const composeActionSignature = (
  signatureMethods: ActionSignatureMethods,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): string => {
  const {
    name: composeName,
    argNames: composeArgNames,
    argTypes: composeArgTypes,
    type: composeType,
  } = signatureMethods;

  const name = composeName(thingConfig, generalConfig);

  // by making name = '' filter unnecessary action
  if (!name) return '';

  const argNames = composeArgNames(thingConfig, generalConfig);
  const argTypes = composeArgTypes(thingConfig, generalConfig);
  const returningType = composeType(thingConfig, generalConfig);

  if (argNames.length !== argTypes.length) {
    throw new TypeError('argNames & argTypes arrays have to have equal length!');
  }

  const args = argNames.map((argName, i) => `${argName}: ${argTypes[i]}`).join(', ');

  return argNames.length ? `${name}(${args}): ${returningType}` : `${name}: ${returningType}`;
};

export default composeActionSignature;
