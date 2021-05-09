// @flow
import type { GeneralConfig, Periphery, ThingConfig } from '../../../flowTypes';

import createThing from '../../../mongooseModels/createThing';
import addIdsToThing from '../../utils/addIdsToThing';

type Context = { mongooseConn: Object, pubsub?: Object };
type PreparedData = {
  core: Map<ThingConfig, Array<Object>>,
  periphery: Periphery,
  mains: Array<Object>,
};

const produceResult = async (
  preparedData: PreparedData,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  context: Context,
  array: boolean,
): Promise<Array<ThingConfig>> => {
  const { enums } = generalConfig;
  const { mongooseConn } = context;
  const {
    mains,
    mains: [first],
  } = preparedData;

  const Thing = await createThing(mongooseConn, thingConfig, enums);

  if (array) {
    const ids = mains.map(({ _id }) => _id);

    const things = await Thing.find({ _id: { $in: ids } }, null, { lean: true });

    const things2 = things.map((item) => addIdsToThing(item, thingConfig));

    return things2;
  }

  // eslint-disable-next-line no-underscore-dangle
  const thing = await Thing.findById(first._id, null, { lean: true });

  const thing2 = addIdsToThing(thing, thingConfig);
  return [thing2];
};

export default produceResult;
