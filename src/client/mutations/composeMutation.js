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
import composeUploadFilesToThingMutationArgs from './composeUploadFilesToThingMutationArgs';

const composeMutation = (
  prefixName: string,
  mutationName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  let head;

  if (!thingConfig) {
    throw new TypeError('thingConfig must be defined!');
  }

  let returnObjectConfig = thingConfig;

  switch (mutationName) {
    case 'createManyThings':
      head = composeCreateManyThingsMutationArgs(prefixName, thingConfig);
      break;

    case 'importThings':
      head = composeImportThingsMutationArgs(prefixName, thingConfig);
      break;

    case 'createThing':
      head = composeCreateThingMutationArgs(prefixName, thingConfig);
      break;

    case 'deleteThing':
      head = composeDeleteThingMutationArgs(prefixName, thingConfig);
      break;

    case 'pushIntoThing':
      head = composePushIntoThingMutationArgs(prefixName, thingConfig);
      break;

    case 'updateThing':
      head = composeUpdateThingMutationArgs(prefixName, thingConfig);
      break;

    case 'uploadFilesToThing':
      head = composeUploadFilesToThingMutationArgs(prefixName, thingConfig);
      break;

    default:
      head = composeCustomThingMutationArgs(prefixName, mutationName, thingConfig, generalConfig);

      const custom = mergeDerivativeIntoCustom(generalConfig); // eslint-disable-line no-case-declarations

      if (!custom) {
        throw new TypeError('"custom" property have to be defined!');
      }
      const { Mutation } = custom; // eslint-disable-line no-case-declarations
      if (!Mutation) {
        throw new TypeError('"Mutation" property have to be defined!');
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

      if (returnObjectConfig === null) {
        const tail = head[head.length - 1].slice(0, -2);
        return [...head.slice(0, -1), tail, '}'].join('\n');
      }
  }

  const fields = composeFields(returnObjectConfig, generalConfig, { ...clientOptions, shift: 2 });

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

export default composeMutation;
