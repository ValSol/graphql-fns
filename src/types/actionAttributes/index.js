// @flow

import createManyThings from './createManyThingsMutationAttributes';
import thingDistinctValues from './thingDistinctValuesQueryAttributes';
import thingCount from './thingCountQueryAttributes';
import thingFileCount from './thingFileCountQueryAttributes';
import thingFile from './thingFileQueryAttributes';
import thingFiles from './thingFilesQueryAttributes';
import thing from './thingQueryAttributes';
import things from './thingsQueryAttributes';
import createThing from './createThingMutationAttributes';
import deleteThing from './deleteThingMutationAttributes';
import importThings from './importThingsMutationAttributes';
import pushIntoThing from './pushIntoThingMutationAttributes';
import updateThing from './updateThingMutationAttributes';
import uploadFilesToThing from './uploadFilesToThingMutationAttributes';
import uploadThingFiles from './uploadThingFilesMutationAttributes';

const actionAttributes = {
  createManyThings,
  createThing,
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
  updateThing,
  uploadFilesToThing,
  uploadThingFiles,
};

const mutationAttributes = {
  createManyThings,
  createThing,
  deleteThing,
  importThings,
  pushIntoThing,
  updateThing,
  uploadFilesToThing,
  uploadThingFiles,
};

const queryAttributes = {
  thingCount,
  thingDistinctValues,
  thingFileCount,
  thingFile,
  thingFiles,
  thing,
  things,
};

export { mutationAttributes, queryAttributes };
export default actionAttributes;
