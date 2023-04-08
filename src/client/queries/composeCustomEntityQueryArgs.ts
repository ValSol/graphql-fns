import type {GeneralConfig, EntityConfig} from '../../tsTypes';

import mergeDerivativeIntoCustom from '../../utils/mergeDerivativeIntoCustom';

const composeCustomEntityQueryArgs = (
  prefixName: string,
  queryName: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  childArgs: {
    [argName: string]: string
  },
): Array<string> => {
  if (!generalConfig) {
    throw new TypeError('"generalConfig" property have to be defined!');
  }

  const custom = mergeDerivativeIntoCustom(generalConfig, 'forClient');

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

  const {
    specificName: composeName,
    argNames: composeArgNames,
    argTypes: composeArgTypes,
    config: composeConfig,
  } = Query[queryName];

  const name = composeName(entityConfig, generalConfig);
  const argNames = composeArgNames(entityConfig, generalConfig);
  const argTypes = composeArgTypes(entityConfig, generalConfig);

  if (argNames.length !== argTypes.length) {
    throw new TypeError('argNames & argTypes arrays have to have equal length!');
  }

  const args1arr = argNames.map((argName, i) => `$${argName}: ${argTypes[i]}`);
  Object.keys(childArgs).forEach((argName) => {
    args1arr.push(`$${argName}: ${childArgs[argName]}`);
  });
  const args1 = args1arr.join(', ');

  const args2 = argNames.map((argName) => `${argName}: $${argName}`).join(', ');

  const returnConfig = composeConfig(entityConfig, generalConfig);

  const result = [
    `query ${prefixName}_${name}${args1arr.length ? `(${args1})` : ''} {`,
    `  ${name}${args2 ? `(${args2})` : ''}${returnConfig ? ' {' : ''}`,
  ];

  return result;
};

export default composeCustomEntityQueryArgs;
