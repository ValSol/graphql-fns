// @flow
import type { ThingConfig } from '../../flowTypes';

const transformInputData = (data: Object, thingConfig: ThingConfig): Object => {
  const { embeddedFields, relationalFields } = thingConfig;

  let relationalFieldsNames = [];
  if (relationalFields) {
    relationalFieldsNames = relationalFields.map(({ name }) => name);
  }

  const embeddedFieldsConfigs = {};
  if (embeddedFields) {
    embeddedFields.reduce((prev, { name, config }) => {
      // eslint-disable-next-line
      prev[name] = config;
      return prev;
    }, embeddedFieldsConfigs);
  }

  const data2 = Object.keys(data).reduce((prev, key) => {
    if (relationalFieldsNames.includes(key)) {
      // eslint-disable-next-line no-param-reassign
      prev[key] = data[key].connect;
    } else if (embeddedFieldsConfigs[key]) {
      // eslint-disable-next-line no-param-reassign
      prev[key] = transformInputData(data[key], embeddedFieldsConfigs[key]);
    } else {
      // eslint-disable-next-line no-param-reassign
      prev[key] = data[key];
    }
    return prev;
  }, {});

  return data2;
};

module.exports = transformInputData;
