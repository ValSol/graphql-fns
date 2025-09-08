import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeDescendantConfigByName from '@/utils/composeDescendantConfigByName';
import createEntityWherePayloadInputType from '../inputs/createEntityWherePayloadInputType';
import createdOrDeletedPayloadDescendantUpdater from '../actionDescendantUpdaters/createdOrDeletedPayloadDescendantUpdater';

const actionType = 'Subscription';

const actionGeneralName = (descendantKey = ''): string => `deletedEntity${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `deleted${baseName}${descendantKey}`;

const inputCreators = [createEntityWherePayloadInputType];

const argNames = ['wherePayload'];

const argTypes = [({ name }): string => `${name}WherePayloadInput`];

// may will not be in use
const actionInvolvedEntityNames = (
  name: string,
  descendantKey = '',
): ActionInvolvedEntityNames => ({ inputOutputEntity: `${name}${descendantKey}` });

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  descendantKey?: string,
): null | EntityConfig => {
  const { name } = entityConfig;

  const { allEntityConfigs } = generalConfig;

  const deletedPayloadConfigName = `${name}CreatedOrDeletedPayload`;

  const deletedPayloadConfig = allEntityConfigs[deletedPayloadConfigName];

  return descendantKey
    ? composeDescendantConfigByName(descendantKey, deletedPayloadConfig, generalConfig)
    : deletedPayloadConfig;
};
const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, descendantKey = ''): string =>
  `${name}${descendantKey}CreatedOrDeletedPayload!`;

const deletedEntitySubscriptionAttributes = {
  actionGeneralName,
  actionType,
  actionName,
  inputCreators,
  argNames,
  argTypes,
  actionInvolvedEntityNames,
  actionReturnString,
  actionReturnConfig,
  actionDescendantUpdater: createdOrDeletedPayloadDescendantUpdater,
  actionAllowed,
} as const;

export default deletedEntitySubscriptionAttributes;
