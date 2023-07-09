import type { EntityConfig, InputCreator } from '../../tsTypes';

const createStringInputType: InputCreator = (): [
  string,
  string,
  { [inputSpecificName: string]: [InputCreator, EntityConfig] },
] => ['', 'String', {}];

export default createStringInputType;
