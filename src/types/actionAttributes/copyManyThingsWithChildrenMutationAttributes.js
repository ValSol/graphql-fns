// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import getOppositeFields from '../../utils/getOppositeFields';
import createCopyThingOptionsInputType from '../inputs/createCopyThingOptionsInputType';
import createThingCopyWhereOnesInputType from '../inputs/createThingCopyWhereOnesInputType';
import createThingWhereOneToCopyInputType from '../inputs/createThingWhereOneToCopyInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `copyManyThingsWithChildren${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `copyMany${pluralize(baseName)}WithChildren${suffix}`;

const inputCreators = [
  createThingCopyWhereOnesInputType,
  createCopyThingOptionsInputType,
  createThingWhereOneToCopyInputType,
];

const argNames = ['whereOnes', 'options', 'whereOne'];

const argTypes = [
  (name: string): string => `[${name}CopyWhereOnesInput!]!`,
  (name: string): string => `copy${name}OptionsInput`,
  (name: string): string => `[${name}WhereOneToCopyInput!]!`,
];

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  !(thingConfig.embedded || thingConfig.file) &&
  Boolean(createThingCopyWhereOnesInputType(thingConfig)[1]) &&
  Boolean(
    getOppositeFields(thingConfig).filter(([, { array, parent }]) => !(array || parent)).length,
  );

const actionReturnString =
  (suffix: string): ((thingConfig: ThingConfig) => string) =>
  ({ name }) =>
    `[${name}${suffix}!]!`;

const copyManyThingsWithChildrenMutationAttributes = {
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

export default copyManyThingsWithChildrenMutationAttributes;
