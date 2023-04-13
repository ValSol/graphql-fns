import { InvolvedFilter } from '../../../tsTypes';

const getInputAndOutputFilters = (involvedFilters: {
  [derivativeConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
}): {
  inputFilter: null | InvolvedFilter[];
  outputFilter: null | InvolvedFilter[];
} => {
  const {
    inputEntity = [null],
    inputOutputEntity = [null],
    outputEntity = [null],
  } = involvedFilters;

  if (!inputOutputEntity?.[0]) {
    return {
      inputFilter: inputEntity && inputEntity[0],
      outputFilter: outputEntity && outputEntity[0],
    };
  }

  return { inputFilter: inputOutputEntity[0], outputFilter: inputOutputEntity[0] };
};

export default getInputAndOutputFilters;
