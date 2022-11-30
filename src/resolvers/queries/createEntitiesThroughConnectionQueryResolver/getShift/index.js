// @flow

import type { ResolverArg } from '../../../flowTypes';

import composeLimitingArgs from './composeLimitingArgs';
import composeProjectionFromArgs from './composeProjectionFromArgs';

const getShift = async (
  _id: string,
  resolverArg: ResolverArg,
  entityQueryResolver: Function,
): Promise<null | number> => {
  const { parent, args, context, parentFilter } = resolverArg;

  const projection = composeProjectionFromArgs(args);

  // eslint-disable-next-line no-await-in-loop
  const thing = await entityQueryResolver(
    parent,
    { whereOne: { id: _id } },
    context,
    { projection },
    parentFilter,
  );

  if (!thing) return null;

  const limitingArgs = composeLimitingArgs(args, thing);

  console.log('limitingArgs =', limitingArgs);

  return 0;
};

export default getShift;
