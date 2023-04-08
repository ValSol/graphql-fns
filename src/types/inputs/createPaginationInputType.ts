import type {InputCreator} from '../../tsTypes';

const createPaginationInputType: InputCreator = () => {
  const inputName = 'PaginationInput';

  const inputDefinition = `input PaginationInput {
  skip: Int
  first: Int
}`;

  return [inputName, inputDefinition, {}];
};

export default createPaginationInputType;
