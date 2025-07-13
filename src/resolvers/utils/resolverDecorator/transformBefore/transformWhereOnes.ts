import type { DuplexField, EntityConfig, InvolvedFilter } from '../../../../tsTypes';

import fromGlobalId from '../../fromGlobalId';

const processItem = ({ id: globalId, ...rest }) => {
  if (!globalId) return { id: globalId, ...rest };

  const { _id: id } = fromGlobalId(globalId);

  return { ...rest, ...{ id } };
};

const processWhere = (
  whereOnes: InvolvedFilter | InvolvedFilter[],
  duplexFieldsObject: Record<string, DuplexField>,
) =>
  Object.keys(whereOnes).reduce<Record<string, InvolvedFilter>>((prev, key) => {
    const duplexField = duplexFieldsObject[key];

    if (!duplexField) return prev;

    const { array } = duplexField;

    if (array) {
      prev[key] = whereOnes[key].map(processItem);
    } else {
      prev[key] = processItem(whereOnes[key]);
    }

    return prev;
  }, {});

const transformWhereOnes = (
  whereOnes: InvolvedFilter | InvolvedFilter[],
  entityConfig: EntityConfig,
): InvolvedFilter | InvolvedFilter[] => {
  const { type: entityType } = entityConfig;

  const duplexFieldsObject = {};

  if (entityType === 'tangible') {
    const { duplexFields = [] } = entityConfig;

    duplexFields.reduce<Record<string, DuplexField>>((prev, duplexField) => {
      prev[duplexField.name] = duplexField;

      return prev;
    }, duplexFieldsObject);
  }

  if (Array.isArray(whereOnes)) {
    return whereOnes.map((whereOnesItem) => processWhere(whereOnesItem, duplexFieldsObject));
  }

  return processWhere(whereOnes, duplexFieldsObject);
};

export default transformWhereOnes;
