// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingFragmentArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [`fragment my${name} on ${name} {`];

  return result;
};

export default composeThingFragmentArgs;
