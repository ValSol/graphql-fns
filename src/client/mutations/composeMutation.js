// @flow
import type { ClientOptions, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeFields from '../composeFields';
import composeConcatenateThingMutationArgs from './composeConcatenateThingMutationArgs';
import composeCreateManyThingsMutationArgs from './composeCreateManyThingsMutationArgs';
import composeCreateThingMutationArgs from './composeCreateThingMutationArgs';
import composeCustomThingMutationArgs from './composeCustomThingMutationArgs';
import composeImportThingsMutationArgs from './composeImportThingsMutationArgs';
import composeDeleteThingMutationArgs from './composeDeleteThingMutationArgs';
import composeUpdateThingMutationArgs from './composeUpdateThingMutationArgs';
import composeUploadFileToThingMutationResolver from './composeUploadFileToThingMutationResolver';
import composeUploadManyFilesToThingMutationResolver from './composeUploadManyFilesToThingMutationResolver';

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

    case 'importThings':
      head = composeImportThingsMutationArgs(thingConfig);
      break;

    case 'createThing':
      head = composeCreateThingMutationArgs(thingConfig);
      break;

    case 'deleteThing':
      head = composeDeleteThingMutationArgs(thingConfig);
      break;

    case 'concatenateThing':
      head = composeConcatenateThingMutationArgs(thingConfig);
      break;

    case 'updateThing':
      head = composeUpdateThingMutationArgs(thingConfig);
      break;

    case 'uploadFileToThing':
      head = composeUploadFileToThingMutationResolver(thingConfig);
      break;

    case 'uploadManyFilesToThing':
      head = composeUploadManyFilesToThingMutationResolver(thingConfig);
      break;

    default:
      head = composeCustomThingMutationArgs(mutationName, thingConfig, generalConfig);
  }

  const fields = composeFields(thingConfig, { ...clientOptions, shift: 2 });

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

export default composeMutation;
