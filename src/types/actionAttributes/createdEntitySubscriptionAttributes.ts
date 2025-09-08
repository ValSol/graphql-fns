import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeDescendantConfigByName from '@/utils/composeDescendantConfigByName';
import createEntityWherePayloadInputType from '../inputs/createEntityWherePayloadInputType';
import createdOrDeletedPayloadDescendantUpdater from '../actionDescendantUpdaters/createdOrDeletedPayloadDescendantUpdater';

const actionType = 'Subscription';

const actionGeneralName = (descendantKey = ''): string => `createdEntity${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `created${baseName}${descendantKey}`;

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

  const createdPayloadConfigName = `${name}CreatedOrDeletedPayload`;

  const createdPayloadConfig = allEntityConfigs[createdPayloadConfigName];

  return descendantKey
    ? composeDescendantConfigByName(descendantKey, createdPayloadConfig, generalConfig)
    : createdPayloadConfig;
};

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, descendantKey = ''): string =>
  `${name}${descendantKey}CreatedOrDeletedPayload!`;

const createdEntitySubscriptionAttributes = {
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

export default createdEntitySubscriptionAttributes;
