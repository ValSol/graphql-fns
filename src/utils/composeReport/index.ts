import { diff } from 'deep-object-diff';

import { Context } from '@/tsTypes';

type About = 'created' | 'deleted' | 'updated';

const composeReport = (
  about: About,
  name: string,
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

  switch (about) {
    case 'created':
    case 'deleted':
      pubsub.publish(`${about}-${name}`, { [`${about}${name}`]: node });

      return;

    case 'updated': {
      const updatedFields = Object.keys(diff(node, previousNode));

      pubsub.publish(`${about}-${name}`, {
        [`${about}${name}`]: { node, previousNode, updatedFields },
      });

      return;
    }

    default:
      throw new TypeError(`Got incoorrect about arg: "${about}"!`);
  }
};

export default composeReport;
