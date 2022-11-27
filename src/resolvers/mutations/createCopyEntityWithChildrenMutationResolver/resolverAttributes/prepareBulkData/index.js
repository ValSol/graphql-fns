// @flow

import type { PrepareBulkData } from '../../../../flowTypes';

import fromMongoToGqlDataArg from '../../../../types/fromMongoToGqlDataArg';
import processCreateInputData from '../../../processCreateInputData';
import processDeleteData from '../../../processDeleteData';
import processDeleteDataPrepareArgs from '../../../processDeleteDataPrepareArgs';
import getCommonManyData from '../../../createCopyManyEntitiesMutationResolver/resolverAttributes/getCommonData';
import getCommonData from '../../../createCopyEntityMutationResolver/resolverAttributes/getCommonData';

import composeCreateTree from './composeCreateTree';
import mixTrees from './mixTrees';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const {
    entityConfig,
    generalConfig: { enums },
  } = resolverCreatorArg;
  const {
    args: { whereOnes },
    context: { mongooseConn },
  } = resolverArg;
  const { core } = prevPreparedData;

  const getPreviousEntities = Array.isArray(whereOnes) ? getCommonManyData : getCommonData;

  // $FlowFixMe
  const previousEntities = await getPreviousEntities(resolverCreatorArg, resolverArg);

  const whereOnesKeys = Object.keys(Array.isArray(whereOnes) ? whereOnes[0] : whereOnes);

  const [fieldName] = whereOnesKeys;

  const fieldToConnect = (entityConfig.duplexFields || []).find(({ name }) => name === fieldName);
  if (!fieldToConnect) {
    throw new TypeError(
      `Not found duplex field: "${fieldName}" in entity: "${entityConfig.name}"!`,
    );
  }
  const { config: copiedEntityConfig } = fieldToConnect;

  if (!previousEntities) return previousEntities; // to prevent flowjs error

  // eslint-disable-next-line no-underscore-dangle
  if (previousEntities[0]._id) {
    const { duplexFields } = entityConfig;
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

    const pairedPreviouseEntities = previousEntities.reduce((prev, previousEntity, i) => {
      if (!(i % 2)) {
        prev.push([previousEntity]);
      } else {
        prev[prev.length - 1].push(previousEntity);
      }
      return prev;
    }, []);

    pairedPreviouseEntities.forEach(([currentEntity, copiedEntity]) => {
      coreForDeletions = Object.keys(duplexFieldsProjection).length
        ? processDeleteData(
            processDeleteDataPrepareArgs(copiedEntity, currentEntity, entityConfig),
            coreForDeletions,
            entityConfig,
          )
        : coreForDeletions;
    });

    let preparedData = { ...prevPreparedData, core, mains: [] };

    for (let i = 0; i < pairedPreviouseEntities.length; i += 1) {
      const [currentEntity, copiedEntity] = pairedPreviouseEntities[i];

      // eslint-disable-next-line no-await-in-loop
      const tree = await composeCreateTree(
        copiedEntity,
        copiedEntityConfig,
        entityConfig,
        enums,
        mongooseConn,
        null,
      );

      const idsAndEntityConfigs = [{}, currentEntity, entityConfig];

      // eslint-disable-next-line no-await-in-loop
      const currentTree = await composeCreateTree(
        currentEntity,
        entityConfig,
        copiedEntityConfig,
        enums,
        mongooseConn,
        idsAndEntityConfigs,
      );

      const mixedTrees = mixTrees(tree, currentTree, idsAndEntityConfigs, core);

      const tree2 = fromMongoToGqlDataArg(Object.assign(copiedEntity, mixedTrees), entityConfig);

      preparedData = processCreateInputData(
        { ...tree2, id: currentEntity._id }, // eslint-disable-line no-underscore-dangle
        preparedData,
        entityConfig,
        'update',
      );
    }

    return preparedData;
  }

  let preparedData = prevPreparedData;

  for (let i = 0; i < previousEntities.length; i += 1) {
    const copiedEntity = previousEntities[i];

    const idsAndEntityConfigs = [{}, {}, entityConfig];

    // eslint-disable-next-line no-await-in-loop
    const tree = await composeCreateTree(
      copiedEntity,
      copiedEntityConfig,
      entityConfig,
      enums,
      mongooseConn,
      idsAndEntityConfigs,
    );

    const tree2 = fromMongoToGqlDataArg(Object.assign(copiedEntity, tree), entityConfig);

    preparedData = processCreateInputData(tree2, preparedData, entityConfig, 'create');
  }

  return preparedData;
};

export default prepareBulkData;
