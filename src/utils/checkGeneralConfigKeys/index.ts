import type { GeneralConfig } from '@/tsTypes';

const renamedKeys = { representation: 'representations' };

// an old key would be silently ignored, so it is rejected explicitly
const checkGeneralConfigKeys = (generalConfig: GeneralConfig) => {
  Object.keys(renamedKeys).forEach((oldKey) => {
    if (oldKey in generalConfig) {
      throw new TypeError(
        `The "${oldKey}" attribute of generalConfig is renamed to "${renamedKeys[oldKey]}"!`,
      );
    }
  });
};

export default checkGeneralConfigKeys;
