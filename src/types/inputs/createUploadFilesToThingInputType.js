// @flow

import type { InputCreator } from '../../flowTypes';

import createThingUpdateInputType from './createThingUpdateInputType';

const createUploadFilesToThingInputType: InputCreator = (thingConfig) => {
  const { embedded, file, fileFields, name } = thingConfig;

  const inputName = `UploadFilesTo${name}Input`;

  if (embedded || file) return [inputName, '', {}];

  const thingTypeArray = [];
  const childChain = {};

  if (fileFields) {
    fileFields.reduce(
      (prev, { name: name2, array, config: config2, config: { name: embeddedName } }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}UpdateInput${array ? '!]' : ''}`);

        childChain[`${embeddedName}UpdateInput`] = [createThingUpdateInputType, config2];

        return prev;
      },
      thingTypeArray,
    );
  }

  if (!thingTypeArray.length) return [inputName, '', {}];

  thingTypeArray.unshift(`input UploadFilesTo${name}Input {`);
  thingTypeArray.push('}');

  const inputDefinition = thingTypeArray.join('\n');

  return [inputName, inputDefinition, childChain];
};

export default createUploadFilesToThingInputType;
