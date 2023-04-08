import type { TangibleEntityConfig } from '../../../../tsTypes';
import type { PrepareBulkData, PreparedData } from '../../../tsTypes';

import fromMongoToGqlDataArg from '../../../types/fromMongoToGqlDataArg';
import processCreateInputData from '../../processCreateInputData';
import processDeleteData from '../../processDeleteData';
import processDeleteDataPrepareArgs from '../../processDeleteDataPrepareArgs';
import getCommonManyData from '../../createCopyManyEntitiesMutationResolver/resolverAttributes/getCommonData';
import getCommonData from './getCommonData';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const { entityConfig } = resolverCreatorArg as { entityConfig: TangibleEntityConfig };
  const {
    args: { whereOnes },
  } = resolverArg;
  const { core } = prevPreparedData;

  const getMains = Array.isArray(whereOnes) ? getCommonManyData : getCommonData;

  const mains = await getMains(resolverCreatorArg, resolverArg);

  const previousEntities = mains.map((previousEntity) => ({
    ...fromMongoToGqlDataArg(previousEntity, entityConfig),
    _id: previousEntity._id, // eslint-disable-line no-underscore-dangle
  }));

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

    const pairedPreviouseEntities = previousEntities.reduce<Array<any>>(
      (prev, previousEntity, i) => {
        if (!(i % 2)) {
          prev.push([previousEntity]);
        } else {
          prev[prev.length - 1].push(previousEntity);
        }
        return prev;
      },
      [],
    );

    pairedPreviouseEntities.forEach(([previousEntity, data]: [any, any]) => {
      coreForDeletions = Object.keys(duplexFieldsProjection).length
        ? processDeleteData(
            processDeleteDataPrepareArgs(data, previousEntity, entityConfig),
            coreForDeletions,
            entityConfig,
          )
        : coreForDeletions;
    });

    let preparedData: PreparedData = { ...prevPreparedData, core: coreForDeletions, mains: [] };

    pairedPreviouseEntities.forEach(([previousEntity, data]: [any, any]) => {
      preparedData = processCreateInputData(
        { ...data, id: previousEntity._id }, // eslint-disable-line no-underscore-dangle
        preparedData,
        entityConfig,
        'update',
      );
    });

    return preparedData;
  }

  let preparedData: PreparedData = prevPreparedData;

  previousEntities.forEach((dataItem) => {
    preparedData = processCreateInputData(dataItem, preparedData, entityConfig, 'create');
  });

  return preparedData;
};

export default prepareBulkData;
