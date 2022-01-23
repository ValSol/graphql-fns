// @flow

import type { DuplexField, ThingConfig } from '../flowTypes';

const getOppositeFields = (thingConfig: ThingConfig): Array<[DuplexField, DuplexField]> =>
  (thingConfig.duplexFields || []).map((field) => {
    const { config, oppositeName } = field;

    const oppositeField = (config.duplexFields || []).find(({ name }) => name === oppositeName);

    if (!oppositeField) {
      throw new TypeError(`Expected a duplexField with name "${oppositeName}"!`);
    }

    // $FlowFixMe
    return [field, oppositeField];
  });

export default getOppositeFields;