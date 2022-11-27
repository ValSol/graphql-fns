// @flow
import type { ClientOptions, GeneralConfig, EntityConfig } from '../../flowTypes';

import composeFields from '../composeFields';
import composeEntityFragmentArgs from './composeEntityFragmentArgs';

const composeFragment = (
  fragmentName: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
): string => {
  if (!entityConfig) {
    throw new TypeError('entityConfig must be defined!');
  }

  const head = composeEntityFragmentArgs(fragmentName, entityConfig);

  const { fields } = composeFields(entityConfig, generalConfig, { ...clientOptions, shift: 1 });

  const resultArray = [...head, ...fields, '}'];

  return resultArray.join('\n');
};

export default composeFragment;
