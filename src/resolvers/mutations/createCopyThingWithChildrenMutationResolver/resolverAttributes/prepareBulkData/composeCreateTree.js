// @flow
import type { Enums, ThingConfig } from '../../../../../flowTypes';

import getMatchingFields from '../../../../../utils/getMatchingFields';
import createThing from '../../../../../mongooseModels/createThing';

import { getNotArrayOppositeDuplexFields } from '../../../processFieldToDelete';

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
  copiedThingConfig: ThingConfig,
  thingConfig: ThingConfig,
  enums?: Enums,
  mongooseConn: Object,
  idsAndThingConfigs: null | Object,
  oppositeFieldName?: string,
): Object => {
  const { duplexFieldsToCopy, projection } = composeProjectionAndDuplexFieldsToCopy(
    oppositeFieldName,
    copiedThingConfig,
    thingConfig,
  );

  const [currentBranch] = idsAndThingConfigs || [null];

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
        if (currentBranch && currentBranch[fieldName]) {
          currentBranch[fieldName] = []; // eslint-disable-line no-param-reassign
        }

        for (let j = 0; j < rangeredCopiedThings.length; j += 1) {
          const rangeredCopiedThing = rangeredCopiedThings[j];
          if (currentBranch && currentBranch[fieldName]) {
            currentBranch[fieldName].push([
              {},
              // eslint-disable-next-line no-underscore-dangle
              rangeredCopiedThing._id.toString(),
              copiedThingConfig2,
            ]);
          }

          result[fieldName].push(
            // eslint-disable-next-line no-await-in-loop
            await composeCreateTree(
              rangeredCopiedThing,
              thingConfig2,
              copiedThingConfig2,
              enums,
              mongooseConn,
              currentBranch ? currentBranch[fieldName][j] : null,
              oppositeName,
            ),
          );
        }
      } else {
        // eslint-disable-next-line no-await-in-loop
        const copiedThing2 = await СopiedThing.findOne({ _id: copiedThing[fieldName] }, null, {
          lean: true,
        });

        if (currentBranch && currentBranch[fieldName]) {
          // eslint-disable-next-line no-underscore-dangle
          currentBranch[fieldName] = [{}, copiedThing2._id.toString(), copiedThingConfig2]; // eslint-disable-line no-param-reassign
        }

        // eslint-disable-next-line no-await-in-loop
        result[fieldName] = await composeCreateTree(
          copiedThing2,
          copiedThingConfig2,
          thingConfig2,
          enums,
          mongooseConn,
          currentBranch ? currentBranch[fieldName] : null,
          oppositeName,
        );
      }
    } else if (projection[fieldName]) {
      result[fieldName] = copiedThing[fieldName];
    }
  }

  return result;
};

export default composeCreateTree;
