import { Connection } from 'mongoose';

import type { DataObject, DuplexField, Enums, TangibleEntityConfig } from '../../tsTypes';
import type { Core } from '../tsTypes';

import getOppositeFields from '../../utils/getOppositeFields';
import createMongooseModel from '../../mongooseModels/createMongooseModel';
import processDeleteData from './processDeleteData';

type UsedIds = {
  [entityName: string]: Array<string>;
};
type ProcessChildrenField = (
  id: string,
  core: Core,
  entityConfig: TangibleEntityConfig,
  usedIds: UsedIds,
  mongooseConn: Connection,
  enums?: Enums,
) => Promise<Core>;

const getNotArrayOppositeDuplexFields = (
  entityConfig: TangibleEntityConfig,
): Array<[DuplexField, DuplexField]> =>
  getOppositeFields(entityConfig).filter(([{ parent }, { array }]: [any, any]) => parent && !array);

const processEveryField = async (
  fields: Array<[DuplexField, DuplexField]>,
  entity: {
    [fieldName: string]: any;
  },
  core: Core,
  usedIds: UsedIds,
  mongooseConn: Connection,
  enums: Enums | null | undefined,
  processChildrenField: ProcessChildrenField,
) => {
  for (let i = 0; i < fields.length; i += 1) {
    const [{ array, name, config }] = fields[i];

    if (array) {
      for (let j = 0; j < entity[name].length; j += 1) {
        const value = entity[name][j] && entity[name][j].toString();

        if (!value || (usedIds[config.name] && usedIds[config.name].includes(value))) {
          continue; // eslint-disable-line no-continue
        }

        if (!usedIds[config.name]) {
          usedIds[config.name] = []; // eslint-disable-line no-param-reassign
        }

        usedIds[config.name].push(value);

        await processChildrenField(value, core, config, usedIds, mongooseConn, enums); // eslint-disable-line no-await-in-loop
      }
    } else {
      const value = entity[name] && entity[name].toString();

      if (!value || (usedIds[config.name] && usedIds[config.name].includes(value))) {
        continue; // eslint-disable-line no-continue
      }

      if (!usedIds[config.name]) {
        usedIds[config.name] = []; // eslint-disable-line no-param-reassign
      }

      usedIds[config.name].push(value);

      await processChildrenField(value, core, config, usedIds, mongooseConn, enums); // eslint-disable-line no-await-in-loop
    }
  }
};

const processChildrenField: ProcessChildrenField = async (
  id,
  core,
  entityConfig,
  usedIds,
  mongooseConn,
  enums,
) => {
  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const projection = (entityConfig.duplexFields || []).reduce(
    (prev, { name }) => {
      prev[name] = 1; // eslint-disable-line no-param-reassign
      return prev;
    },
    { _id: 1 },
  );

  const entity = await Entity.findOne({ _id: id }, projection, { lean: true });

  processDeleteData(entity, core, entityConfig, true);

  const notArrayOppositeDuplexFields = getNotArrayOppositeDuplexFields(entityConfig);

  if (!notArrayOppositeDuplexFields.length) {
    return core;
  }

  await processEveryField(
    notArrayOppositeDuplexFields,
    entity,
    core,
    usedIds,
    mongooseConn,
    enums,
    processChildrenField,
  );

  return core;
};

export { getNotArrayOppositeDuplexFields, processEveryField, processChildrenField };
