// @flow

import type { UploadOptions } from '../../flowTypes';

const createEmptyUploadArgs = (): { files: Array<Object>, options: UploadOptions } => ({
  files: [],
  options: { targets: [], counts: [], hashes: [] },
  data: {},
});

export default createEmptyUploadArgs;
