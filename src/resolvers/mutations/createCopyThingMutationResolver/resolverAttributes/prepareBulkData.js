// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processCreateInputData from '../../processCreateInputData';
import processDeleteData from '../../processDeleteData';
import processDeleteDataPrepareArgs from '../../processDeleteDataPrepareArgs';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const { thingConfig } = resolverCreatorArg;

  const { core, mains: previousThings } = prevPreparedData;

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

    const pairedPreviouseThings = previousThings.reduce((prev, previousThing, i) => {
      if (!(i % 2)) {
        prev.push([previousThing]);
      } else {
        prev[prev.length - 1].push(previousThing);
      }
      return prev;
    }, []);

    pairedPreviouseThings.forEach(([previousThing, data]) => {
      coreForDeletions = Object.keys(duplexFieldsProjection).length
        ? processDeleteData(
            processDeleteDataPrepareArgs(data, previousThing, thingConfig),
            coreForDeletions,
            thingConfig,
          )
        : coreForDeletions;
    });

    let preparedData = { ...prevPreparedData, core: coreForDeletions, mains: [] };

    pairedPreviouseThings.forEach(([previousThing, data]) => {
      preparedData = processCreateInputData(
        { ...data, id: previousThing.id }, // eslint-disable-line no-underscore-dangle
        preparedData,
        thingConfig,
        'update',
      );
    });

    return preparedData;
  }

  let preparedData = { ...prevPreparedData, mains: [] };

  previousThings.forEach((dataItem) => {
    preparedData = processCreateInputData(dataItem, preparedData, thingConfig, 'create');
  });

  return preparedData;
};

export default prepareBulkData;
