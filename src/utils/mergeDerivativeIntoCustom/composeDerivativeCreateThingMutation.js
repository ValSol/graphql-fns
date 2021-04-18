// @flow
import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import createFilesOfThingOptionsInputType from '../../types/inputs/createFilesOfThingOptionsInputType';
import createThingReorderCreatedInputType from '../../types/inputs/createThingReorderCreatedInputType';
import createUploadFilesToThingInputType from '../../types/inputs/createUploadFilesToThingInputType';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeArgs from './composeArgs';

const predicates = [
  () => true,
  createThingReorderCreatedInputType,
  createFilesOfThingOptionsInputType,
  createUploadFilesToThingInputType,
];

const argNames = [() => 'data', () => 'positions', () => 'optionsForUpload', () => 'dataForUpload'];

const argTypes = [
  (name) => `${name}CreateInput!`,
  (name) => `${name}ReorderCreatedInput`,
  (name) => `FilesOf${name}OptionsInput`,
  (name) => `UploadFilesTo${name}Input`,
];

const composeDerivativeCreateThingMutation = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => ({
  name: `createThing${suffix}`,
  specificName: ({ name }) =>
    allow[name] && allow[name].includes('createThing') ? `create${name}${suffix}` : '',
  argNames: composeArgs(argNames, predicates, suffix),
  argTypes: composeArgs(argTypes, predicates, suffix),
  type: ({ name }) => `${name}${suffix}!`,
  config: (thingConfig, generalConfig) =>
    composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
});

export default composeDerivativeCreateThingMutation;
