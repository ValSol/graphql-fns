import { Types } from 'mongoose';

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../tsTypes';
import createEntityQueryResolver from '../../queries/createEntityQueryResolver';
import composeFieldsObject from '../../../utils/composeFieldsObject';
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
};

const getMissingData = async ({
  processingKind,
  projection,
  args,
  entityConfig,
  generalConfig,
  serversideConfig,
  context,
}: Arg): Promise<any | null> => {
  const inAnyCase = true;

  const entityQueryResolver = createEntityQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    inAnyCase,
  );

  if (!entityQueryResolver) return null;

  const { whereOne, data } = args;

  const entity = await entityQueryResolver(
    null,
    { whereOne },
    context,
    { projection },
    { inputOutputEntity: [[]] },
  );

  if (!entity) return null;

  const entity2 =
    processingKind === 'push' ? transformDataForPush(entity, args, entityConfig) : entity;

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
            entity2[key] !== null && entity2[key] !== undefined
              ? { connect: entity2[key].map((item: Types.ObjectId) => item.toString()) }
              : { connect: [] };
        } else {
          result[key] = {
            connect:
              entity2[key] !== null && entity2[key] !== undefined ? entity2[key].toString() : null,
          };
        }
      } else {
        result[key] = entity2[key];
      }
    }
  });

  return result;
};

export default getMissingData;
