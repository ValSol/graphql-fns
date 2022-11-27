// @flow
import type { EntityConfig } from '../../flowTypes';

const composeEntityFragmentArgs = (
  fragmentName: string,
  entityConfig: EntityConfig,
): Array<string> => {
  const { name } = entityConfig;

  const result = [`fragment ${fragmentName} on ${name} {`];

  return result;
};

export default composeEntityFragmentArgs;
