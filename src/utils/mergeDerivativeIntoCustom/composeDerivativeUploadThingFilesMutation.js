// @flow
import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeArgs from './composeArgs';

const predicates = [() => true, () => true];

const argNames = [() => 'files', () => 'hashes'];

const argTypes = [() => '[Upload!]!', () => '[String!]!'];

const composeDerivativeUploadThingFilesMutation = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => ({
  name: `uploadThingFiles${suffix}`,
  specificName: (thingConfig) => {
    const { name, file } = thingConfig;
    if (!(allow[name] && allow[name].includes('uploadThingFiles'))) return '';

    return file ? `upload${name}Files${suffix}` : '';
  },
  argNames: composeArgs(argNames, predicates, suffix),
  argTypes: composeArgs(argTypes, predicates, suffix),
  type: ({ name }) => `[${name}${suffix}!]!`,
  config: (thingConfig, generalConfig) =>
    composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
});

export default composeDerivativeUploadThingFilesMutation;
