// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';
import createThingQueryResolver from '../../queries/createThingQueryResolver';
import composeFieldsObject from '../../../utils/composeFieldsObject';
import transformDataForPush from './transformDataForPush';

type Arg = {
  processingKind: 'create' | 'update' | 'push',
  projection: { [missingFieldName: string]: 1 },
  args: {
    whereOne: Object,
    data: { [fieldName: string]: any },
    positions?: { [fieldName: string]: Array<number> },
  },
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  context: Object,
};

const getMissingData = async ({
  processingKind,
  projection,
  args,
  thingConfig,
  generalConfig,
  serversideConfig,
  context,
}: Arg): Promise<Object | null> => {
  const inAnyCase = true;

  const thingQueryResolver = createThingQueryResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
    inAnyCase,
  );

  if (!thingQueryResolver) return null;

  const { whereOne, data } = args;

  const thing = await thingQueryResolver(null, { whereOne }, context, { projection }, []);

  if (!thing) return null;

  const thing2 = processingKind === 'push' ? transformDataForPush(thing, args, thingConfig) : thing;

  const fieldsObj = composeFieldsObject(thingConfig);

  const result = {};

  Object.keys(fieldsObj).forEach((key) => {
    if (data[key] !== undefined) {
      if (data[key] !== null) result[key] = data[key];
    } else {
      const { kind } = fieldsObj[key];
      if (kind === 'duplexFields' || kind === 'relationalFields') {
        result[key] = { connect: thing2[key] };
      } else {
        result[key] = thing2[key];
      }
    }
  });

  return result;
};

export default getMissingData;
