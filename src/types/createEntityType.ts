import type { ActionAttributes, EntityConfig, GeneralConfig, Inventory } from '../tsTypes';

import checkInventory from '../utils/inventory/checkInventory';
import parseEntityName from '../utils/parseEntityName';
import { queryAttributes } from './actionAttributes';
import composeChildActionSignature from './composeChildActionSignature';

const {
  arrayEntitiesThroughConnection,
  childEntities,
  childEntitiesThroughConnection,
  childEntity,
  childEntityCount,
} = queryAttributes;

const composeReturnString = (
  config: EntityConfig,
  generalConfig: GeneralConfig,
  actionAttributes: ActionAttributes,
) => {
  const { allEntityConfigs } = generalConfig;
  const { root: rootName, descendantKey } = parseEntityName(config.name, generalConfig);

  return actionAttributes.actionReturnString(allEntityConfigs[rootName], descendantKey);
};

const arrayArgs = '(slice: SliceInput)';

const pushInPrev = (
  { array, name, required }: { array?: boolean; name: string; required?: boolean },
  itemType: string,
  prev: Array<string>,
) => {
  if (array) {
    prev.push(`  ${name}${arrayArgs}: [${itemType}!]!`);
  } else {
    prev.push(`  ${name}: ${itemType}${required ? '!' : ''}`);
  }
};

const createEntityType = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  entityTypeDic: { [entityName: string]: string },
  inputDic: { [inputName: string]: string },
  inventory?: Inventory,
): string => {
  const {
    childFields,
    counter,
    booleanFields,
    dateTimeFields,
    duplexFields = [],
    embeddedFields = [],
    enumFields,
    fileFields = [],
    floatFields,
    intFields,
    geospatialFields,
    relationalFields = [],
    textFields,
    type: configType,
    name,
  } = entityConfig as any;

  const entityTypeArray = [
    // use not required ID in embedded entities...
    // ... to not provoke error for null embedded objects
    `type ${name} ${
      configType === 'tangible' || configType === 'tangibleFile' ? 'implements Node ' : ''
    }{`,
  ];

  if (configType !== 'virtual') {
    entityTypeArray.push('  id: ID!');
  }

  if (configType === 'tangible') {
    entityTypeArray.push(`  createdAt: DateTime!
  updatedAt: DateTime!`);
  }

  if (counter) {
    entityTypeArray.push('  counter: Int!');
  }

  if (textFields) {
    textFields.reduce((prev, field) => {
      pushInPrev(field, 'String', prev);

      return prev;
    }, entityTypeArray);
  }

  if (intFields) {
    intFields.reduce((prev, field) => {
      pushInPrev(field, 'Int', prev);

      return prev;
    }, entityTypeArray);
  }

  if (floatFields) {
    floatFields.reduce((prev, field) => {
      pushInPrev(field, 'Float', prev);

      return prev;
    }, entityTypeArray);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, field) => {
      pushInPrev(field, 'DateTime', prev);

      return prev;
    }, entityTypeArray);
  }

  if (booleanFields) {
    booleanFields.reduce((prev, field) => {
      pushInPrev(field, 'Boolean', prev);

      return prev;
    }, entityTypeArray);
  }

  if (enumFields) {
    enumFields.reduce((prev, field) => {
      const { enumName } = field;

      pushInPrev(field, `${enumName}Enumeration`, prev);

      return prev;
    }, entityTypeArray);
  }

  [...relationalFields, ...duplexFields].reduce(
    (prev, { array, name: name2, required, config }) => {
      if (array) {
        const childEntitiesArgs = composeChildActionSignature(
          config,
          generalConfig,
          'childEntities',
          inputDic,
        );

        if (childEntitiesArgs) {
          prev.push(
            `  ${name2}(${childEntitiesArgs}): ${composeReturnString(
              config,
              generalConfig,
              childEntities,
            )}`,
          );
        }

        const childEntitiesThroughConnectionArgs = composeChildActionSignature(
          config,
          generalConfig,
          'childEntitiesThroughConnection',
          inputDic,
        );

        if (childEntitiesThroughConnectionArgs) {
          prev.push(
            `  ${name2}ThroughConnection(${childEntitiesThroughConnectionArgs}): ${composeReturnString(
              config,
              generalConfig,
              childEntitiesThroughConnection,
            )}`,
          );
        }

        const childEntityCountArgs = composeChildActionSignature(
          config,
          generalConfig,
          'childEntityCount',
          inputDic,
        );

        if (childEntityCountArgs) {
          prev.push(
            `  ${name2}Count(${childEntityCountArgs}): ${composeReturnString(
              config,
              generalConfig,
              childEntityCount,
            )}`,
          );
        }
      } else if (checkInventory(['Query', 'childEntity', config.name])) {
        prev.push(
          `  ${name2}: ${composeReturnString(config, generalConfig, childEntity)}${
            required ? '!' : ''
          }`,
        );
      }

      return prev;
    },
    entityTypeArray,
  );

  [...embeddedFields, ...fileFields].reduce((prev, { array, name: name2, required, config }) => {
    if (array) {
      prev.push(`  ${name2}${arrayArgs}: [${config.name}!]!`);

      const childEntitiesThroughConnectionArgs = composeChildActionSignature(
        config,
        generalConfig,
        'arrayEntitiesThroughConnection',
        inputDic,
      );

      if (childEntitiesThroughConnectionArgs) {
        prev.push(
          `  ${name2}ThroughConnection(${childEntitiesThroughConnectionArgs}): ${composeReturnString(
            config,
            generalConfig,
            arrayEntitiesThroughConnection,
          )}`,
        );
      }
    } else {
      prev.push(`  ${name2}: ${config.name}${required ? '!' : ''}`);
    }

    return prev;
  }, entityTypeArray);

  if (geospatialFields) {
    geospatialFields.reduce((prev, field) => {
      const { geospatialType } = field;

      pushInPrev(field, `Geospatial${geospatialType}`, prev);

      return prev;
    }, entityTypeArray);
  }

  if (childFields) {
    childFields.reduce((prev, { array, name: name2, required, config: { name: childName } }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}${childName}${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, entityTypeArray);
  }

  entityTypeArray.push('}');

  const result = entityTypeArray.join('\n');

  return result;
};

export default createEntityType;
