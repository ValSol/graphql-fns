// @flow

import thingDistinctValues from './createThingDistinctValuesQueryResolver';
import thingCount from './createThingCountQueryResolver';
import thingFileCount from './createThingFileCountQueryResolver';
import thingFile from './createThingFileQueryResolver';
import thingFiles from './createThingFilesQueryResolver';
import thing from './createThingQueryResolver';
import things from './createThingsQueryResolver';

const queries = {
  thingCount,
  thingDistinctValues,
  thingFileCount,
  thingFile,
  thingFiles,
  thing,
  things,
};

export default queries;
