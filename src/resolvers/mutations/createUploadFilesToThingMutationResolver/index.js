// @flow
import type {
  GeneralConfig,
  ServersideConfig,
  ThingConfig,
  UploadOptions,
} from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import setByPositions from '../../../utils/setByPositions';
import createFileSchema from '../../../mongooseModels/createFileSchema';
import createThing from '../../../mongooseModels/createThing';
import addIdsToThing from '../../addIdsToThing';
import executeAuthorisation from '../../executeAuthorisation';
import composeAllFilesFieldsData from './composeAllFilesFieldsData';
import createPushIntoThingMutationResolver from '../createPushIntoThingMutationResolver';
import createUpdateThingMutationResolver from '../createUpdateThingMutationResolver';
import getHashDoubles from './getHashDoubles';
import saveAllFiles from './saveAllFiles';
import separateFileFieldsAttributes from './separateFileFieldsAttributes';
import separateFileFieldsData from './separateFileFieldsData';

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
    parentFilter: Object,
  ): Object => {
    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);
    if (!filter) return null;
    const {
      whereOne,
      data,
      files,
      options,
      options: { hashes },
      positions,
    } = args;
    const { mongooseConn } = context;

    const filesUploaded = await Promise.all(files);

    const indexesByConfig = separateFileFieldsAttributes(options, thingConfig);

    const hashDoubles = getHashDoubles(options, thingConfig);

    const promises = [];
    indexesByConfig.forEach((indexes, config) => {
      const { name: name2 } = config;
      const fileSchema = createFileSchema(config);
      const FileModel = mongooseConn.model(`${name2}_File`, fileSchema);
      indexes.forEach((index) => {
        if (hashDoubles[index] === null) {
          const hash = hashes[index];
          promises[index] = FileModel.findOne({ hash }, {});
        } else {
          // if there is double mock already uploaded file
          promises[index] = Promise.resolve({});
        }
      });
    });

    const alreadyUploadedFiles = await Promise.all(promises);

    const uploadDate = new Date();
    const filesAttributes = await saveAllFiles(
      filesUploaded,
      alreadyUploadedFiles,
      uploadDate,
      options,
      thingConfig,
      saveFiles,
    );

    const promises2 = [];
    indexesByConfig.forEach((indexes, config) => {
      const { name: name2 } = config;
      const fileSchema = createFileSchema(config);
      const FileModel = mongooseConn.model(`${name2}_File`, fileSchema);
      indexes.forEach((index) => {
        if (alreadyUploadedFiles[index]) {
          promises2[index] = Promise.resolve(alreadyUploadedFiles[index]);
        } else {
          promises2[index] = FileModel.create(filesAttributes[index]);
        }
      });
    });

    // files attributes with _ids
    const filesAttributes2 = (await Promise.all(promises2))
      .map((item, i) => {
        if (hashDoubles[i] !== null) {
          return null;
        }
        if (alreadyUploadedFiles[i]) {
          return item;
        }
        const { _id } = item.toObject();
        return { ...filesAttributes[i], _id };
      })
      .map((item, i, arr) => {
        if (hashDoubles[i] !== null) {
          return arr[hashDoubles[i]];
        }
        return item;
      });

    const fileFieldsData = composeAllFilesFieldsData(
      filesAttributes2,
      data,
      options,
      thingConfig,
      composeFileFieldsData,
    );

    const { forPush, forUpdate } = separateFileFieldsData(fileFieldsData, options, thingConfig);

    let thing;

    if (Object.keys(forUpdate).length) {
      thing = await updateThingMutationResolver(
        parent,
        { whereOne, data: forUpdate },
        context,
        info,
        filter,
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
        filter,
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
