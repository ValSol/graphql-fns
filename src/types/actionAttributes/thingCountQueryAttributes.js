// @flow

import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from '../inputs/createThingWhereInputType';
import createThingNearInputType from '../inputs/createThingNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `thingCount${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string => `${baseName}Count${suffix}`;

const inputCreators = [
  createThingWhereInputType,
  createThingNearInputType,
  createStringInputTypeForSearch,
];

const argNames = ['where', 'near', 'search'];

const argTypes = [
  (name: string): string => `${name}WhereInput`,
  (name: string): string => `${name}NearInput`,
  (): string => 'String',
];

const actionReturnConfig = false;

const actionAllowed = (thingConfig: ThingConfig): boolean => thingConfig.type === 'tangible';

const actionReturnString =
  (
    // eslint-disable-next-line no-unused-vars
    suffix: string,
  ): ((thingConfig: ThingConfig) => string) =>
  // eslint-disable-next-line no-unused-vars
  ({ name }) =>
    'Int!';

const thingCountQueryAttributes = {
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

export default thingCountQueryAttributes;
