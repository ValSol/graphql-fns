// @flow

import type { InputCreator } from '../../flowTypes';

const composeImportOptionsInputTypes: InputCreator = () => [
  'ImportOptionsInput',
  `enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}`,
  {},
];
export default composeImportOptionsInputTypes;
