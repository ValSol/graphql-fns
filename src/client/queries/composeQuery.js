// @flow
import type { ClientOptions, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeFields from '../composeFields';
import composeCustomThingQueryArgs from './composeCustomThingQueryArgs';
import composeThingQueryArgs from './composeThingQueryArgs';
import composeThingsQueryArgs from './composeThingsQueryArgs';
import composeThingCountQuery from './composeThingCountQuery';

const composeQuery = (
  queryName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  let head = []; // assign "[]" to eliminate flowjs error

  let returnObjectConfig = thingConfig;

  switch (queryName) {
    case 'thing':
      head = composeThingQueryArgs(thingConfig);
      break;

    case 'things':
      head = composeThingsQueryArgs(thingConfig);
      break;

    case 'thingCount':
      return composeThingCountQuery(thingConfig);

    default:
      if (!generalConfig) {
        throw new TypeError('"generalConfig" have to be defined!');
      }
      head = composeCustomThingQueryArgs(queryName, thingConfig, generalConfig);

      const { custom } = generalConfig; // eslint-disable-line no-case-declarations
      if (!custom) {
        throw new TypeError('"custom" property have to be defined!');
      }
      const { Query } = custom; // eslint-disable-line no-case-declarations
      if (!Query) {
        throw new TypeError('"Return" property have to be defined!');
      }
      if (
        !Query[queryName] ||
        !Query[queryName].config ||
        typeof Query[queryName].config !== 'function'
      ) {
        throw new TypeError(`Method "config" have to be defined for "${queryName}" custom query`);
      }
      returnObjectConfig = Query[queryName].config(thingConfig, generalConfig);
  }

  const fields = composeFields(returnObjectConfig, generalConfig, { ...clientOptions, shift: 2 });

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

export default composeQuery;
