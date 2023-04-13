import { InvolvedFilter } from '../../../tsTypes';

const addOR = ([arr]: [InvolvedFilter[]] | [InvolvedFilter[], number]) =>
  arr.length === 1 ? arr[0] : { OR: arr };

const getFilterFromInvolvedFilters = (involvedFilters: {
  [derivativeConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
}): null | InvolvedFilter[] => {
  const { inputEntity, inputOutputEntity, outputEntity } = involvedFilters;

  if (inputOutputEntity) {
    return inputOutputEntity[0];
  }

  if (!inputEntity || !outputEntity || !inputEntity[0] || !outputEntity[0]) {
    return null;
  }

  if (!inputEntity[0].length) {
    return outputEntity[0];
  }

  if (!outputEntity[0].length) {
    return inputEntity[0];
  }

  return [{ AND: [addOR(inputEntity), addOR(outputEntity)] }];
};

export default getFilterFromInvolvedFilters;
