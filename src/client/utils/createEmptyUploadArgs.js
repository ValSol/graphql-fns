// @flow

import type { UploadOptions } from '../../flowTypes';

const createEmptyUploadArgs = (): { files: [], options: UploadOptions } => ({
  files: [],
  options: { targets: [], counts: [], hashes: [] },
});

export default createEmptyUploadArgs;
