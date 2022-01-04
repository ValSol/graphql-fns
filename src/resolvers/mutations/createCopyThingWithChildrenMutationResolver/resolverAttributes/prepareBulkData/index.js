// @flow

import type { PrepareBulkData } from '../../../../flowTypes';

import fromMongoToGqlDataArg from '../../../../types/fromMongoToGqlDataArg';
import processCreateInputData from '../../../processCreateInputData';
import processDeleteData from '../../../processDeleteData';
import processDeleteDataPrepareArgs from '../../../processDeleteDataPrepareArgs';
import getCommonManyData from '../../../createCopyManyThingsMutationResolver/resolverAttributes/getCommonData';
import getCommonData from '../../../createCopyThingMutationResolver/resolverAttributes/getCommonData';

import composeCreateTree from './composeCreateTree';
import mixTrees from './mixTrees';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const {
    thingConfig,
    generalConfig: { enums },
  } = resolverCreatorArg;
  const {
    args: { whereOnes },
    context: { mongooseConn },
  } = resolverArg;
  const { core } = prevPreparedData;

  const getPrefiousThings = Array.isArray(whereOnes) ? getCommonManyData : getCommonData;

  // $FlowFixMe
  const previousThings = await getPrefiousThings(resolverCreatorArg, resolverArg);

  const whereOnesKeys = Object.keys(Array.isArray(whereOnes) ? whereOnes[0] : whereOnes);

  const [fieldName] = whereOnesKeys;

  const fieldToConnect = (thingConfig.duplexFields || []).find(({ name }) => name === fieldName);
  if (!fieldToConnect) {
    throw new TypeError(`Not found duplex field: "${fieldName}" in thing: "${thingConfig.name}"!`);
  }
  const { config: copiedThingConfig } = fieldToConnect;

  if (!previousThings) return previousThings; // to prevent flowjs error

  // eslint-disable-next-line no-underscore-dangle
  if (previousThings[0]._id) {
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

    const pairedPreviouseThings = previousThings.reduce((prev, previousThing, i) => {
      if (!(i % 2)) {
        prev.push([previousThing]);
      } else {
        prev[prev.length - 1].push(previousThing);
      }
      return prev;
    }, []);

    pairedPreviouseThings.forEach(([currentThing, copiedThing]) => {
      coreForDeletions = Object.keys(duplexFieldsProjection).length
        ? processDeleteData(
            processDeleteDataPrepareArgs(copiedThing, currentThing, thingConfig),
            coreForDeletions,
            thingConfig,
          )
        : coreForDeletions;
    });

    let preparedData = { ...prevPreparedData, core, mains: [] };

    for (let i = 0; i < pairedPreviouseThings.length; i += 1) {
      const [currentThing, copiedThing] = pairedPreviouseThings[i];

      // eslint-disable-next-line no-await-in-loop
      const tree = await composeCreateTree(
        copiedThing,
        copiedThingConfig,
        thingConfig,
        enums,
        mongooseConn,
        null,
      );

      const idsAndThingConfigs = [{}, currentThing, thingConfig];

      // eslint-disable-next-line no-await-in-loop
      const currentTree = await composeCreateTree(
        currentThing,
        thingConfig,
        copiedThingConfig,
        enums,
        mongooseConn,
        idsAndThingConfigs,
      );

      const mixedTrees = mixTrees(tree, currentTree, idsAndThingConfigs, core);

      const tree2 = fromMongoToGqlDataArg(Object.assign(copiedThing, mixedTrees), thingConfig);

      preparedData = processCreateInputData(
        { ...tree2, id: currentThing._id }, // eslint-disable-line no-underscore-dangle
        preparedData,
        thingConfig,
        'update',
      );
    }

    return preparedData;
  }

  let preparedData = prevPreparedData;

  for (let i = 0; i < previousThings.length; i += 1) {
    const copiedThing = previousThings[i];

    const idsAndThingConfigs = [{}, {}, thingConfig];

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
