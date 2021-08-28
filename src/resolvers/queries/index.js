// @flow

import thingDistinctValues from './createThingDistinctValuesQueryResolver';
import thingCount from './createThingCountQueryResolver';
import thingFileCount from './createThingFileCountQueryResolver';
import thingFile from './createThingFileQueryResolver';
import thingFiles from './createThingFilesQueryResolver';
import thing from './createThingQueryResolver';
import things from './createThingsQueryResolver';
import thingsByUnique from './createThingsByUniqueQueryResolver';

const queries = {
  thingCount,
  thingDistinctValues,
  thingFileCount,
  thingFile,
  thingFiles,
  thing,
  things,
  thingsByUnique,
};

export default queries;
