// @flow

import type { ThingConfig } from '../../flowTypes';

const createUploadFilesToThingInputType = (thingConfig: ThingConfig): string => {
  const { embedded, fileFields, name } = thingConfig;

  if (embedded) return '';

  const thingTypeArray = [];

  if (fileFields) {
    fileFields.reduce((prev, { name: name2, array, config: { name: embeddedName } }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}UpdateInput${array ? '!]' : ''}`);
      return prev;
    }, thingTypeArray);
  }

  if (!thingTypeArray.length) return '';

  thingTypeArray.unshift(`input UploadFilesTo${name}Input {`);
  thingTypeArray.push('}');

  const result = thingTypeArray.join('\n');

  return result;
};

export default createUploadFilesToThingInputType;
