// @flow
import type { ClientOptions, GeneralConfig, ThingConfig } from '../../flowTypes';

import mergeDerivativeIntoCustom from '../../utils/mergeDerivativeIntoCustom';
import composeFields from '../composeFields';
import composePushIntoThingMutationArgs from './composePushIntoThingMutationArgs';
import composeCreateManyThingsMutationArgs from './composeCreateManyThingsMutationArgs';
import composeCreateThingMutationArgs from './composeCreateThingMutationArgs';
import composeCustomThingMutationArgs from './composeCustomThingMutationArgs';
import composeImportThingsMutationArgs from './composeImportThingsMutationArgs';
import composeDeleteThingMutationArgs from './composeDeleteThingMutationArgs';
import composeUpdateThingMutationArgs from './composeUpdateThingMutationArgs';
import composeUploadFilesToThingMutationResolver from './composeUploadFilesToThingMutationResolver';

const composeMutation = (
  mutationName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  let head;

  let returnObjectConfig = thingConfig;

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

    case 'pushIntoThing':
      head = composePushIntoThingMutationArgs(thingConfig);
      break;

    case 'updateThing':
      head = composeUpdateThingMutationArgs(thingConfig);
      break;

    case 'uploadFilesToThing':
      head = composeUploadFilesToThingMutationResolver(thingConfig);
      break;

    default:
      head = composeCustomThingMutationArgs(mutationName, thingConfig, generalConfig);

      const custom = mergeDerivativeIntoCustom(generalConfig); // eslint-disable-line no-case-declarations

      if (!custom) {
        throw new TypeError('"custom" property have to be defined!');
      }
      const { Mutation } = custom; // eslint-disable-line no-case-declarations
      if (!Mutation) {
        throw new TypeError('"Return" property have to be defined!');
      }
      if (
        !Mutation[mutationName] ||
        !Mutation[mutationName].config ||
        typeof Mutation[mutationName].config !== 'function'
      ) {
        throw new TypeError(
          `Method "config" have to be defined for "${mutationName}" custom query`,
        );
      }
      returnObjectConfig = Mutation[mutationName].config(thingConfig, generalConfig);
  }

  const fields = composeFields(returnObjectConfig, generalConfig, { ...clientOptions, shift: 2 });

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

export default composeMutation;
