// @flow
import type { DuplexField, Enums, ThingConfig } from '../../flowTypes';

import getOppositeFields from '../../utils/getOppositeFields';
import createThing from '../../mongooseModels/createThing';
import processDeleteData from './processDeleteData';

type Core = Map<ThingConfig, Array<Object>>;
type UsedIds = { [thingName: string]: Array<string> };
type ProcessChildrenField = (
  id: string,
  core: Core,
  thingConfig: ThingConfig,
  usedIds: UsedIds,
  mongooseConn: Object,
  enums?: Enums,
) => Promise<Core>;

const getNotArrayOppositeDuplexFields = (
  thingConfig: ThingConfig,
): Array<[DuplexField, DuplexField]> =>
  getOppositeFields(thingConfig).filter(([{ parent }, { array }]) => parent && !array);

const processEveryField = async (
  fields: Array<[DuplexField, DuplexField]>,
  thing: { [fieldName: string]: any },
  core: Core,
  usedIds: UsedIds,
  mongooseConn: Object,
  enums?: Enums,
  processChildrenField: ProcessChildrenField,
) => {
  for (let i = 0; i < fields.length; i += 1) {
    const [{ array, name, config }] = fields[i];

    if (array) {
      for (let j = 0; j < thing[name].length; j += 1) {
        const value = thing[name][j] && thing[name][j].toString();

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
      const value = thing[name] && thing[name].toString();

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
  thingConfig,
  usedIds,
  mongooseConn,
  enums,
) => {
  const Thing = await createThing(mongooseConn, thingConfig, enums);

  const projection = (thingConfig.duplexFields || []).reduce(
    (prev, { name }) => {
      prev[name] = 1; // eslint-disable-line no-param-reassign
      return prev;
    },
    { _id: 1 },
  );

  const thing = await Thing.findOne({ _id: id }, projection, { lean: true });

  processDeleteData(thing, core, thingConfig, true);

  const notArrayOppositeDuplexFields = getNotArrayOppositeDuplexFields(thingConfig);

  if (!notArrayOppositeDuplexFields.length) {
    return core;
  }

  await processEveryField(
    notArrayOppositeDuplexFields,
    thing,
    core,
    usedIds,
    mongooseConn,
    enums,
    processChildrenField,
  );

  return core;
};

export { getNotArrayOppositeDuplexFields, processEveryField, processChildrenField };
