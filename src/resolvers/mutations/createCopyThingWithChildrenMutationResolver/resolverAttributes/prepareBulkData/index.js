// @flow
import type { PrepareBulkData } from '../../../../flowTypes';

import fromMongoToGqlDataArg from '../../../../types/fromMongoToGqlDataArg';
import processCreateInputData from '../../../processCreateInputData';
import processDeleteData from '../../../processDeleteData';
import processDeleteDataPrepareArgs from '../../../processDeleteDataPrepareArgs';
import composeCreateTree from './composeCreateTree';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const {
    thingConfig,
    generalConfig: { enums },
  } = resolverCreatorArg;

  const { core, mains: previousThings } = prevPreparedData;

  const {
    args: { whereOnes },
    context: { mongooseConn },
  } = resolverArg;
  const whereOnesKeys = Object.keys(whereOnes);

  const [fieldName] = whereOnesKeys;

  const fieldToConnect = (thingConfig.duplexFields || []).find(({ name }) => name === fieldName);
  if (!fieldToConnect) {
    throw new TypeError(`Not found duplex field: "${fieldName}" in thing: "${thingConfig.name}"!`);
  }
  const { config: copiedThingConfig } = fieldToConnect;

  if (previousThings[0].id) {
    const { duplexFields } = thingConfig;
    const duplexFieldsProjection = duplexFields
      ? duplexFields.reduce(
          (prev, { name: name2 }) => {
            prev[name2] = 1; // eslint-disable-line no-param-reassign
            return prev;
          },
          { _id: 1 },
        )
      : {};

    let coreForDeletions = core;

    const pairedPreviouseThings = previousThings.reduce((prev, copiedThing, i) => {
      if (!(i % 2)) {
        prev.push([copiedThing]);
      } else {
        prev[prev.length - 1].push(copiedThing);
      }
      return prev;
    }, []);

    pairedPreviouseThings.forEach(([copiedThing, data]) => {
      coreForDeletions = Object.keys(duplexFieldsProjection).length
        ? processDeleteData(
            processDeleteDataPrepareArgs(data, copiedThing, thingConfig),
            coreForDeletions,
            thingConfig,
          )
        : coreForDeletions;
    });

    let preparedData = { ...prevPreparedData, core: coreForDeletions, mains: [] };

    pairedPreviouseThings.forEach(([copiedThing, data]) => {
      preparedData = processCreateInputData(
        { ...data, id: copiedThing.id }, // eslint-disable-line no-underscore-dangle
        preparedData,
        thingConfig,
        'update',
      );
    });

    return preparedData;
  }

  let preparedData = { ...prevPreparedData, mains: [] };

  for (let i = 0; i < previousThings.length; i += 1) {
    const copiedThing = previousThings[i];

    const idsAndThingConfigs = [{}];

    // eslint-disable-next-line no-await-in-loop
    const tree = await composeCreateTree(
      copiedThing,
      copiedThingConfig,
      thingConfig,
      enums,
      mongooseConn,
      idsAndThingConfigs,
    );

    const tree2 = fromMongoToGqlDataArg(Object.assign(copiedThing, tree), thingConfig);

    preparedData = processCreateInputData(tree2, preparedData, thingConfig, 'create');
  }

  return preparedData;
};

export default prepareBulkData;
