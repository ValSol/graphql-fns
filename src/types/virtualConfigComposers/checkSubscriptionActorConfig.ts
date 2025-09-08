import type { CalculatedField, EmbeddedField, VirtualEntityConfig } from '@/tsTypes';

import composeFieldsObject from '@/utils/composeFieldsObject';
import composeCreatedOrDeletedPayloadVirtualConfigName from './composeCreatedOrDeletedPayloadVirtualConfigName';

const checkSubscriptionActorConfig = (
  calculatedFields: CalculatedField[],
  subscriptionActorConfig: VirtualEntityConfig,
) => {
  const { fieldsObject: subscriptionActorFieldsObject } =
    composeFieldsObject(subscriptionActorConfig);
  const subscriptionActorFieldNames = Object.keys(subscriptionActorFieldsObject);

  const calculatedFieldNameToCalculatedType = calculatedFields.reduce((prev, field) => {
    const { name, calculatedType } = field;

    if (calculatedType === 'embeddedFields') {
      const { config } = field;

      const { name: embeddedEntityName } = config;

      prev[name] = `${calculatedType}:${embeddedEntityName}`;
    } else {
      prev[name] = calculatedType;
    }

    return prev;
  }, {});

  subscriptionActorFieldNames.forEach((actorFieldName) => {
    const [calculatedType, embeddedEntityName] =
      calculatedFieldNameToCalculatedType[actorFieldName].split(':');

    if (!calculatedType) {
      throw new TypeError(`Not found actor field: "${actorFieldName}" in calculated fields!`);
    }

    const actorFieldType = subscriptionActorFieldsObject[actorFieldName].type;

    if (calculatedType !== actorFieldType) {
      throw new TypeError(
        `Got actor field type: "${actorFieldType}", but calculated field calculatedType: "${calculatedType}" for field: "${actorFieldName}"!`,
      );
    }

    if (embeddedEntityName) {
      const embeddedConfig = (subscriptionActorFieldsObject[actorFieldName] as EmbeddedField)
        .config;

      const { name: actorEmbeddedEntityName } = embeddedConfig;

      if (embeddedEntityName !== actorEmbeddedEntityName) {
        throw new TypeError(
          `For field: "${actorFieldName}" got actor embedded field config: "${actorEmbeddedEntityName}", but calculated embedded field config is: "${embeddedEntityName}"!`,
        );
      }
    }
  });

  return;
};

export default checkSubscriptionActorConfig;
