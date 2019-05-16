// @flow
import type { ClientOptions, ThingConfig } from '../../flowTypes';

const composeFields = require('../composeFields');
const composeThingQueryArgs = require('./composeThingQueryArgs');
const composeThingsQueryArgs = require('./composeThingsQueryArgs');

const composeQuery = (
  queryName: 'thing' | 'things',
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

    default:
      throw new TypeError(`Invalid queryName value "${queryName}"!`);
  }

  const fields = composeFields(thingConfig, { ...clientOptions, shift: 2 });

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

module.exports = composeQuery;
