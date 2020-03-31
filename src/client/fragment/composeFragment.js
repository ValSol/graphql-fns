// @flow
import type { ClientOptions, ThingConfig } from '../../flowTypes';

import composeFields from '../composeFields';
import composeThingFragmentArgs from './composeThingFragmentArgs';

const composeFragment = (
  fragmentName: string,
  thingConfig: ThingConfig,
  clientOptions: ClientOptions = {},
): string => {
  const head = composeThingFragmentArgs(fragmentName, thingConfig);

  const fields = composeFields(thingConfig, { ...clientOptions, shift: 1 });

  const resultArray = [...head, ...fields, '}'];

  return resultArray.join('\n');
};

export default composeFragment;
