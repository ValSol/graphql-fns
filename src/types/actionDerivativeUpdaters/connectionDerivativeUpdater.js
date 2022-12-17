// @flow

import type { DerivativeAttributes } from '../../flowTypes';

const connectionDerivativeUpdater = (entityName: string, item: { ...DerivativeAttributes }) => {
  const { derivativeKey } = item;

  const edgeName = `${entityName}Edge`;

  const connectionName = `${entityName}Connection`;

  if (!item.allow[edgeName]) {
    item.allow = { ...item.allow, [edgeName]: [] }; // eslint-disable-line no-param-reassign
  }

  if (!item.allow[connectionName]) {
    item.allow = { ...item.allow, [connectionName]: [] }; // eslint-disable-line no-param-reassign
  }

  if (!item.derivativeFields) {
    item.derivativeFields = {}; // eslint-disable-line no-param-reassign
  }

  if (!item.derivativeFields[edgeName]) {
    item.derivativeFields = { ...item.derivativeFields, [edgeName]: { node: derivativeKey } }; // eslint-disable-line no-param-reassign
  }

  if (!item.derivativeFields[connectionName]) {
    // eslint-disable-next-line no-param-reassign
    item.derivativeFields = {
      ...item.derivativeFields,
      [connectionName]: { edges: derivativeKey },
    };
  }
};

export default connectionDerivativeUpdater;
