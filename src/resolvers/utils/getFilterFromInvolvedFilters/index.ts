import { InvolvedFilter } from '../../../tsTypes';

const addOR = ([arr]: [InvolvedFilter[]] | [InvolvedFilter[], number]) =>
  arr.length === 1 ? arr[0] : { OR: arr };

const getFilterFromInvolvedFilters = (involvedFilters: {
  [derivativeConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
}): { filter: null | InvolvedFilter[]; limit?: number } => {
  const { inputEntity, inputOutputEntity, outputEntity } = involvedFilters;

  if (inputOutputEntity) {
    const [filter, limit] = inputOutputEntity;

    return limit ? { filter, limit } : { filter };
  }

  if (!inputEntity || !outputEntity || !inputEntity[0] || !outputEntity[0]) {
    return { filter: null };
  }

  if (!inputEntity[0].length) {
    const [filter, limit] = outputEntity;

    return limit ? { filter, limit } : { filter };
  }

  if (!outputEntity[0].length) {
    const [filter] = inputEntity;
    const [, limit] = outputEntity;

    return limit ? { filter, limit } : { filter };
  }

  const [, limit] = outputEntity;

  const filter = [{ AND: [addOR(inputEntity), addOR(outputEntity)] }];

  return limit === limit ? { filter, limit } : { filter };
};

export default getFilterFromInvolvedFilters;
