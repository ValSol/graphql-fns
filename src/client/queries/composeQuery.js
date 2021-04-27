// @flow
import type { ClientOptions, GeneralConfig, ThingConfig } from '../../flowTypes';

import mergeDerivativeIntoCustom from '../../utils/mergeDerivativeIntoCustom';
import composeActionArgs from '../utils/composeActionArgs';
import composeFields from '../composeFields';
import composeCustomThingQueryArgs from './composeCustomThingQueryArgs';
import thingCountQueryAttributes from '../../types/actionAttributes/thingCountQueryAttributes';
import thingDistinctValuesQueryAttributes from '../../types/actionAttributes/thingDistinctValuesQueryAttributes';
import thingFileCountQueryAttributes from '../../types/actionAttributes/thingFileCountQueryAttributes';
import thingFileQueryAttributes from '../../types/actionAttributes/thingFileQueryAttributes';
import thingFilesQueryAttributes from '../../types/actionAttributes/thingFilesQueryAttributes';
import thingQueryAttributes from '../../types/actionAttributes/thingQueryAttributes';
import thingsQueryAttributes from '../../types/actionAttributes/thingsQueryAttributes';

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
      head = composeActionArgs(prefixName, thingConfig, thingQueryAttributes);
      break;

    case 'things':
      head = composeActionArgs(prefixName, thingConfig, thingsQueryAttributes);
      break;

    case 'thingCount':
      head = composeActionArgs(prefixName, thingConfig, thingCountQueryAttributes);
      break;

    case 'thingFileCount':
      head = composeActionArgs(prefixName, thingConfig, thingFileCountQueryAttributes);
      break;

    case 'thingDistinctValues':
      head = composeActionArgs(prefixName, thingConfig, thingDistinctValuesQueryAttributes);
      break;

    case 'thingFile':
      head = composeActionArgs(prefixName, thingConfig, thingFileQueryAttributes);
      break;

    case 'thingFiles':
      head = composeActionArgs(prefixName, thingConfig, thingFilesQueryAttributes);
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

  if (head.length === 1) return head[0];

  const fields = composeFields(returnObjectConfig, generalConfig, { ...clientOptions, shift: 2 });

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

export default composeQuery;
