// @flow

import type { ThingConfig } from '../../../flowTypes';

import createPushIntoThingInputType from '../../../types/inputs/createPushIntoThingInputType';
import getInputFieldNames from '../../../utils/getInputFieldNames';

const transformDataForPush = (
  currentData: { [fieldName: string]: any },
  args: { data: { [fieldName: string]: any }, positions?: { [fieldName: string]: Array<number> } },
  thingConfig: ThingConfig,
): Object => {
  const { data, positions } = args;

  const pushFields = getInputFieldNames(thingConfig, createPushIntoThingInputType);

  const result = {};

  Object.keys(currentData).forEach((key) => {
    if (pushFields.includes(key)) {
      if (data[key] && data[key].create) {
        throw new TypeError(`Using "create" for "${key}" data field!`);
      }

      const dataItem = data[key] && data[key].connect ? data[key].connect : data[key];

      if (!positions || !positions[key]) {
        result[key] =
          dataItem && dataItem.length ? currentData[key].concat(dataItem) : currentData[key];
      } else {
        result[key] = [...currentData[key]];
        positions[key].forEach((pos, i) => {
          result[key].splice(pos, 0, dataItem[i]);
        });
      }
    }
  });

  return result;
};

export default transformDataForPush;
