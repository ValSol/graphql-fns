import type { DuplexField, EntityConfig, InvolvedFilter } from '../../../../tsTypes';

import fromGlobalId from '../../fromGlobalId';

const processItem = ({ id: globalId, ...rest }) => {
  if (!globalId) return { id: globalId, ...rest };

  const { _id: id } = fromGlobalId(globalId);

  return { ...rest, ...{ id } };
};

// value of the duplex field key is always one "YWhereOneInput" (also for array duplex field)
const processWhere = (
  whereSource: InvolvedFilter | InvolvedFilter[],
  duplexFieldsObject: Record<string, DuplexField>,
) =>
  Object.keys(whereSource).reduce<Record<string, InvolvedFilter>>((prev, key) => {
    if (!duplexFieldsObject[key]) return prev;

    prev[key] = processItem(whereSource[key]);

    return prev;
  }, {});

const transformWhereSource = (
  whereSource: InvolvedFilter | InvolvedFilter[],
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

  if (Array.isArray(whereSource)) {
    return whereSource.map((whereSourceItem) => processWhere(whereSourceItem, duplexFieldsObject));
  }

  return processWhere(whereSource, duplexFieldsObject);
};

export default transformWhereSource;
