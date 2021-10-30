// @flow

import type { ThingConfig } from '../../flowTypes';

import getOppositeFields from '../../utils/getOppositeFields';
import createThingWhereOneInputType from '../inputs/createThingWhereOneInputType';
import createDeleteThingWithChildrenOptionsInputType from '../inputs/createDeleteThingWithChildrenOptionsInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `deleteThingWithChildren${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `delete${baseName}WithChildren${suffix}`;

const inputCreators = [createThingWhereOneInputType, createDeleteThingWithChildrenOptionsInputType];

const argNames = ['whereOne', 'options'];

const argTypes = [
  (name: string): string => `${name}WhereOneInput!`,
  (name: string): string => `delete${name}WithChildrenOptionsInput`,
];

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  !(thingConfig.embedded || thingConfig.file) &&
  Boolean(
    getOppositeFields(thingConfig).filter(([, { array, parent }]) => !(array || parent)).length,
  );

const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  `${name}${suffix}!`;

const deleteThingWithChildrenMutationAttributes = {
  actionGeneralName,
  actionType,
  actionName,
  inputCreators,
  argNames,
  argTypes,
  actionReturnString,
  actionReturnConfig,
  actionAllowed,
};

export default deleteThingWithChildrenMutationAttributes;
