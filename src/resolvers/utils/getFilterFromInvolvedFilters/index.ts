const addOR = (arr: Array<any>) => (arr.length === 1 ? arr[0] : { OR: arr });

const getFilterFromInvolvedFilters = (
  involvedFilters: {
    [derivativeConfigName: string]: null | Array<any>
  },
): null | Array<any> => {
  const { inputEntity, inputOutputEntity, outputEntity } = involvedFilters;

  if (inputOutputEntity) {
    return inputOutputEntity;
  }

  if (!inputEntity || !outputEntity) {
    return null;
  }

  if (!inputEntity.length) {
    return outputEntity;
  }

  if (!outputEntity.length) {
    return inputEntity;
  }

  return [{ AND: [addOR(inputEntity), addOR(outputEntity)] }];
};

export default getFilterFromInvolvedFilters;
