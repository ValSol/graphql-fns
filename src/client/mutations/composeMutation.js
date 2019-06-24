// @flow
import type { ClientOptions, ThingConfig } from '../../flowTypes';

import composeFields from '../composeFields';
import composeCreateThingMutationArgs from './composeCreateThingMutationArgs';
import composeDeleteThingMutationArgs from './composeDeleteThingMutationArgs';
import composeUpdateThingMutationArgs from './composeUpdateThingMutationArgs';

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

export default composeMutation;
