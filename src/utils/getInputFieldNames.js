// @flow

import type { InputCreator, ThingConfig } from '../flowTypes';

const createPushIntoThingInputType = (
  thingConfig: ThingConfig,
  inputCreator: InputCreator,
): Array<string> => {
  const [, inputDefinition] = inputCreator(thingConfig);

  if (!inputDefinition) return [];

  const result = inputDefinition
    .split('\n')
    .slice(1, -1)
    .map((rawStr) => {
      const [str] = rawStr.split(':');
      return str.trim();
    });

  return result;
};

export default createPushIntoThingInputType;
