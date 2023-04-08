import type {ClientOptions, GeneralConfig, EntityConfig} from '../../tsTypes';

import composeFields from '../composeFields';
import composeDeletedEntitySubscriptionArgs from './composeDeletedEntitySubscriptionArgs';
import composeCreatedEntitySubscriptionArgs from './composeCreatedEntitySubscriptionArgs';
import composeUpdatedEntitySubscriptionArgs from './composeUpdatedEntitySubscriptionArgs';

const composeSubscription = (
  prefixName: string,
  subscriptionName: 'createdEntity' | 'deletedEntity' | 'updatedEntity',
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  let head;

  const { childArgs, fields } = composeFields(entityConfig, generalConfig, {
    ...clientOptions,
    shift: 2,
  });

  switch (subscriptionName) {
    case 'createdEntity':
      head = composeCreatedEntitySubscriptionArgs(prefixName, entityConfig, childArgs);
      break;

    case 'deletedEntity':
      head = composeDeletedEntitySubscriptionArgs(prefixName, entityConfig, childArgs);
      break;

    case 'updatedEntity':
      head = composeUpdatedEntitySubscriptionArgs(prefixName, entityConfig, childArgs);
      break;

    default:
      throw new TypeError(`Invalid subscription value "${subscriptionName}"!`);
  }

  const resultArray = [...head, ...fields, '  }', '}'];

  return resultArray.join('\n');
};

export default composeSubscription;
