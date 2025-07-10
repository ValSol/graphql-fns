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
  session,
) => {
  const { entityConfig } = resolverCreatorArg as { entityConfig: TangibleEntityConfig };
  const {
    args: { whereOnes, data: additionalData },
  } = resolverArg;
  const { core } = prevPreparedData;

  const getMains = Array.isArray(whereOnes) ? getCommonManyData : getCommonData;

  const additionalDataArr = Array.isArray(whereOnes)
    ? additionalData || Array(whereOnes.length).fill({})
    : additionalData
      ? [additionalData]
      : [{}];

  const mains = await getMains(resolverCreatorArg, resolverArg, session);

  const previousEntities = mains.map((previousEntity) => ({
    ...fromMongoToGqlDataArg(previousEntity, entityConfig),
    _id: previousEntity._id,
  }));

  if (previousEntities[0]._id) {
    const { duplexFields } = entityConfig;
    const duplexFieldsProjection = duplexFields
      ? duplexFields.reduce(
          (prev, { name: name2 }) => {
            prev[name2] = 1;
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
      coreForDeletions =
        Object.keys(duplexFieldsProjection).length > 0
          ? processDeleteData(
              processDeleteDataPrepareArgs(data, previousEntity, entityConfig),
              coreForDeletions,
              entityConfig,
            )
          : coreForDeletions;
    });

    let preparedData: PreparedData = { ...prevPreparedData, core: coreForDeletions, mains: [] };

    pairedPreviouseEntities.forEach(([previousEntity, data]: [any, any], i) => {
      preparedData = processCreateInputData(
        { ...data, id: previousEntity._id, ...additionalDataArr[i] },
        preparedData,
        entityConfig,
        'update',
      );
    });

    return preparedData;
  }

  let preparedData: PreparedData = prevPreparedData;

  previousEntities.forEach((dataItem, i) => {
    preparedData = processCreateInputData(
      { ...dataItem, ...additionalDataArr[i] },
      preparedData,
      entityConfig,
      'create',
    );
  });

  return preparedData;
};

export default prepareBulkData;
