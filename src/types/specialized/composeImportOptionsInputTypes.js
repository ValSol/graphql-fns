// @flow

import type { GeneralConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';

const composeImportOptionsInputTypes = (generalConfig: GeneralConfig): string => {
  const { thingConfigs, inventory } = generalConfig;
  const thereIsImport = thingConfigs.some(
    ({ name }) =>
      checkInventory(['Mutation', 'createThing', name], inventory) &&
      checkInventory(['Mutation', 'importThings', name], inventory),
  );

  if (thereIsImport) {
    return `enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}`;
  }
  return '';
};

export default composeImportOptionsInputTypes;
