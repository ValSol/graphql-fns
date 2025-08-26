import { InvolvedFilter } from '../../../tsTypes';

const getInputAndOutputFilters = (involvedFilters: {
  [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
}): {
  inputFilter: null | InvolvedFilter[];
  outputFilter: null | InvolvedFilter[];
  inputLimit?: number;
  outputLimit?: number;
} => {
  const { inputFilterAndLimit, inputOutputFilterAndLimit, outputFilterAndLimit } = involvedFilters;

  if (inputOutputFilterAndLimit) {
    const [filter, limit] = inputOutputFilterAndLimit;

    if (limit) {
      return { inputFilter: filter, inputLimit: limit, outputFilter: filter, outputLimit: limit };
    } else {
      return { inputFilter: filter, outputFilter: filter };
    }
  }

  if (inputFilterAndLimit && outputFilterAndLimit) {
    const [inputFilter, inputLimit] = inputFilterAndLimit;
    const [outputFilter, outputLimit] = outputFilterAndLimit;

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

  if (!inputFilterAndLimit && !outputFilterAndLimit) {
    return { inputFilter: null, outputFilter: null };
  }

  if (inputFilterAndLimit) {
    const [inputFilter, inputLimit] = inputFilterAndLimit;

    return inputLimit
      ? { inputFilter, outputFilter: null, inputLimit }
      : { inputFilter, outputFilter: null };
  }

  if (outputFilterAndLimit) {
    const [outputFilter, outputLimit] = outputFilterAndLimit;

    return outputLimit
      ? { inputFilter: null, outputFilter, outputLimit }
      : { inputFilter: null, outputFilter };
  }
};

export default getInputAndOutputFilters;
