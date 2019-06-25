// @flow
import type { GeneralConfig, SignatureMethods, ThingConfig } from '../flowTypes';

const composeSignature = (
  signatureMethods: SignatureMethods,
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
  const argNames = composeArgNames(thingConfig, generalConfig);
  const argTypes = composeArgTypes(thingConfig, generalConfig);
  const returningType = composeType(thingConfig, generalConfig);

  if (argNames.length !== argTypes.length) {
    throw new TypeError('argNames & argTypes arrays have to have equal length!');
  }

  const args = argNames.map((argName, i) => `${argName}: ${argTypes[i]}`).join(', ');

  return argNames.length ? `${name}(${args}): ${returningType}` : `${name}: ${returningType}`;
};

export default composeSignature;
