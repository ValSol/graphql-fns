import { InfoEssence, TangibleEntityConfig } from '@/tsTypes';
import adaptProjectionForCalculatedFields from '../adaptProjectionForCalculatedFields';

const createInfoEssence = (
  projection: Record<string, 1>,
  entityConfig?: TangibleEntityConfig,
  infoEssence?: InfoEssence,
): InfoEssence => {
  if (!entityConfig) {
    return { projection, fieldArgs: {}, path: [] };
  }

  if (!infoEssence) {
    return {
      projection: adaptProjectionForCalculatedFields(projection, entityConfig),
      fieldArgs: {},
      path: [],
    };
  }

  const simpleProjection = { ...infoEssence.projection, ...projection };

  return {
    ...infoEssence,
    projection: adaptProjectionForCalculatedFields(simpleProjection, entityConfig),
  };
};

export default createInfoEssence;
