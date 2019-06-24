// @flow
import type { ClientOptions, ThingConfig } from '../../flowTypes';

import composeFields from '../composeFields';
import composeDeletedThingSubscriptionArgs from './composeDeletedThingSubscriptionArgs';
import composeNewThingSubscriptionArgs from './composeNewThingSubscriptionArgs';
import composeUpdatedThingSubscriptionArgs from './composeUpdatedThingSubscriptionArgs';

const composeSubscription = (
  subscriptionName: 'newThing' | 'deletedThing' | 'updatedThing',
  thingConfig: ThingConfig,
  clientOptions: ClientOptions = {},
): string => {
  let head;

  switch (subscriptionName) {
    case 'newThing':
      head = composeNewThingSubscriptionArgs(thingConfig);
      break;

    case 'deletedThing':
      head = composeDeletedThingSubscriptionArgs(thingConfig);
      break;

    case 'updatedThing':
      head = composeUpdatedThingSubscriptionArgs(thingConfig);
      break;

    default:
      throw new TypeError(`Invalid subscription value "${subscriptionName}"!`);
  }

  const fields = composeFields(thingConfig, { ...clientOptions, shift: 2 });

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

export default composeSubscription;
