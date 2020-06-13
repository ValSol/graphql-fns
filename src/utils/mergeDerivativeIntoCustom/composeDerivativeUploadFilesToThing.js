// @flow
import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const composeDerivativeUploadFilesToThing = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => {
  return {
    name: ({ name }) =>
      allow.uploadFilesToThing && allow.uploadFilesToThing.includes(name)
        ? `uploadFilesTo${name}${suffix}`
        : '',
    argNames: () => ['whereOne', 'data', 'files', 'options'],
    argTypes: ({ name }) => [
      `${name}WhereOneInput!`,
      `UploadFilesTo${name}Input!`,
      '[Upload!]!',
      `FilesOf${name}OptionsInput!`,
    ],
    type: ({ name }) => `${name}${suffix}!`,
    config: (thingConfig, generalConfig) =>
      composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
  };
};

export default composeDerivativeUploadFilesToThing;
