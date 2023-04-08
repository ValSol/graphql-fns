import type { DuplexField, EntityConfig } from '../tsTypes';

const getOppositeFields = (entityConfig: EntityConfig): Array<[DuplexField, DuplexField]> => {
  if (entityConfig.type !== 'tangible') return [];

  return (entityConfig.duplexFields || []).map((field: DuplexField) => {
    const { config, oppositeName } = field;

    const oppositeField = (config.duplexFields || []).find(({ name }) => name === oppositeName);

    if (!oppositeField) {
      throw new TypeError(
        `Expected a duplexField with name "${oppositeName}" in entityConfig "${config.name}"!`,
      );
    }

    return [field, oppositeField];
  });
};

export default getOppositeFields;
