// @flow
import type { ClientOptions, GeneralConfig, ThingConfig } from '../../flowTypes';

import mergeDerivativeIntoCustom from '../../utils/mergeDerivativeIntoCustom';
import { mutationAttributes } from '../../types/actionAttributes';
import composeActionArgs from '../utils/composeActionArgs';
import composeFields from '../composeFields';
import composeCustomThingMutationArgs from './composeCustomThingMutationArgs';

const composeMutation = (
  prefixName: string,
  mutationName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  if (!thingConfig) {
    throw new TypeError('thingConfig must be defined!');
  }

  if (mutationAttributes[mutationName]) {
    const { childArgs, fields } = composeFields(thingConfig, generalConfig, {
      ...clientOptions,
      shift: 2,
    });

    const head = composeActionArgs(
      prefixName,
      thingConfig,
      mutationAttributes[mutationName],
      childArgs,
    );

    return [...head, ...fields, '  }', '}'].join('\n');
  }

  if (!generalConfig) {
    throw new TypeError('"generalConfig" have to be defined!');
  }

  const forClient = true;
  const custom = mergeDerivativeIntoCustom(generalConfig, forClient); // eslint-disable-line no-case-declarations
  if (!custom) {
    throw new TypeError('"custom" property have to be defined!');
  }
  const { Mutation } = custom; // eslint-disable-line no-case-declarations
  if (!Mutation) {
    throw new TypeError('"Mutation" property have to be defined!');
  }
  if (
    !Mutation[mutationName] ||
    !Mutation[mutationName].config ||
    typeof Mutation[mutationName].config !== 'function'
  ) {
    throw new TypeError(`Method "config" have to be defined for "${mutationName}" custom query`);
  }

  const returnObjectConfig = Mutation[mutationName].config(thingConfig, generalConfig);

  if (returnObjectConfig === null) {
    const head = composeCustomThingMutationArgs(
      prefixName,
      mutationName,
      thingConfig,
      generalConfig,
      {},
    );
    return [...head, '}'].join('\n');
  }

  const { childArgs, fields } = composeFields(returnObjectConfig, generalConfig, {
    ...clientOptions,
    shift: 2,
  });

  const head = composeCustomThingMutationArgs(
    prefixName,
    mutationName,
    thingConfig,
    generalConfig,
    childArgs,
  );

  return [...head, ...fields, '  }', '}'].join('\n');
};

export default composeMutation;
