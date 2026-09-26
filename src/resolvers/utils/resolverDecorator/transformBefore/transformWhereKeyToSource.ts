import type { DuplexField, EntityConfig, InvolvedFilter } from '../../../../tsTypes';

import fromGlobalId from '../../fromGlobalId';

const processItem = ({ id: globalId, ...rest }) => {
  if (!globalId) return { id: globalId, ...rest };

  const { _id: id } = fromGlobalId(globalId);

  return { ...rest, ...{ id } };
};

// value of the duplex field key is always one "YWhereOneInput" (also for array duplex field)
const processWhere = (
  whereKeyToSource: InvolvedFilter | InvolvedFilter[],
  duplexFieldsObject: Record<string, DuplexField>,
) =>
  Object.keys(whereKeyToSource).reduce<Record<string, InvolvedFilter>>((prev, key) => {
    if (!duplexFieldsObject[key]) return prev;

    prev[key] = processItem(whereKeyToSource[key]);

    return prev;
  }, {});

const transformWhereKeyToSource = (
  whereKeyToSource: InvolvedFilter | InvolvedFilter[],
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

  if (Array.isArray(whereKeyToSource)) {
    return whereKeyToSource.map((whereKeyToSourceItem) =>
      processWhere(whereKeyToSourceItem, duplexFieldsObject),
    );
  }

  return processWhere(whereKeyToSource, duplexFieldsObject);
};

export default transformWhereKeyToSource;
