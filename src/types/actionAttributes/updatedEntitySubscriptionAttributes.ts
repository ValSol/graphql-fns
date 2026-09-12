import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import createEntityWherePayloadInputType from '../inputs/createEntityWherePayloadInputType';
import createEntityWhichUpdatedInputType from '../inputs/createEntityWhichUpdatedInputType';
import updatedPayloadRepresentationUpdater from '../actionRepresentationUpdaters/updatedPayloadRepresentationUpdater';

const actionType = 'Subscription';

const actionGeneralName = (representationKey = ''): string => `updatedEntity${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `updated${baseName}${representationKey}`;

const inputCreators = [createEntityWherePayloadInputType, createEntityWhichUpdatedInputType];

const argNames = ['wherePayload', 'whichUpdated'];

const argTypes = [
  ({ name }): string => `${name}WherePayloadInput`,
  ({ name }): string => `${name}WhichUpdatedInput`,
];

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

  const updatedPayloadConfigName = `${name}UpdatedPayload`;

  const updatedPayloadConfig = allEntityConfigs[updatedPayloadConfigName];

  return representationKey
    ? composeRepresentationConfigByName(representationKey, updatedPayloadConfig, generalConfig)
    : updatedPayloadConfig;
};

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `${name}${representationKey}UpdatedPayload!`;

const updatedEntitySubscriptionAttributes = {
  actionGeneralName,
  actionType,
  actionName,
  inputCreators,
  argNames,
  argTypes,
  actionInvolvedEntityNames,
  actionReturnString,
  actionReturnConfig,
  actionRepresentationUpdater: updatedPayloadRepresentationUpdater,
  actionAllowed,
} as const;

export default updatedEntitySubscriptionAttributes;
