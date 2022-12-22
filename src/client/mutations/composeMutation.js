// @flow
import type { ClientOptions, GeneralConfig, EntityConfig } from '../../flowTypes';

import mergeDerivativeIntoCustom from '../../utils/mergeDerivativeIntoCustom';
import { mutationAttributes } from '../../types/actionAttributes';
import composeActionArgs from '../utils/composeActionArgs';
import composeFields from '../composeFields';
import composeCustomEntityMutationArgs from './composeCustomEntityMutationArgs';

const composeMutation = (
  prefixName: string,
  mutationName: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  if (!entityConfig) {
    throw new TypeError('entityConfig must be defined!');
  }

  if (mutationAttributes[mutationName]) {
    const { childArgs, fields } = composeFields(entityConfig, generalConfig, {
      ...clientOptions,
      shift: 2,
    });

    const head = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      mutationAttributes[mutationName],
      mutationAttributes[mutationName].actionReturnConfig(entityConfig, generalConfig)
        ? childArgs
        : {},
    );

    if (head.length === 1) return head[0];

    return [...head, ...fields, '  }', '}'].join('\n');
  }

  if (!generalConfig) {
    throw new TypeError('"generalConfig" have to be defined!');
  }

  const custom = mergeDerivativeIntoCustom(generalConfig, 'forClient'); // eslint-disable-line no-case-declarations
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

  const returnObjectConfig = Mutation[mutationName].config(entityConfig, generalConfig);

  if (returnObjectConfig === null) {
    const head = composeCustomEntityMutationArgs(
      prefixName,
      mutationName,
      entityConfig,
      generalConfig,
      {},
    );
    return [...head, '}'].join('\n');
  }

  const { childArgs, fields } = composeFields(returnObjectConfig, generalConfig, {
    ...clientOptions,
    shift: 2,
  });

  const head = composeCustomEntityMutationArgs(
    prefixName,
    mutationName,
    entityConfig,
    generalConfig,
    childArgs,
  );

  if (head.length === 1) return head[0];

  return [...head, ...fields, '  }', '}'].join('\n');
};

export default composeMutation;
