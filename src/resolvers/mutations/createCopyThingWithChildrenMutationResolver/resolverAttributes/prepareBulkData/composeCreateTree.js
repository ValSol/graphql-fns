// @flow
import type { Enums, ThingConfig } from '../../../../../flowTypes';

import getMatchingFields from '../../../../../utils/getMatchingFields';
import createThing from '../../../../../mongooseModels/createThing';

import { getNotArrayOppositeDuplexFields } from '../../../processFieldToDelete';

const composeProjectionAndDuplexFieldsToCopy = (
  fieldName,
  secondThingConfig,
  secondThingConfig2,
) => {
  const matchingFields = getMatchingFields(secondThingConfig, secondThingConfig2).filter(
    (matchingField) => matchingField !== fieldName,
  );

  const duplexFieldsToCopy = getNotArrayOppositeDuplexFields(secondThingConfig)
    .filter(([{ name }]) => matchingFields.includes(name))
    .reduce((prev, [{ name, oppositeName, config, array }]) => {
      prev[name] = [{ oppositeName, config, array }]; // eslint-disable-line no-param-reassign
      return prev;
    }, {});

  getNotArrayOppositeDuplexFields(secondThingConfig2)
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
  thing: Object,
  thingConfig: ThingConfig,
  secondThingConfig: ThingConfig,
  enums?: Enums,
  mongooseConn: Object,
  idsAndThingConfigs: null | [Object, Object, ThingConfig],
  oppositeFieldName?: string,
): Object => {
  const { duplexFieldsToCopy, projection } = composeProjectionAndDuplexFieldsToCopy(
    oppositeFieldName,
    thingConfig,
    secondThingConfig,
  );

  const [currentBranch] = idsAndThingConfigs || [null];

  const result = {};

  const thingFieldNames = Object.keys(thing);

  for (let i = 0; i < thingFieldNames.length; i += 1) {
    const fieldName = thingFieldNames[i];

    if (fieldName === oppositeFieldName) {
      continue; // eslint-disable-line no-continue
    }

    if (duplexFieldsToCopy[fieldName]) {
      const [
        { config: thingConfig2, array, oppositeName },
        { config: secondThingConfig2 },
      ] = duplexFieldsToCopy[fieldName];

      const Thing = await createThing(mongooseConn, thingConfig2, enums); // eslint-disable-line no-await-in-loop

      if (array) {
        // eslint-disable-next-line no-await-in-loop
        const things = await Thing.find({ _id: { $in: thing[fieldName] } }, null, {
          lean: true,
        });

        const thingsObject = things.reduce((prev, item) => {
          prev[item._id] = item; // eslint-disable-line no-param-reassign, no-underscore-dangle

          return prev;
        }, {});

        const rangeredThings = thing[fieldName].map((id) => thingsObject[id]);

        result[fieldName] = [];
        if (currentBranch) {
          currentBranch[fieldName] = []; // eslint-disable-line no-param-reassign
        }

        for (let j = 0; j < rangeredThings.length; j += 1) {
          const rangeredThing = rangeredThings[j];
          if (currentBranch && currentBranch[fieldName]) {
            currentBranch[fieldName].push([{}, rangeredThing, thingConfig2]);
          }

          result[fieldName].push(
            // eslint-disable-next-line no-await-in-loop
            await composeCreateTree(
              rangeredThing,
              thingConfig2,
              secondThingConfig2,
              enums,
              mongooseConn,
              currentBranch ? currentBranch[fieldName][j] : null,
              oppositeName,
            ),
          );
        }
      } else if (!thing[fieldName]) {
        continue; // eslint-disable-line no-continue
      } else {
        // eslint-disable-next-line no-await-in-loop
        const thing2 = await Thing.findOne({ _id: thing[fieldName] }, null, {
          lean: true,
        });

        if (currentBranch) {
          // eslint-disable-next-line no-underscore-dangle
          currentBranch[fieldName] = [{}, thing2, thingConfig2]; // eslint-disable-line no-param-reassign
        }

        // eslint-disable-next-line no-await-in-loop
        result[fieldName] = await composeCreateTree(
          thing2,
          thingConfig2,
          secondThingConfig2,
          enums,
          mongooseConn,
          currentBranch ? currentBranch[fieldName] : null,
          oppositeName,
        );
      }
    } else if (projection[fieldName]) {
      result[fieldName] = thing[fieldName];
    }
  }

  return result;
};

export default composeCreateTree;
