// @flow

import type { ThingConfig } from '../../flowTypes';

const isOppositeRequired = (oppositeName: string, config: ThingConfig) => {
  const { name, duplexFields } = config;
  if (!duplexFields) throw new TypeError(`Thing: "${name}" mast have duplexFields!`);
  const oppositeField = duplexFields.find(({ name: fieldName }) => fieldName === oppositeName);
  if (!oppositeField) {
    throw new TypeError(`Thing: "${name}" mast have "${oppositeName}" duplexField!`);
  }
  return oppositeField.required;
};

export default isOppositeRequired;
