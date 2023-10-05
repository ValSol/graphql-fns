import { TangibleEntityConfig } from '../../../tsTypes';

const adaptProjectionForCalculatedFields = (
  projection: Record<string, 1>,
  entityConfig: TangibleEntityConfig,
) => {
  if (Object.keys(projection).length === 0) {
    return projection;
  }

  const { calculatedFields = [] } = entityConfig;

  if (calculatedFields.length === 0) {
    return projection;
  }

  const result = { ...projection };

  calculatedFields.reduce((prev, { args, name }) => {
    if (projection[name] === undefined) {
      return prev;
    }

    args.forEach((arg) => {
      prev[arg] = 1;
    });

    return prev;
  }, result);

  return result;
};

export default adaptProjectionForCalculatedFields;
