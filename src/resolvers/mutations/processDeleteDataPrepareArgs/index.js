// @flow
import type { ThingConfig } from '../../../flowTypes';

const processDeleteDataPrepareArgs = (
  data: { [key: string]: any },
  prevData: { [key: string]: any },
  thingConfig: ThingConfig,
): { [key: string]: any } => {
  const { duplexFields } = thingConfig;

  const result = { _id: prevData._id }; // eslint-disable-line no-underscore-dangle

  if (duplexFields) {
    duplexFields.forEach(({ array, name }) => {
      if (data[name]) {
        result[name] = prevData[name];
      } else if (array) {
        result[name] = [];
      }
    });
  }

  return result;
};

export default processDeleteDataPrepareArgs;
