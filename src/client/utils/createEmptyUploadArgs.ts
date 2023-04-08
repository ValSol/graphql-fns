import type { GraphqlObject, UploadOptions } from '../../tsTypes';

const createEmptyUploadArgs = (): {
  files: Array<any>;
  options: UploadOptions;
  data: GraphqlObject;
} => ({
  files: [],
  options: { targets: [], counts: [], hashes: [] },
  data: {},
});

export default createEmptyUploadArgs;
