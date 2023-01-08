// @flow
import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import createEntityQueryResolver from '../../queries/createEntityQueryResolver';
import composeFieldsObject from '../../../utils/composeFieldsObject';
import transformDataForPush from './transformDataForPush';

type Arg = {
  processingKind: 'create' | 'update' | 'push',
  projection: { [missingFieldName: string]: 1 },
  args: {
    whereOne: Object,
    data: { [fieldName: string]: any },
    positions?: { [fieldName: string]: Array<number> },
  },
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  context: Object,
};

const getMissingData = async ({
  processingKind,
  projection,
  args,
  entityConfig,
  generalConfig,
  serversideConfig,
  context,
}: Arg): Promise<Object | null> => {
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
    { mainEntity: [] },
  );

  if (!entity) return null;

  const entity2 =
    processingKind === 'push' ? transformDataForPush(entity, args, entityConfig) : entity;

  const fieldsObj = composeFieldsObject(entityConfig);

  const result = {};

  Object.keys(fieldsObj).forEach((key) => {
    if (data[key] !== undefined) {
      if (data[key] !== null) result[key] = data[key];
    } else {
      const { kind } = fieldsObj[key];
      if (kind === 'duplexFields' || kind === 'relationalFields') {
        result[key] = { connect: entity2[key] || null };
      } else {
        result[key] = entity2[key];
      }
    }
  });

  return result;
};

export default getMissingData;
