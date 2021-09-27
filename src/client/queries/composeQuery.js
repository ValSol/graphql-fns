// @flow
import type { ClientOptions, GeneralConfig, ThingConfig } from '../../flowTypes';

import mergeDerivativeIntoCustom from '../../utils/mergeDerivativeIntoCustom';
import { queryAttributes } from '../../types/actionAttributes';
import composeActionArgs from '../utils/composeActionArgs';
import composeFields from '../composeFields';
import composeCustomThingQueryArgs from './composeCustomThingQueryArgs';

const attributesWithoutChildren = Object.keys(queryAttributes).reduce((prev, queyrName) => {
  if (queyrName !== 'childThings' && queyrName !== 'childThing') {
    prev[queyrName] = queryAttributes[queyrName]; // eslint-disable-line no-param-reassign
  }

  return prev;
}, {});

const composeQuery = (
  prefixName: string,
  queryName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  if (!thingConfig) {
    throw new TypeError('thingConfig must be defined!');
  }

  if (attributesWithoutChildren[queryName]) {
    const { childArgs, fields } = composeFields(thingConfig, generalConfig, {
      ...clientOptions,
      shift: 2,
    });

    const head = composeActionArgs(
      prefixName,
      thingConfig,
      attributesWithoutChildren[queryName],
      attributesWithoutChildren[queryName].actionReturnConfig ? childArgs : {},
    );

    if (head.length === 1) return head[0];

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

  const returnObjectConfig = Query[queryName].config(thingConfig, generalConfig);

  if (returnObjectConfig === null) {
    const head = composeCustomThingQueryArgs(prefixName, queryName, thingConfig, generalConfig, {});
    return [...head, '}'].join('\n');
  }

  const { childArgs, fields } = composeFields(returnObjectConfig, generalConfig, {
    ...clientOptions,
    shift: 2,
  });

  const head = composeCustomThingQueryArgs(
    prefixName,
    queryName,
    thingConfig,
    generalConfig,
    childArgs,
  );

  if (head.length === 1) return head[0];

  return [...head, ...fields, '  }', '}'].join('\n');
};

export default composeQuery;
