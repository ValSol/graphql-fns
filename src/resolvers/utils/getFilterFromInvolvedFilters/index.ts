import { InvolvedFilter } from '@/tsTypes';

const addOR = ([arr]: [InvolvedFilter[]] | [InvolvedFilter[], number]) =>
  arr.length === 1 ? arr[0] : { OR: arr };

const getFilterFromInvolvedFilters = (involvedFilters: {
  [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
}): { filter: null | InvolvedFilter[]; limit?: number } => {
  const { inputFilterAndLimit, inputOutputFilterAndLimit, outputFilterAndLimit } = involvedFilters;

  if (inputOutputFilterAndLimit) {
    const [filter, limit] = inputOutputFilterAndLimit;

    return limit ? { filter, limit } : { filter };
  }

  if (
    !inputFilterAndLimit ||
    !outputFilterAndLimit ||
    !inputFilterAndLimit[0] ||
    !outputFilterAndLimit[0]
  ) {
    return { filter: null };
  }

  if (!inputFilterAndLimit[0].length) {
    const [filter, limit] = outputFilterAndLimit;

    return limit ? { filter, limit } : { filter };
  }

  if (!outputFilterAndLimit[0].length) {
    const [filter] = inputFilterAndLimit;
    const [, limit] = outputFilterAndLimit;

    return limit ? { filter, limit } : { filter };
  }

  const [, limit] = outputFilterAndLimit;

  const filter = [{ AND: [addOR(inputFilterAndLimit), addOR(outputFilterAndLimit)] }];

  return limit === limit ? { filter, limit } : { filter };
};

export default getFilterFromInvolvedFilters;
