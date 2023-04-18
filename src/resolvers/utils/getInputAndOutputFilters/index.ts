import { InvolvedFilter } from '../../../tsTypes';

const getInputAndOutputFilters = (involvedFilters: {
  [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
}): {
  inputFilter: null | InvolvedFilter[];
  outputFilter: null | InvolvedFilter[];
  inputLimit?: number;
  outputLimit?: number;
} => {
  const { inputEntity, inputOutputEntity, outputEntity } = involvedFilters;

  if (inputOutputEntity) {
    const [filter, limit] = inputOutputEntity;

    if (limit) {
      return { inputFilter: filter, inputLimit: limit, outputFilter: filter, outputLimit: limit };
    } else {
      return { inputFilter: filter, outputFilter: filter };
    }
  }

  if (inputEntity && outputEntity) {
    const [inputFilter, inputLimit] = inputEntity;
    const [outputFilter, outputLimit] = outputEntity;

    if (!inputLimit && !outputLimit) {
      return { inputFilter, outputFilter };
    }

    if (!inputLimit) {
      return { inputFilter, outputFilter, outputLimit };
    }

    if (!outputLimit) {
      return { inputFilter, outputFilter, inputLimit };
    }

    return { inputFilter, outputFilter, inputLimit, outputLimit };
  }

  if (!inputEntity && !outputEntity) {
    return { inputFilter: null, outputFilter: null };
  }

  if (inputEntity) {
    const [inputFilter, inputLimit] = inputEntity;

    return inputLimit
      ? { inputFilter, outputFilter: null, inputLimit }
      : { inputFilter, outputFilter: null };
  }

  if (outputEntity) {
    const [outputFilter, outputLimit] = outputEntity;

    return outputLimit
      ? { inputFilter: null, outputFilter, outputLimit }
      : { inputFilter: null, outputFilter };
  }
};

export default getInputAndOutputFilters;
