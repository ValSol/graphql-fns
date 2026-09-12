import type {
  ActionInvolvedEntityNames,
  EntityConfig,
  GeneralConfig,
  TangibleEntityConfig,
} from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createEntityCloneInputType from '../inputs/createEntityCloneInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string => `cloneEntity${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `clone${baseName}${representationKey}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createEntityCloneInputType,
  createStringInputType,
];

const argNames = ['whereOne', 'data', 'token'];

const argTypes = [
  ({ name }): string => `${name}WhereOneInput!`,

  (config: TangibleEntityConfig): string => {
    const { duplexFields = [], relationalFields = [], name } = config;

    const required = [...duplexFields, ...relationalFields].some(
      ({ required: requiredField }) => requiredField,
    );

    return `${name}CloneInput${required ? '!' : ''}`;
  },
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({
  inputOutputEntity: `${name}${representationKey}`,
  subscriptionUpdatedEntity: name, // provide for "name" & all its representations
});

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  representationKey?: string,
): null | EntityConfig =>
  representationKey
    ? composeRepresentationConfigByName(representationKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `${name}${representationKey}!`;

const cloneEntityMutationAttributes = {
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
} as const;

export default cloneEntityMutationAttributes;
