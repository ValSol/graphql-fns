// @flow
import type { ClientOptions, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeFields from '../composeFields';
import composeThingFragmentArgs from './composeThingFragmentArgs';

const composeFragment = (
  fragmentName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  if (!thingConfig) {
    throw new TypeError('thingConfig must be defined!');
  }

  const head = composeThingFragmentArgs(fragmentName, thingConfig);

  const fields = composeFields(thingConfig, generalConfig, { ...clientOptions, shift: 1 });

  const resultArray = [...head, ...fields, '}'];

  return resultArray.join('\n');
};

export default composeFragment;
