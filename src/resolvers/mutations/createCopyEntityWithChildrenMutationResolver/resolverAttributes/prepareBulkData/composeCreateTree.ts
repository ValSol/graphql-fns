import { Connection } from 'mongoose';

import type { Enums, GraphqlObject, TangibleEntityConfig } from '../../../../../tsTypes';

import getMatchingFields from '../../../../../utils/getMatchingFields';
import createMongooseModel from '../../../../../mongooseModels/createMongooseModel';

import { getNotArrayOppositeDuplexFields } from '../../../processFieldToDelete';

const composeProjectionAndDuplexFieldsToCopy = (
  fieldName: undefined | string,
  secondEntityConfig: TangibleEntityConfig,
  secondEntityConfig2: TangibleEntityConfig,
) => {
  const matchingFields = getMatchingFields(secondEntityConfig, secondEntityConfig2).filter(
    (matchingField) => matchingField !== fieldName,
  );

  const duplexFieldsToCopy = getNotArrayOppositeDuplexFields(secondEntityConfig)
    .filter(([{ name }]) => matchingFields.includes(name))
    .reduce((prev, [{ name, oppositeName, config, array }]) => {
      prev[name] = [{ oppositeName, config, array }]; // eslint-disable-line no-param-reassign
      return prev;
    }, {});

  getNotArrayOppositeDuplexFields(secondEntityConfig2)
    .filter(([{ name }]) => matchingFields.includes(name))
    .reduce((prev, [{ name, oppositeName, config, array }]) => {
      prev[name].push({ oppositeName, config, array }); // eslint-disable-line no-param-reassign
      return prev;
    }, duplexFieldsToCopy);

  const projection = matchingFields.reduce<Record<string, any>>((prev, matchingField) => {
    prev[matchingField] = 1; // eslint-disable-line no-param-reassign
    return prev;
  }, {});

  return { duplexFieldsToCopy, projection };
};

const composeCreateTree = async (
  entity: GraphqlObject,
  entityConfig: TangibleEntityConfig,
  secondEntityConfig: TangibleEntityConfig,
  enums: Enums | null | undefined,
  mongooseConn: Connection,
  idsAndEntityConfigs: null | [GraphqlObject, GraphqlObject, TangibleEntityConfig],
  oppositeFieldName?: string,
): Promise<GraphqlObject> => {
  const { duplexFieldsToCopy, projection } = composeProjectionAndDuplexFieldsToCopy(
    oppositeFieldName,
    entityConfig,
    secondEntityConfig,
  );

  const [currentBranch] = idsAndEntityConfigs || [null];

  const result: Record<string, any> = {};

  const entityFieldNames = Object.keys(entity);

  for (let i = 0; i < entityFieldNames.length; i += 1) {
    const fieldName = entityFieldNames[i];

    if (fieldName === oppositeFieldName) {
      continue; // eslint-disable-line no-continue
    }

    if (duplexFieldsToCopy[fieldName]) {
      const [{ config: entityConfig2, array, oppositeName }, { config: secondEntityConfig2 }] =
        duplexFieldsToCopy[fieldName];

      const Entity = await createMongooseModel(mongooseConn, entityConfig2, enums); // eslint-disable-line no-await-in-loop

      if (array) {
        // eslint-disable-next-line no-await-in-loop
        const entities = await Entity.find({ _id: { $in: entity[fieldName] } }, null, {
          lean: true,
        });

        const entitiesObject = entities.reduce((prev, item) => {
          prev[item._id] = item; // eslint-disable-line no-param-reassign, no-underscore-dangle

          return prev;
        }, {});

        const rangeredEntities = (entity[fieldName] as string[]).map((id) => entitiesObject[id]);

        result[fieldName] = [];
        if (currentBranch) {
          currentBranch[fieldName] = []; // eslint-disable-line no-param-reassign
        }

        for (let j = 0; j < rangeredEntities.length; j += 1) {
          const rangeredEntity = rangeredEntities[j];
          if (currentBranch && currentBranch[fieldName]) {
            (currentBranch[fieldName] as any[]).push([{}, rangeredEntity, entityConfig2]);
          }

          result[fieldName].push(
            // eslint-disable-next-line no-await-in-loop
            await composeCreateTree(
              rangeredEntity,
              entityConfig2,
              secondEntityConfig2,
              enums,
              mongooseConn,
              currentBranch ? currentBranch[fieldName][j] : null,
              oppositeName,
            ),
          );
        }
      } else if (!entity[fieldName]) {
        continue; // eslint-disable-line no-continue
      } else {
        // eslint-disable-next-line no-await-in-loop
        const entity2 = await Entity.findOne({ _id: entity[fieldName] }, null, {
          lean: true,
        });

        if (currentBranch) {
          // eslint-disable-next-line no-underscore-dangle
          currentBranch[fieldName] = [{}, entity2, entityConfig2]; // eslint-disable-line no-param-reassign
        }

        // eslint-disable-next-line no-await-in-loop
        result[fieldName] = await composeCreateTree(
          entity2,
          entityConfig2,
          secondEntityConfig2,
          enums,
          mongooseConn,
          currentBranch ? (currentBranch[fieldName] as any) : null,
          oppositeName,
        );
      }
    } else if (projection[fieldName]) {
      result[fieldName] = entity[fieldName];
    }
  }

  return result;
};

export default composeCreateTree;
