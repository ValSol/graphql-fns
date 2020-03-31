// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingFragmentArgs = (
  fragmentName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const result = [`fragment ${fragmentName} on ${name} {`];

  return result;
};

export default composeThingFragmentArgs;
