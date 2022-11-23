// @flow

import type { InputCreator } from '../../flowTypes';

import createThingUpdateInputType from './createThingUpdateInputType';

const createUploadFilesToThingInputType: InputCreator = (thingConfig) => {
  const { fileFields, name, type: configType } = thingConfig;

  const inputName = `UploadFilesTo${name}Input`;

  if (configType !== 'tangible') return [inputName, '', {}];

  const thingTypeArray = [];
  const childChain = {};

  if (fileFields) {
    fileFields
      .filter(({ freeze }) => !freeze)
      .reduce((prev, { name: name2, array, config: config2, config: { name: embeddedName } }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}UpdateInput${array ? '!]' : ''}`);

        childChain[`${embeddedName}UpdateInput`] = [createThingUpdateInputType, config2];

        return prev;
      }, thingTypeArray);
  }

  if (!thingTypeArray.length) return [inputName, '', {}];

  thingTypeArray.unshift(`input UploadFilesTo${name}Input {`);
  thingTypeArray.push('}');

  const inputDefinition = thingTypeArray.join('\n');

  return [inputName, inputDefinition, childChain];
};

export default createUploadFilesToThingInputType;
