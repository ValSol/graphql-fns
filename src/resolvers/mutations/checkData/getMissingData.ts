import { Types } from 'mongoose';

import type { GeneralConfig, ServersideConfig, EntityConfig } from '@/tsTypes';
import composeFieldsObject from '@/utils/composeFieldsObject';
import composeQueryResolver from '@/resolvers/utils/composeQueryResolver';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';

type Arg = {
  projection: {
    [missingFieldName: string]: 1;
  };
  args: {
    whereOne: any;
    data: {
      [fieldName: string]: any;
    };
  };
  entityConfig: EntityConfig;
  generalConfig: GeneralConfig;
  serversideConfig: ServersideConfig;
  context: any;
  session: any;
};

const getMissingData = async ({
  projection,
  args,
  entityConfig,
  generalConfig,
  serversideConfig,
  context,
  session,
}: Arg): Promise<any | null> => {
  const inAnyCase = true;

  const { name: entityName } = entityConfig;

  const { whereOne, data } = args;

  const instance = await composeQueryResolver(entityName, generalConfig, serversideConfig)(
    null,
    { whereOne },
    context,
    createInfoEssence({ projection }),
    { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    session,
  );

  if (!instance) return null;

  const { fieldsObject: fieldsObj } = composeFieldsObject(entityConfig);

  const result: Record<string, any> = {};

  Object.keys(fieldsObj).forEach((key) => {
    if (data[key] !== undefined) {
      if (data[key] !== null) result[key] = data[key];
    } else {
      const { array, type: fieldType } = fieldsObj[key];
      if (fieldType === 'duplexFields' || fieldType === 'relationalFields') {
        if (array) {
          result[key] =
            instance[key] !== null && instance[key] !== undefined
              ? { connect: instance[key].map((item: Types.ObjectId) => item.toString()) }
              : { connect: [] };
        } else {
          result[key] = {
            connect:
              instance[key] !== null && instance[key] !== undefined
                ? instance[key].toString()
                : null,
          };
        }
      } else {
        result[key] = instance[key];
      }
    }
  });

  return result;
};

export default getMissingData;
