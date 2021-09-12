// @flow
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import mergeDerivativeIntoCustom from '../../utils/mergeDerivativeIntoCustom';

const composeCustomThingQueryArgs = (
  prefixName: string,
  queryName: string,
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

  const { Query } = custom;

  if (!Query) {
    throw new TypeError('"Query" property have to be defined!');
  }

  if (!Query[queryName]) {
    throw new TypeError(`Custom Query "${queryName}" not found!`);
  }

  const { specificName: composeName, argNames: composeArgNames, argTypes: composeArgTypes } = Query[
    queryName
  ];

  const name = composeName(thingConfig, generalConfig);
  const argNames = composeArgNames(thingConfig, generalConfig);
  const argTypes = composeArgTypes(thingConfig, generalConfig);

  if (argNames.length !== argTypes.length) {
    throw new TypeError('argNames & argTypes arrays have to have equal length!');
  }

  const args1 = argNames.map((argName, i) => `$${argName}: ${argTypes[i]}`).join(', ');
  const args2 = argNames.map((argName) => `${argName}: $${argName}`).join(', ');

  const result = argNames.length
    ? [`query ${prefixName}_${name}(${args1}) {`, `  ${name}(${args2}) {`]
    : [`query ${prefixName}_${name} {`, `  ${name} {`];

  return result;
};

export default composeCustomThingQueryArgs;
