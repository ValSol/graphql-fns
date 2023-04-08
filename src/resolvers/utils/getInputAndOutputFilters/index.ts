const getFilterFromInvolvedFilters = (
  involvedFilters: {
    [derivativeConfigName: string]: null | Array<any>
  },
): {
  inputFilter: null | Array<any>,
  outputFilter: null | Array<any>
} => {
  const {
    inputEntity: inputFilter = null,
    inputOutputEntity,
    outputEntity: outputFilter = null,
  } = involvedFilters;

  if (!inputOutputEntity) {
    return { inputFilter, outputFilter };
  }

  return { inputFilter: inputOutputEntity, outputFilter: inputOutputEntity };
};

export default getFilterFromInvolvedFilters;
