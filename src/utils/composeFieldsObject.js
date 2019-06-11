// @flow
import type { ThingConfig, ThingConfigObject } from '../flowTypes';

const composeFieldsObject = (thingConfig: ThingConfig): ThingConfigObject => {
  const {
    booleanFields,
    duplexFields,
    embeddedFields,
    enumFields,
    geospatialFields,
    relationalFields,
  } = thingConfig;

  const scalarFieldTypes = ['textFields', 'intFields', 'floatFields', 'dateTimeFields'];
  const result = scalarFieldTypes.reduce((prev, kind) => {
    if (thingConfig[kind]) {
      thingConfig[kind].forEach(item => {
        const { name } = item;
        // eslint-disable-next-line no-param-reassign
        prev[name] = { ...item, kind };
      });
    }
    return prev;
  }, {});

  if (booleanFields) {
    booleanFields.reduce((prev, item) => {
      const { name } = item;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { ...item, kind: 'booleanFields' };
      return prev;
    }, result);
  }

  if (embeddedFields) {
    embeddedFields.reduce((prev, item) => {
      const { name } = item;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { ...item, kind: 'embeddedFields' };
      return prev;
    }, result);
  }

  if (enumFields) {
    enumFields.reduce((prev, item) => {
      const { name } = item;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { ...item, kind: 'enumFields' };
      return prev;
    }, result);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, item) => {
      const { name } = item;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { ...item, kind: 'geospatialFields' };
      return prev;
    }, result);
  }

  if (duplexFields) {
    duplexFields.reduce((prev, item) => {
      const { name } = item;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { ...item, kind: 'duplexFields' };
      return prev;
    }, result);
  }

  if (relationalFields) {
    relationalFields.reduce((prev, item) => {
      const { name } = item;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { ...item, kind: 'relationalFields' };
      return prev;
    }, result);
  }

  return result;
};

export default composeFieldsObject;
