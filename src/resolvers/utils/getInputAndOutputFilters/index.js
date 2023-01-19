// @flow

const getFilterFromInvolvedFilters = (involvedFilters: {
  [derivativeConfigName: string]: null | Array<Object>,
}): { inputFilter: null | Array<Object>, outputFilter: null | Array<Object> } => {
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
