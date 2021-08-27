// @flow

import type { ThingConfig } from '../../../../flowTypes';

import composeFieldsObject from '../../../../utils/composeFieldsObject';

const composeToken = (fieldName, id) => `${id}:${fieldName}`;

const checkUnsetsFields = (bulkItems: Array<Object>, thingConfig: ThingConfig): void => {
  const fieldsObject = composeFieldsObject(thingConfig);
  const unsets = new Set();

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
          if (fieldsObject[fieldName].attributes.required) {
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
            if (fieldsObject[fieldName] && fieldsObject[fieldName].attributes.required) {
              unsets.delete(composeToken(fieldName, id));
            }
          });
        }

        Object.keys(update).forEach((fieldName) => {
          if (fieldsObject[fieldName] && fieldsObject[fieldName].attributes.required) {
            unsets.delete(composeToken(fieldName, id));
          }
        });
      }
    }
  });

  unsets.forEach((token) => {
    const [, fieldName] = token.split(':');
    throw new TypeError(
      `Try unset required field: "${fieldName}" for thing: "${thingConfig.name}"!`,
    );
  });
};

export default checkUnsetsFields;
