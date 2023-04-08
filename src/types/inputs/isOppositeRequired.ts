import type { TangibleEntityConfig } from '../../tsTypes';

const isOppositeRequired = (oppositeName: string, config: TangibleEntityConfig): boolean => {
  const { name, duplexFields } = config;
  if (!duplexFields) throw new TypeError(`Entity: "${name}" mast have duplexFields!`);
  const oppositeField = duplexFields.find(({ name: fieldName }) => fieldName === oppositeName);
  if (!oppositeField) {
    throw new TypeError(`Entity: "${name}" mast have "${oppositeName}" duplexField!`);
  }
  return Boolean(oppositeField.required);
};

export default isOppositeRequired;
