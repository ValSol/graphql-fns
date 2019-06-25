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
  generalConfig: null | GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  let head = []; // assign "[]" to eliminate flowjs error

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
  }

  const fields = composeFields(thingConfig, { ...clientOptions, shift: 2 });

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

export default composeQuery;
