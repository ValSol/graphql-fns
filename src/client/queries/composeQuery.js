// @flow
import type { ClientOptions, GeneralConfig, ThingConfig } from '../../flowTypes';

import mergeDerivativeIntoCustom from '../../utils/mergeDerivativeIntoCustom';
import composeFields from '../composeFields';
import composeCustomThingQueryArgs from './composeCustomThingQueryArgs';
import composeThingQueryArgs from './composeThingQueryArgs';
import composeThingsQueryArgs from './composeThingsQueryArgs';
import composeThingCountQueryArgs from './composeThingCountQueryArgs';
import composeThingFileCountQueryArgs from './composeThingFileCountQueryArgs';
import composeThingDistinctValuesQueryArgs from './composeThingDistinctValuesQueryArgs';
import composeThingFileQueryArgs from './composeThingFileQueryArgs';
import composeThingFilesQueryArgs from './composeThingFilesQueryArgs';

const composeQuery = (
  prefixName: string,
  queryName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  let head = []; // assign "[]" to eliminate flowjs error

  if (!thingConfig) {
    throw new TypeError('thingConfig must be defined!');
  }

  let returnObjectConfig = thingConfig;

  switch (queryName) {
    case 'thing':
      head = composeThingQueryArgs(prefixName, thingConfig);
      break;

    case 'things':
      head = composeThingsQueryArgs(prefixName, thingConfig);
      break;

    case 'thingCount':
      return composeThingCountQueryArgs(prefixName, thingConfig);

    case 'thingFileCount':
      return composeThingFileCountQueryArgs(prefixName, thingConfig);

    case 'thingDistinctValues':
      return composeThingDistinctValuesQueryArgs(prefixName, thingConfig);

    case 'thingFile':
      head = composeThingFileQueryArgs(prefixName, thingConfig);
      break;

    case 'thingFiles':
      head = composeThingFilesQueryArgs(prefixName, thingConfig);
      break;

    default:
      if (!generalConfig) {
        throw new TypeError('"generalConfig" have to be defined!');
      }
      head = composeCustomThingQueryArgs(prefixName, queryName, thingConfig, generalConfig);

      const custom = mergeDerivativeIntoCustom(generalConfig); // eslint-disable-line no-case-declarations
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

      returnObjectConfig = Query[queryName].config(thingConfig, generalConfig);

      if (returnObjectConfig === null) {
        const tail = head[head.length - 1].slice(0, -2);
        return [...head.slice(0, -1), tail, '}'].join('\n');
      }
  }

  const fields = composeFields(returnObjectConfig, generalConfig, { ...clientOptions, shift: 2 });

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

export default composeQuery;
