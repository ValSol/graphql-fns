import { InfoEssence, TangibleEntityConfig } from '@/tsTypes';

const createInfoEssence = ({
  projection,
  entityConfig,
  infoEssence,
  fieldArgs = {},
}: {
  projection: Record<string, 1>;
  entityConfig?: TangibleEntityConfig;
  infoEssence?: InfoEssence;
  fieldArgs?: Record<string, Record<string, any>>;
}): InfoEssence => {
  if (!entityConfig) {
    return { projection, fieldArgs, path: [] };
  }

  if (!infoEssence) {
    return {
      projection,
      fieldArgs,
      path: [],
    };
  }

  const simpleProjection = { ...infoEssence.projection, ...projection };

  return {
    ...infoEssence,
    projection: simpleProjection,
    // merge fieldArgs
    fieldArgs: Object.keys(fieldArgs).reduce((prev, calculatedfieldName) => {
      if (prev[calculatedfieldName]) {
        Object.assign(prev[calculatedfieldName], fieldArgs[calculatedfieldName]);
      } else {
        prev[calculatedfieldName] = fieldArgs[calculatedfieldName];
      }

      return prev;
    }, infoEssence.fieldArgs),
  };
};

export default createInfoEssence;
