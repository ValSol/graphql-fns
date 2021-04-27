// @flow
import type { ClientOptions, GeneralConfig, ThingConfig } from '../../flowTypes';

import mergeDerivativeIntoCustom from '../../utils/mergeDerivativeIntoCustom';
import composeActionArgs from '../utils/composeActionArgs';
import composeFields from '../composeFields';
import createManyThingsMutationAttributes from '../../types/actionAttributes/createManyThingsMutationAttributes';
import createThingMutationAttributes from '../../types/actionAttributes/createThingMutationAttributes';
import deleteThingMutationAttributes from '../../types/actionAttributes/deleteThingMutationAttributes';
import importThingsMutationAttributes from '../../types/actionAttributes/importThingsMutationAttributes';
import pushIntoThingMutationAttributes from '../../types/actionAttributes/pushIntoThingMutationAttributes';
import updateThingMutationAttributes from '../../types/actionAttributes/updateThingMutationAttributes';
import uploadFilesToThingMutationAttributes from '../../types/actionAttributes/uploadFilesToThingMutationAttributes';
import uploadThingFilesMutationAttributes from '../../types/actionAttributes/uploadThingFilesMutationAttributes';
import composeCustomThingMutationArgs from './composeCustomThingMutationArgs';

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
      head = composeActionArgs(prefixName, thingConfig, createManyThingsMutationAttributes);
      break;

    case 'importThings':
      head = composeActionArgs(prefixName, thingConfig, importThingsMutationAttributes);
      break;

    case 'createThing':
      head = composeActionArgs(prefixName, thingConfig, createThingMutationAttributes);
      break;

    case 'deleteThing':
      head = composeActionArgs(prefixName, thingConfig, deleteThingMutationAttributes);
      break;

    case 'pushIntoThing':
      head = composeActionArgs(prefixName, thingConfig, pushIntoThingMutationAttributes);
      break;

    case 'updateThing':
      head = composeActionArgs(prefixName, thingConfig, updateThingMutationAttributes);
      break;

    case 'uploadFilesToThing':
      head = composeActionArgs(prefixName, thingConfig, uploadFilesToThingMutationAttributes);
      break;

    case 'uploadThingFiles':
      head = composeActionArgs(prefixName, thingConfig, uploadThingFilesMutationAttributes);
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
