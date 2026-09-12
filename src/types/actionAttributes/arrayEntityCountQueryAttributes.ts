import type { ActionInvolvedEntityNames, EntityConfig } from '@/tsTypes';

const actionType = 'Field';

const actionGeneralName = (representationKey = ''): string =>
  `arrayEntityCount${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `array${baseName}Count${representationKey}`;

const inputCreators = [];

const argNames = [];

const argTypes = [];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({});

const actionReturnConfig = (): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'embedded';

const actionIsChild = 'Array';

const actionReturnString = (): string => 'Int!';

const arrayEntityCountQueryAttributes = {
  actionGeneralName,
  actionType,
  actionName,
  inputCreators,
  argNames,
  argTypes,
  actionInvolvedEntityNames,
  actionReturnString,
  actionReturnConfig,
  actionAllowed,
  actionIsChild,
} as const;

export default arrayEntityCountQueryAttributes;
