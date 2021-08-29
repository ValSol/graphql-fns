// @flow

import type { ActionAttributes } from '../../flowTypes';

import childThing from './childThingQueryAttributes';
import childThings from './childThingsQueryAttributes';
import createManyThings from './createManyThingsMutationAttributes';
import thingDistinctValues from './thingDistinctValuesQueryAttributes';
import thingCount from './thingCountQueryAttributes';
import thingFileCount from './thingFileCountQueryAttributes';
import thingFile from './thingFileQueryAttributes';
import thingFiles from './thingFilesQueryAttributes';
import thing from './thingQueryAttributes';
import things from './thingsQueryAttributes';
import thingsByUnique from './thingsByUniqueQueryAttributes';
import createThing from './createThingMutationAttributes';
import deleteFilteredThings from './deleteFilteredThingsMutationAttributes';
import deleteManyThings from './deleteManyThingsMutationAttributes';
import deleteThing from './deleteThingMutationAttributes';
import importThings from './importThingsMutationAttributes';
import pushIntoThing from './pushIntoThingMutationAttributes';
import updateFilteredThings from './updateFilteredThingsMutationAttributes';
import updateManyThings from './updateManyThingsMutationAttributes';
import updateThing from './updateThingMutationAttributes';
import uploadFilesToThing from './uploadFilesToThingMutationAttributes';
import uploadThingFiles from './uploadThingFilesMutationAttributes';

const actionAttributes = {
  childThing,
  childThings,
  createManyThings,
  createThing,
  deleteFilteredThings,
  deleteManyThings,
  deleteThing,
  importThings,
  pushIntoThing,
  thingCount,
  thingDistinctValues,
  thingFileCount,
  thingFile,
  thingFiles,
  thing,
  things,
  thingsByUnique,
  updateFilteredThings,
  updateManyThings,
  updateThing,
  uploadFilesToThing,
  uploadThingFiles,
};

const mutationAttributes: { [actionName: string]: ActionAttributes } = Object.keys(
  actionAttributes,
).reduce((prev, actionName) => {
  if (actionAttributes[actionName].actionType === 'mutation') {
    prev[actionName] = actionAttributes[actionName]; // eslint-disable-line no-param-reassign
  }
  return prev;
}, {});

const queryAttributes: { [actionName: string]: ActionAttributes } = Object.keys(
  actionAttributes,
).reduce((prev, actionName) => {
  if (actionAttributes[actionName].actionType === 'query') {
    prev[actionName] = actionAttributes[actionName]; // eslint-disable-line no-param-reassign
  }
  return prev;
}, {});

export { mutationAttributes, queryAttributes };
export default actionAttributes;
