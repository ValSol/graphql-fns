import type { EntityConfig } from '../../../../tsTypes';

import composeFieldsObject from '../../../../utils/composeFieldsObject';

const composeToken = (fieldName: string, id: any) => `${id}:${fieldName}`;

const checkUnsetsFields = (bulkItems: Array<any>, entityConfig: EntityConfig): void => {
  const fieldsObject = composeFieldsObject(entityConfig);
  const unsets = new Set<string>();

  bulkItems.forEach((item) => {
    if (item.updateOne && item.updateOne.update) {
      if (item.updateOne.update.$unset) {
        const {
          updateOne: {
            filter: { _id: id },
            update: { $unset },
          },
        } = item;

        Object.keys($unset).forEach((fieldName) => {
          if (fieldsObject[fieldName].required) {
            const token = composeToken(fieldName, id);
            unsets.add(token);
          }
        });
      } else if (unsets.size) {
        const {
          updateOne: {
            filter: { _id: id },
            update,
            update: { $set },
          },
        } = item;

        if ($set) {
          Object.keys($set).forEach((fieldName) => {
            if (fieldsObject[fieldName] && fieldsObject[fieldName].required) {
              unsets.delete(composeToken(fieldName, id));
            }
          });
        }

        Object.keys(update).forEach((fieldName) => {
          if (fieldsObject[fieldName] && fieldsObject[fieldName].required) {
            unsets.delete(composeToken(fieldName, id));
          }
        });
      }
    }
  });

  unsets.forEach((token) => {
    const [id, fieldName] = token.split(':');
    if (id !== 'undefined') {
      // TODO correct checking id !== 'undefined'

      throw new TypeError(
        `Try unset required field: "${fieldName}" for entity: "${entityConfig.name}"!`,
      );
    }
  });
};

export default checkUnsetsFields;
