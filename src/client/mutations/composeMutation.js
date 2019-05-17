// @flow
import type { ClientOptions, ThingConfig } from '../../flowTypes';

const composeFields = require('../composeFields');
const composeCreateThingMutationArgs = require('./composeCreateThingMutationArgs');
const composeDeleteThingMutationArgs = require('./composeDeleteThingMutationArgs');
const composeUpdateThingMutationArgs = require('./composeUpdateThingMutationArgs');

const composeMutation = (
  mutationName: 'createThing' | 'deleteThing' | 'updateThing',
  thingConfig: ThingConfig,
  clientOptions: ClientOptions = {},
): string => {
  let head;

  switch (mutationName) {
    case 'createThing':
      head = composeCreateThingMutationArgs(thingConfig);
      break;

    case 'deleteThing':
      head = composeDeleteThingMutationArgs(thingConfig);
      break;

    case 'updateThing':
      head = composeUpdateThingMutationArgs(thingConfig);
      break;

    default:
      throw new TypeError(`Invalid mutationName value "${mutationName}"!`);
  }

  const fields = composeFields(thingConfig, { ...clientOptions, shift: 2 });

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

module.exports = composeMutation;
