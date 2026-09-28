import type { GeneralConfig, ServersideConfig, TangibleEntityConfig } from '@/tsTypes';

import getCalculatedFieldCallbacks from '../getCalculatedFieldCallbacks';

// add fields that requested calculated fields are calculated from
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

  return result;
};

export default adaptProjectionForCalculatedFields;
