// @flow
import type { PrepareBulkData } from '../../../flowTypes';
import type { Enums, ThingConfig } from '../../../../flowTypes';

import getMatchingFields from '../../../../utils/getMatchingFields';
import createThing from '../../../../mongooseModels/createThing';
import fromMongoToGqlDataArg from '../../../types/fromMongoToGqlDataArg';
import processCreateInputData from '../../processCreateInputData';
import processDeleteData from '../../processDeleteData';
import processDeleteDataPrepareArgs from '../../processDeleteDataPrepareArgs';

import { getNotArrayOppositeDuplexFields } from '../../processFieldToDelete';

const composeProjectionAndDuplexFieldsToCopy = (fieldName, thingConfig, thingConfig2) => {
  const matchingFields = getMatchingFields(thingConfig, thingConfig2).filter(
    (matchingField) => matchingField !== fieldName,
  );

  const duplexFieldsToCopy = getNotArrayOppositeDuplexFields(thingConfig)
    .filter(([{ name }]) => matchingFields.includes(name))
    .reduce((prev, [{ name, oppositeName, config, array }]) => {
      prev[name] = [{ oppositeName, config, array }]; // eslint-disable-line no-param-reassign
      return prev;
    }, {});

  getNotArrayOppositeDuplexFields(thingConfig2)
    .filter(([{ name }]) => matchingFields.includes(name))
    .reduce((prev, [{ name, oppositeName, config, array }]) => {
      prev[name].push({ oppositeName, config, array }); // eslint-disable-line no-param-reassign
      return prev;
    }, duplexFieldsToCopy);

  const projection = matchingFields.reduce((prev, matchingField) => {
    prev[matchingField] = 1; // eslint-disable-line no-param-reassign
    return prev;
  }, {});

  return { duplexFieldsToCopy, projection };
};

const composeCreateTree = async (
  copiedThing: Object,
  thing?: Object,
  copiedThingConfig: ThingConfig,
  thingConfig: ThingConfig,
  enums?: Enums,
  mongooseConn: Object,
  oppositeFieldName?: string,
) => {
  const { duplexFieldsToCopy, projection } = composeProjectionAndDuplexFieldsToCopy(
    oppositeFieldName,
    copiedThingConfig,
    thingConfig,
  );

  const result = {};
  const thingFieldNames = Object.keys(copiedThing);

  for (let i = 0; i < thingFieldNames.length; i += 1) {
    const fieldName = thingFieldNames[i];

    if (fieldName === oppositeFieldName) {
      continue; // eslint-disable-line no-continue
    }

    if (duplexFieldsToCopy[fieldName]) {
      const [
        { config: copiedThingConfig2, array, oppositeName },
        { config: thingConfig2 },
      ] = duplexFieldsToCopy[fieldName];

      const СopiedThing = await createThing(mongooseConn, copiedThingConfig2, enums); // eslint-disable-line no-await-in-loop

      if (array) {
        // eslint-disable-next-line no-await-in-loop
        const copiedThings = await СopiedThing.find(
          { _id: { $in: copiedThing[fieldName] } },
          null,
          {
            lean: true,
          },
        );

        const copiedThingsObject = copiedThings.reduce((prev, item) => {
          prev[item._id] = item; // eslint-disable-line no-param-reassign, no-underscore-dangle

          return prev;
        }, {});

        const rangeredCopiedThings = copiedThing[fieldName].map((id) => copiedThingsObject[id]);

        result[fieldName] = [];
        for (let j = 0; j < rangeredCopiedThings.length; j += 1) {
          result[fieldName].push(
            // eslint-disable-next-line no-await-in-loop
            await composeCreateTree(
              rangeredCopiedThings[j],
              null,
              thingConfig2,
              copiedThingConfig2,
              enums,
              mongooseConn,
              oppositeName,
            ),
          );
        }
      } else {
        // eslint-disable-next-line no-await-in-loop
        const copiedThing2 = await СopiedThing.findOne({ _id: copiedThing[fieldName] }, null, {
          lean: true,
        });

        // eslint-disable-next-line no-await-in-loop
        result[fieldName] = await composeCreateTree(
          copiedThing2,
          null,
          copiedThingConfig2,
          thingConfig2,
          enums,
          mongooseConn,
          oppositeName,
        );
      }
    } else if (projection[fieldName]) {
      result[fieldName] = copiedThing[fieldName];
    }
  }

  return result;
};

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const {
    thingConfig,
    generalConfig: { enums },
  } = resolverCreatorArg;

  const { core, mains: previousThings } = prevPreparedData;

  const {
    args: { whereOnes },
    context: { mongooseConn },
  } = resolverArg;
  const whereOnesKeys = Object.keys(whereOnes);

  const [fieldName] = whereOnesKeys;

  const fieldToConnect = (thingConfig.duplexFields || []).find(({ name }) => name === fieldName);
  if (!fieldToConnect) {
    throw new TypeError(`Not found duplex field: "${fieldName}" in thing: "${thingConfig.name}"!`);
  }
  const { config: copiedThingConfig } = fieldToConnect;

  if (previousThings[0].id) {
    const { duplexFields } = thingConfig;
    const duplexFieldsProjection = duplexFields
      ? duplexFields.reduce(
          (prev, { name: name2 }) => {
            prev[name2] = 1; // eslint-disable-line no-param-reassign
            return prev;
          },
          { _id: 1 },
        )
      : {};

    let coreForDeletions = core;

    const pairedPreviouseThings = previousThings.reduce((prev, copiedThing, i) => {
      if (!(i % 2)) {
        prev.push([copiedThing]);
      } else {
        prev[prev.length - 1].push(copiedThing);
      }
      return prev;
    }, []);

    pairedPreviouseThings.forEach(([copiedThing, data]) => {
      coreForDeletions = Object.keys(duplexFieldsProjection).length
        ? processDeleteData(
            processDeleteDataPrepareArgs(data, copiedThing, thingConfig),
            coreForDeletions,
            thingConfig,
          )
        : coreForDeletions;
    });

    let preparedData = { ...prevPreparedData, core: coreForDeletions, mains: [] };

    pairedPreviouseThings.forEach(([copiedThing, data]) => {
      preparedData = processCreateInputData(
        { ...data, id: copiedThing.id }, // eslint-disable-line no-underscore-dangle
        preparedData,
        thingConfig,
        'update',
      );
    });

    return preparedData;
  }

  let preparedData = { ...prevPreparedData, mains: [] };

  for (let i = 0; i < previousThings.length; i += 1) {
    const copiedThing = previousThings[i];

    // eslint-disable-next-line no-await-in-loop
    const tree = await composeCreateTree(
      copiedThing,
      null,
      copiedThingConfig,
      thingConfig,
      enums,
      mongooseConn,
    );

    const tree2 = fromMongoToGqlDataArg(Object.assign(copiedThing, tree), thingConfig);

    preparedData = processCreateInputData(tree2, preparedData, thingConfig, 'create');
  }

  return preparedData;
};

export default prepareBulkData;
