import { diff } from 'deep-object-diff';

import { Context, EntityConfig, TangibleEntityConfig } from '@/tsTypes';
import composeFieldsObject from '../composeFieldsObject';

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

  const actor = subscriptionActorConfig
    ? Object.keys(composeFieldsObject(subscriptionActorConfig).fieldsObject).reduce((prev, key) => {
        prev[key] = node[key];

        return prev;
      }, {})
    : null;

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
