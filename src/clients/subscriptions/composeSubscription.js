// @flow
import type { ClientOptions, ThingConfig } from '../../flowTypes';

const composeFields = require('../composeFields');
const composeDeletedThingSubscriptionArgs = require('./composeDeletedThingSubscriptionArgs');
const composeNewThingSubscriptionArgs = require('./composeNewThingSubscriptionArgs');
const composeUpdatedThingSubscriptionArgs = require('./composeUpdatedThingSubscriptionArgs');

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

module.exports = composeSubscription;
