// @flow

import type { InputCreator } from '../../flowTypes';

import createEntityUpdateInputType from './createEntityUpdateInputType';

const createUploadFilesToEntityInputType: InputCreator = (entityConfig) => {
  const { fileFields, name, type: configType } = entityConfig;

  const inputName = `UploadFilesTo${name}Input`;

  if (configType !== 'tangible') return [inputName, '', {}];

  const entityTypeArray = [];
  const childChain = {};

  if (fileFields) {
    fileFields
      .filter(({ freeze }) => !freeze)
      .reduce((prev, { name: name2, array, config: config2, config: { name: embeddedName } }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}UpdateInput${array ? '!]' : ''}`);

        childChain[`${embeddedName}UpdateInput`] = [createEntityUpdateInputType, config2];

        return prev;
      }, entityTypeArray);
  }

  if (!entityTypeArray.length) return [inputName, '', {}];

  entityTypeArray.unshift(`input UploadFilesTo${name}Input {`);
  entityTypeArray.push('}');

  const inputDefinition = entityTypeArray.join('\n');

  return [inputName, inputDefinition, childChain];
};

export default createUploadFilesToEntityInputType;
