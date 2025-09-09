import { diff } from 'deep-object-diff';

import { Context, EntityConfig, TangibleEntityConfig } from '@/tsTypes';
import composeFieldsObject, { FOR_MONGO_QUERY } from '../composeFieldsObject';

type About = 'created' | 'deleted' | 'updated';

const composeReport = (
  about: About,
  entityConfig: EntityConfig,
  context: Context,
  node: Record<string, any>,
  previousNode?: Record<string, any>, // used only for "updated"
) => {
  const { pubsub } = context;

  if (pubsub === undefined) {
    throw new TypeError(
      `PubSub not found! If you don't use "Subscription" exclude it in "inventory"!`,
    );
  }

  const { name, subscriptionActorConfig } = entityConfig as TangibleEntityConfig;

  const preActor = subscriptionActorConfig
    ? Object.keys(
        composeFieldsObject(subscriptionActorConfig, FOR_MONGO_QUERY).fieldsObject,
      ).reduce((prev, key) => {
        const value = node[key];

        if (value !== null && value !== undefined) {
          prev[key] = node[key];
        }

        return prev;
      }, {})
    : {};

  const actor = Object.keys(preActor).length === 0 ? null : preActor;

  switch (about) {
    case 'created':
    case 'deleted':
      pubsub.publish(`${about}-${name}`, { [`${about}${name}`]: { actor, node } });

      return;

    case 'updated': {
      const updatedFields = Object.keys(diff(node, previousNode));

      pubsub.publish(`${about}-${name}`, {
        [`${about}${name}`]: { actor, node, previousNode, updatedFields },
      });

      return;
    }

    default:
      throw new TypeError(`Got incoorrect about arg: "${about}"!`);
  }
};

export default composeReport;
