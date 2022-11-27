// @flow

import type { DuplexField, EntityConfig } from '../flowTypes';

const getOppositeFields = (entityConfig: EntityConfig): Array<[DuplexField, DuplexField]> =>
  (entityConfig.duplexFields || []).map((field) => {
    const { config, oppositeName } = field;

    const oppositeField = (config.duplexFields || []).find(({ name }) => name === oppositeName);

    if (!oppositeField) {
      throw new TypeError(`Expected a duplexField with name "${oppositeName}"!`);
    }

    // $FlowFixMe
    return [field, oppositeField];
  });

export default getOppositeFields;
