// @flow
import type { ClientOptions, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeFields from '../composeFields';
import composeCreateManyThingsMutationArgs from './composeCreateManyThingsMutationArgs';
import composeCreateThingMutationArgs from './composeCreateThingMutationArgs';
import composeCustomThingMutationArgs from './composeCustomThingMutationArgs';

import composeDeleteThingMutationArgs from './composeDeleteThingMutationArgs';
import composeUpdateThingMutationArgs from './composeUpdateThingMutationArgs';

const composeMutation = (
  mutationName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  let head;

  switch (mutationName) {
    case 'createManyThings':
      head = composeCreateManyThingsMutationArgs(thingConfig);
      break;

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
      head = composeCustomThingMutationArgs(mutationName, thingConfig, generalConfig);
  }

  const fields = composeFields(thingConfig, { ...clientOptions, shift: 2 });

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

export default composeMutation;
