// @flow
import type { ThingConfig } from '../../../flowTypes';

import createCounter from '../../../mongooseModels/createCounter';

const incCounter = async (
  first: Object,
  thingConfig: ThingConfig,
  mongooseConn: Object,
): Promise<Object> => {
  const { name, counter } = thingConfig;

  if (!counter) return first;

  const Counter = createCounter(mongooseConn);

  const { seq } = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      lean: true,
    },
  );

  return { ...first, counter: seq };
};

export default incCounter;
