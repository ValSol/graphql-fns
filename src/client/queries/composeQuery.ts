import type {ClientOptions, GeneralConfig, EntityConfig} from '../../tsTypes';

import mergeDerivativeIntoCustom from '../../utils/mergeDerivativeIntoCustom';
import { queryAttributes } from '../../types/actionAttributes';
import composeActionArgs from '../utils/composeActionArgs';
import composeFields from '../composeFields';
import composeCustomEntityQueryArgs from './composeCustomEntityQueryArgs';

const attributesWithoutChildren = Object.keys(queryAttributes).reduce<Record<string, any>>((prev, queyrName) => {
  if (queyrName !== 'childEntities' && queyrName !== 'childEntity') {
    prev[queyrName] = queryAttributes[queyrName]; // eslint-disable-line no-param-reassign
  }

  return prev;
}, {});

const composeQuery = (
  prefixName: string,
  queryName: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  if (!entityConfig) {
    throw new TypeError('entityConfig must be defined!');
  }

  if (attributesWithoutChildren[queryName]) {
    const { childArgs, fields } = composeFields(entityConfig, generalConfig, {
      ...clientOptions,
      shift: 2,
    });

    const head = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      attributesWithoutChildren[queryName],
      attributesWithoutChildren[queryName].actionReturnConfig(entityConfig, generalConfig)
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
  const { Query } = custom; // eslint-disable-line no-case-declarations
  if (!Query) {
    throw new TypeError('"Query" property have to be defined!');
  }
  if (
    !Query[queryName] ||
    !Query[queryName].config ||
    typeof Query[queryName].config !== 'function'
  ) {
    throw new TypeError(`Method "config" have to be defined for "${queryName}" custom query`);
  }

  const returnObjectConfig = Query[queryName].config(entityConfig, generalConfig);

  if (returnObjectConfig === null) {
    const head = composeCustomEntityQueryArgs(
      prefixName,
      queryName,
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

  const head = composeCustomEntityQueryArgs(
    prefixName,
    queryName,
    entityConfig,
    generalConfig,
    childArgs,
  );

  if (head.length === 1) return head[0];

  return [...head, ...fields, '  }', '}'].join('\n');
};

export default composeQuery;
