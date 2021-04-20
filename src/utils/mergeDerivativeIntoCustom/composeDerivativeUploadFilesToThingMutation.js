// @flow
import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import createFilesOfThingOptionsInputType from '../../types/inputs/createFilesOfThingOptionsInputType';
import createThingReorderUploadedInputType from '../../types/inputs/createThingReorderUploadedInputType';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeArgs from './composeArgs';

const predicates = [
  () => true,
  () => true,
  () => true,
  () => true,
  createThingReorderUploadedInputType,
];

const argNames = [
  () => 'whereOne',
  () => 'data',
  () => 'files',
  () => 'options',
  () => 'positions',
];

const argTypes = [
  (name) => `${name}WhereOneInput!`,
  (name) => `UploadFilesTo${name}Input`,
  () => '[Upload!]!',
  (name) => `FilesOf${name}OptionsInput!`,
  (name) => `${name}ReorderUploadedInput`,
];

const composeDerivativeUploadFilesToThingMutation = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => ({
  name: `uploadFilesToThing${suffix}`,
  specificName: (thingConfig, generalConfig) => {
    const { name } = thingConfig;
    if (!(allow[name] && allow[name].includes('uploadFilesToThing'))) return '';

    const derivativeConfig = composeDerivativeConfigByName(suffix, thingConfig, generalConfig);

    const filesInput = createFilesOfThingOptionsInputType(derivativeConfig);

    return filesInput ? `uploadFilesTo${name}${suffix}` : '';
  },
  argNames: composeArgs(argNames, predicates, suffix),
  argTypes: composeArgs(argTypes, predicates, suffix),
  type: ({ name }) => `${name}${suffix}!`,
  config: (thingConfig, generalConfig) =>
    composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
});

export default composeDerivativeUploadFilesToThingMutation;
