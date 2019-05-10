// @flow

import type { GeneralConfig } from '../../flowTypes';

const checkInventory = require('../../utils/checkInventory');

const composeSubscriptionMutationEnumerations = (generalConfig: GeneralConfig): string => {
  const { inventory, thingConfigs } = generalConfig;
  const linesArray = thingConfigs.reduce((prev, { name }) => {
    if (!checkInventory(['Subscription', 'thingSubscription', name], inventory)) return prev;

    const enums = [];
    if (checkInventory(['Mutation', 'createThing', name], inventory)) enums.push('  CREATED');
    if (checkInventory(['Mutation', 'updateThing', name], inventory)) enums.push('  UPDATED');
    if (checkInventory(['Mutation', 'deleteThing', name], inventory)) enums.push('  DELETED');

    if (enums.length) {
      enums.unshift(`enum ${name}SubscriptionMutationEnumeration {`);
      enums.push('}');
      // eslint-disable-next-line prefer-spread
      prev.push.apply(prev, enums);
    }
    return prev;
  }, []);

  return linesArray.length ? linesArray.join('\n') : '';
};

module.exports = composeSubscriptionMutationEnumerations;
