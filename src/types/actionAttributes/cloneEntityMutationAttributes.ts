import type { EntityConfig, GeneralConfig, TangibleEntityConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createEntityCloneInputType from '../inputs/createEntityCloneInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (descendantKey = ''): string => `cloneEntity${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `clone${baseName}${descendantKey}`;

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
  descendantKey = '',
): {
  [key: string]: string;
} => ({
  inputOutputEntity: `${name}${descendantKey}`,
  subscribeUpdatedEntity: name,
});

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  descendantKey?: string,
): null | EntityConfig =>
  descendantKey
    ? composeDescendantConfigByName(descendantKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, descendantKey = ''): string =>
  `${name}${descendantKey}!`;

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
