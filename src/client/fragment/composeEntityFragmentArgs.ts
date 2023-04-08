import type {EntityConfig} from '../../tsTypes';

const composeEntityFragmentArgs = (fragmentName: string, entityConfig: EntityConfig): Array<string> => {
  const { name } = entityConfig;

  const result = [`fragment ${fragmentName} on ${name} {`];

  return result;
};

export default composeEntityFragmentArgs;
