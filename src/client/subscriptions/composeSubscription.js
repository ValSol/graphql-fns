// @flow
import type { ClientOptions, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeFields from '../composeFields';
import composeDeletedThingSubscriptionArgs from './composeDeletedThingSubscriptionArgs';
import composeCreatedThingSubscriptionArgs from './composeCreatedThingSubscriptionArgs';
import composeUpdatedThingSubscriptionArgs from './composeUpdatedThingSubscriptionArgs';

const composeSubscription = (
  prefixName: string,
  subscriptionName: 'createdThing' | 'deletedThing' | 'updatedThing',
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  let head;

  const { childArgs, fields } = composeFields(thingConfig, generalConfig, {
    ...clientOptions,
    shift: 2,
  });

  switch (subscriptionName) {
    case 'createdThing':
      head = composeCreatedThingSubscriptionArgs(prefixName, thingConfig, childArgs);
      break;

    case 'deletedThing':
      head = composeDeletedThingSubscriptionArgs(prefixName, thingConfig, childArgs);
      break;

    case 'updatedThing':
      head = composeUpdatedThingSubscriptionArgs(prefixName, thingConfig, childArgs);
      break;

    default:
      throw new TypeError(`Invalid subscription value "${subscriptionName}"!`);
  }

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

export default composeSubscription;
