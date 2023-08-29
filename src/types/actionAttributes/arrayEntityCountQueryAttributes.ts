import type { EntityConfig } from '../../tsTypes';

const actionType = 'Field';

const actionGeneralName = (descendantKey = ''): string => `arrayEntityCount${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `array${baseName}Count${descendantKey}`;

const inputCreators = [];

const argNames = [];

const argTypes = [];

const actionInvolvedEntityNames = (
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  descendantKey = '',
): {
  [key: string]: string;
} => ({});

const actionReturnConfig = (): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'embedded' || entityConfig.type === 'file';

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
