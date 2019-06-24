// @flow
import type { ClientOptions, ThingConfig } from '../../flowTypes';

import composeFields from '../composeFields';
import composeThingQueryArgs from './composeThingQueryArgs';
import composeThingsQueryArgs from './composeThingsQueryArgs';
import composeThingCountQuery from './composeThingCountQuery';

const composeQuery = (
  queryName: 'thing' | 'things' | 'thingCount',
  thingConfig: ThingConfig,
  clientOptions: ClientOptions = {},
): string => {
  let head;

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
      throw new TypeError(`Invalid queryName value "${queryName}"!`);
  }

  const fields = composeFields(thingConfig, { ...clientOptions, shift: 2 });

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

export default composeQuery;
