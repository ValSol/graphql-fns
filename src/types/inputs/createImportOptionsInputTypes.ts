import type {InputCreator} from '../../tsTypes';

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
