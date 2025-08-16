import { Types } from 'mongoose';

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../tsTypes';
import composeFieldsObject from '../../../utils/composeFieldsObject';
import composeQueryResolver from '../../utils/composeQueryResolver';
import transformDataForPush from './transformDataForPush';

type Arg = {
  processingKind: 'create' | 'update' | 'push';
  projection: {
    [missingFieldName: string]: 1;
  };
  args: {
    whereOne: any;
    data: {
      [fieldName: string]: any;
    };
    positions?: {
      [fieldName: string]: Array<number>;
    };
  };
  entityConfig: EntityConfig;
  generalConfig: GeneralConfig;
  serversideConfig: ServersideConfig;
  context: any;
  session: any;
};

const getMissingData = async ({
  processingKind,
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
    { projection, fieldArgs: {}, path: [] },
    { inputOutputEntity: [[]] },
    session,
  );

  if (!instance) return null;

  const instance2 =
    processingKind === 'push' ? transformDataForPush(instance, args, entityConfig) : instance;

  const fieldsObj = composeFieldsObject(entityConfig);

  const result: Record<string, any> = {};

  Object.keys(fieldsObj).forEach((key) => {
    if (data[key] !== undefined) {
      if (data[key] !== null) result[key] = data[key];
    } else {
      const { array, type: fieldType } = fieldsObj[key];
      if (fieldType === 'duplexFields' || fieldType === 'relationalFields') {
        if (array) {
          result[key] =
            instance2[key] !== null && instance2[key] !== undefined
              ? { connect: instance2[key].map((item: Types.ObjectId) => item.toString()) }
              : { connect: [] };
        } else {
          result[key] = {
            connect:
              instance2[key] !== null && instance2[key] !== undefined
                ? instance2[key].toString()
                : null,
          };
        }
      } else {
        result[key] = instance2[key];
      }
    }
  });

  return result;
};

export default getMissingData;
