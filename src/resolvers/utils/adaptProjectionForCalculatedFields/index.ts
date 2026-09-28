import type { GeneralConfig, ServersideConfig, TangibleEntityConfig } from '@/tsTypes';

import getCalculatedFieldCallbacks from '../getCalculatedFieldCallbacks';

// add fields that requested calculated fields are calculated from and remove the calculated...
// ... fields themselves: they are not stored, and a stored property with the name of a calculated...
// ... field (e.g. left by old data) must not be fetched
const adaptProjectionForCalculatedFields = (
  projection: Record<string, 1>,
  entityConfig: TangibleEntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
) => {
  if (Object.keys(projection).length === 0) {
    return projection;
  }

  const { calculatedFields = [] } = entityConfig;

  if (calculatedFields.length === 0) {
    return projection;
  }

  const result = { ...projection };

  calculatedFields.reduce((prev, { name }) => {
    if (projection[name] === undefined) {
      return prev;
    }

    const { fieldsToUseNames = [] } = getCalculatedFieldCallbacks(
      entityConfig,
      name,
      generalConfig,
      serversideConfig,
    );

    fieldsToUseNames.forEach((fieldName) => {
      prev[fieldName] = 1;
    });

    return prev;
  }, result);

  calculatedFields.forEach(({ name }) => {
    delete result[name];
  });

  // an empty projection would fetch the whole document
  return Object.keys(result).length === 0 ? ({ _id: 1 } as Record<string, 1>) : result;
};

export default adaptProjectionForCalculatedFields;
