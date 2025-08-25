import type { NearInput, InvolvedFilter } from '@/tsTypes';

type Args = {
  where?: any;
  near?: NearInput;
  sort?: {
    sortBy: Array<string>;
  };
  search?: string;
  after?: string;
  before?: string;
  first?: number;
  last?: number;
  // "objectIds_from_parent" pipeline used only to call from createChildEntitiesThroughConnectionQueryResolver
  objectIds_from_parent?: Array<any>;
};

const modifyConnectionArgsAndInvolvedFilters = (
  args: Args,
  involvedFilters: {
    [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
  },
  name: string,
): [
  Args,
  { [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number] },
] => {
  if (!involvedFilters) {
    return [args, involvedFilters];
  }

  const { inputOutputEntity } = involvedFilters;

  if (!inputOutputEntity) {
    return [args, involvedFilters];
  }

  const [filter, limit] = inputOutputEntity;

  if (!limit) {
    return [args, involvedFilters];
  }

  const modifiedInvolvedFilters: {
    [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
  } = {
    inputOutputEntity: [filter],
  };

  const { first, last, ...rest } = args;

  if (first && first > limit) {
    if (args.before) {
      throw TypeError(
        `For "before" arg ("${args.before}", entity: "${name}") found "first" arg ("${first}")!`,
      );
    }

    return [{ ...rest, first: limit }, modifiedInvolvedFilters];
  }

  if (last && last > limit) {
    if (args.after) {
      throw TypeError(
        `For "after" arg ("${args.after}", entity: "${name}") found "last" arg ("${last}")!`,
      );
    }

    return [{ ...rest, last: limit }, modifiedInvolvedFilters];
  }

  return [args, modifiedInvolvedFilters];
};

export default modifyConnectionArgsAndInvolvedFilters;
