// @flow
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import mergeDerivativeIntoCustom from '../../utils/mergeDerivativeIntoCustom';

const composeCustomThingMutationArgs = (
  prefixName: string,
  mutationName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Array<string> => {
  if (!generalConfig) {
    throw new TypeError('"generalConfig" property have to be defined!');
  }

  const forClient = true;
  const custom = mergeDerivativeIntoCustom(generalConfig, forClient);

  if (!custom) {
    throw new TypeError('"custom" property have to be defined!');
  }

  const { Mutation } = custom;

  if (!Mutation) {
    throw new TypeError('"Mutation" property have to be defined!');
  }

  const {
    specificName: composeName,
    argNames: composeArgNames,
    argTypes: composeArgTypes,
  } = Mutation[mutationName];

  const name = composeName(thingConfig, generalConfig);
  const argNames = composeArgNames(thingConfig, generalConfig);
  const argTypes = composeArgTypes(thingConfig, generalConfig);

  if (argNames.length !== argTypes.length) {
    throw new TypeError('argNames & argTypes arrays have to have equal length!');
  }

  const args1 = argNames.map((argName, i) => `$${argName}: ${argTypes[i]}`).join(', ');
  const args2 = argNames.map((argName) => `${argName}: $${argName}`).join(', ');

  const result = argNames.length
    ? [`mutation ${prefixName}_${name}(${args1}) {`, `  ${name}(${args2}) {`]
    : [`mutation ${prefixName}_${name} {`, `  ${name} {`];

  return result;
};

export default composeCustomThingMutationArgs;
