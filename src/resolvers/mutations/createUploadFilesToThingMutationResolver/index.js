// @flow
import type {
  GeneralConfig,
  ServersideConfig,
  ThingConfig,
  UploadOptions,
} from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import setByPositions from '../../../utils/setByPositions';
import createThing from '../../../mongooseModels/createThing';
import addIdsToThing from '../../utils/addIdsToThing';
import executeAuthorisation from '../../utils/executeAuthorisation';
import checkData from '../checkData';
import createPushIntoThingMutationResolver from '../createPushIntoThingMutationResolver';
import createUpdateThingMutationResolver from '../createUpdateThingMutationResolver';
import processUploadedFiles from '../processUploadedFiles';
import composeMockFilesData from './composeMockFilesData';

type Args = {
  files: Object,
  options: UploadOptions,
  whereOne: Object,
  data: Object,
  positions: { [key: string]: Array<number> },
};
type Context = { mongooseConn: Object, pubsub?: Object };

const createUploadFilesToThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  const { saveFiles, composeFileFieldsData } = serversideConfig;

  if (!composeFileFieldsData) {
    throw new TypeError(
      '"composeFileFieldsData" callbacks have to be defined in serversideConfig!',
    );
  }

  if (!saveFiles) {
    throw new TypeError('"saveFiles" callbacks have to be defined in serversideConfig!');
  }

  const inventoryChain = ['Mutation', 'uploadFilesToThing', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) {
    return null;
  }

  const inAnyCase2 = true;

  const updateThingMutationResolver = createUpdateThingMutationResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
    inAnyCase2,
  );
  if (!updateThingMutationResolver) return null;

  const pushIntoThingMutationResolver = createPushIntoThingMutationResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
    inAnyCase2,
  );
  if (!pushIntoThingMutationResolver) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilter: Array<Object>,
  ): Object => {
    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);
    if (!filter) return null;
    const { whereOne, data, files, options, positions } = args;
    const { mongooseConn } = context;

    const filesUploaded = await Promise.all(files);

    const toCreate = false;
    const mockFilesData = composeMockFilesData(
      options,
      data,
      filesUploaded,
      thingConfig,
      composeFileFieldsData,
    );
    // check filter upfront data that uploading so if there is limit
    const allowCreate = await checkData(
      mockFilesData,
      filter,
      thingConfig,
      toCreate,
      generalConfig,
      serversideConfig,
      context,
    );

    if (!allowCreate) return null;

    const { forPush, forUpdate } = await processUploadedFiles({
      context,
      data,
      filesUploaded,
      mongooseConn,
      options,
      serversideConfig,
      thingConfig,
    });

    let thing;

    if (Object.keys(forUpdate).length) {
      thing = await updateThingMutationResolver(
        parent,
        { whereOne, data: forUpdate },
        context,
        info,
        [],
      );
    }

    if (Object.keys(forPush).length) {
      const info2 = positions
        ? {
            projection: {
              ...Object.keys(forPush).reduce(
                (prev, key) => {
                  prev[key] = 1; // eslint-disable-line no-param-reassign
                  return prev;
                },
                { _id: 1 },
              ),
            },
          }
        : info;

      thing = await pushIntoThingMutationResolver(
        parent,
        { whereOne, data: forPush },
        context,
        info2,
        [],
      );

      if (positions) {
        const data2 = {};

        Object.keys(positions).forEach((key) => {
          if (!forPush[key]) {
            throw new TypeError(`There is not field "${key}" for push to set positions!`);
          }
          if (forPush[key].length !== positions[key].length) {
            throw new TypeError(
              `Number of created childs: "${forPush[key].length}" but number of positions: "${positions[key].length}"!`,
            );
          }
          data2[key] = setByPositions(thing[key], positions[key]);
        });

        const Thing = await createThing(mongooseConn, thingConfig, enums);
        thing = await Thing.findOneAndUpdate({ _id: thing.id }, data2, {
          new: true,
          lean: true,
        });
      }
    }

    const thing2 = addIdsToThing(thing, thingConfig);

    return thing2;
  };

  return resolver;
};

export default createUploadFilesToThingMutationResolver;
