// @flow
import type { ClientOptions, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeFields from '../composeFields';
import composeDeletedThingSubscriptionArgs from './composeDeletedThingSubscriptionArgs';
import composeCreatedThingSubscriptionArgs from './composeCreatedThingSubscriptionArgs';
import composeUpdatedThingSubscriptionArgs from './composeUpdatedThingSubscriptionArgs';

const composeSubscription = (
  subscriptionName: 'createdThing' | 'deletedThing' | 'updatedThing',
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  let head;

  switch (subscriptionName) {
    case 'createdThing':
      head = composeCreatedThingSubscriptionArgs(thingConfig);
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

  const fields = composeFields(thingConfig, generalConfig, { ...clientOptions, shift: 2 });

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

export default composeSubscription;
