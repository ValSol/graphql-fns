import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import createEntityWherePayloadInputType from '../inputs/createEntityWherePayloadInputType';
import createdOrDeletedPayloadRepresentationUpdater from '../actionRepresentationUpdaters/createdOrDeletedPayloadRepresentationUpdater';

const actionType = 'Subscription';

const actionGeneralName = (representationKey = ''): string => `deletedEntity${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `deleted${baseName}${representationKey}`;

const inputCreators = [createEntityWherePayloadInputType];

const argNames = ['wherePayload'];

const argTypes = [({ name }): string => `${name}WherePayloadInput`];

// may will not be in use
const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({ inputOutputEntity: `${name}${representationKey}` });

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  representationKey?: string,
): null | EntityConfig => {
  const { name } = entityConfig;

  const { allEntityConfigs } = generalConfig;

  const deletedPayloadConfigName = `${name}CreatedOrDeletedPayload`;

  const deletedPayloadConfig = allEntityConfigs[deletedPayloadConfigName];

  return representationKey
    ? composeRepresentationConfigByName(representationKey, deletedPayloadConfig, generalConfig)
    : deletedPayloadConfig;
};
const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `${name}${representationKey}CreatedOrDeletedPayload!`;

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
  actionRepresentationUpdater: createdOrDeletedPayloadRepresentationUpdater,
  actionAllowed,
} as const;

export default deletedEntitySubscriptionAttributes;
