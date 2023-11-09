import type { ActionAttributes, EntityConfig, GeneralConfig } from '../tsTypes';
import composeFieldsObject from '../utils/composeFieldsObject';

import checkInventory from '../utils/inventory/checkInventory';
import parseEntityName from '../utils/parseEntityName';
import allActionAttributes from './actionAttributes';
import composeChildActionSignature from './composeChildActionSignature';

const {
  arrayEntitiesThroughConnection,
  arrayEntityCount,
  childEntities,
  childEntitiesThroughConnection,
  childEntity,
  childEntityGetOrCreate,
  childEntityCount,
} = allActionAttributes;

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
): string => {
  const {
    childFields = [],
    counter,
    interfaces = [],
    booleanFields = [],
    calculatedFields = [],
    dateTimeFields = [],
    duplexFields = [],
    embeddedFields = [],
    enumFields = [],
    fileFields = [],
    floatFields = [],
    intFields = [],
    geospatialFields = [],
    relationalFields = [],
    textFields = [],
    type: configType,
    name,
  } = entityConfig as any;

  const interfacesToImplement =
    configType === 'tangible' || configType === 'tangibleFile'
      ? ['Node', ...interfaces]
      : interfaces;

  const entityTypeArray = [
    // use not required ID in embedded entities...
    // ... to not provoke error for null embedded objects
    `type ${name} ${
      interfacesToImplement.length === 0 ? '' : `implements ${interfacesToImplement.join(' & ')} `
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

  textFields.reduce((prev, field) => {
    pushInPrev(field, 'String', prev);

    return prev;
  }, entityTypeArray);

  intFields.reduce((prev, field) => {
    pushInPrev(field, 'Int', prev);

    return prev;
  }, entityTypeArray);

  floatFields.reduce((prev, field) => {
    pushInPrev(field, 'Float', prev);

    return prev;
  }, entityTypeArray);

  dateTimeFields.reduce((prev, field) => {
    pushInPrev(field, 'DateTime', prev);

    return prev;
  }, entityTypeArray);

  booleanFields.reduce((prev, field) => {
    pushInPrev(field, 'Boolean', prev);

    return prev;
  }, entityTypeArray);

  enumFields.reduce((prev, field) => {
    const { enumName } = field;

    pushInPrev(field, `${enumName}Enumeration`, prev);

    return prev;
  }, entityTypeArray);

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

  duplexFields.reduce((prev, { array, name: name2, oppositeName, required, config }) => {
    if (array || required) {
      return prev;
    }

    const { array: oppositeArray } = composeFieldsObject(config)[oppositeName];

    if (oppositeArray) {
      return prev;
    }

    if (checkInventory(['Query', 'childEntityGetOrCreate', config.name])) {
      const childEntityGetOrCreateArgs = composeChildActionSignature(
        config,
        generalConfig,
        'childEntityGetOrCreate',
        inputDic,
      );

      if (childEntityGetOrCreateArgs) {
        prev.push(
          `  ${name2}GetOrCreate(${childEntityGetOrCreateArgs}): ${composeReturnString(
            config,
            generalConfig,
            childEntityGetOrCreate,
          )}`,
        );
      }
    }

    return prev;
  }, entityTypeArray);

  [...embeddedFields, ...fileFields].reduce(
    (prev, { array, name: name2, required, config, variants }) => {
      if (array) {
        if (variants.includes('plain')) {
          prev.push(`  ${name2}${arrayArgs}: [${config.name}!]!`);
        }

        if (variants.includes('connection')) {
          const childEntitiesThroughConnectionArgs = composeChildActionSignature(
            config,
            generalConfig,
            'arrayEntitiesThroughConnection',
            inputDic,
          );

          prev.push(
            `  ${name2}ThroughConnection(${childEntitiesThroughConnectionArgs}): ${composeReturnString(
              config,
              generalConfig,
              arrayEntitiesThroughConnection,
            )}`,
          );
        }

        if (variants.includes('count')) {
          // array "arrayEntityCount" not have any args
          prev.push(
            `  ${name2}Count: ${composeReturnString(config, generalConfig, arrayEntityCount)}`,
          );
        }
      } else {
        prev.push(`  ${name2}: ${config.name}${required ? '!' : ''}`);
      }

      return prev;
    },
    entityTypeArray,
  );

  geospatialFields.reduce((prev, field) => {
    const { geospatialType } = field;

    pushInPrev(field, `Geospatial${geospatialType}`, prev);

    return prev;
  }, entityTypeArray);

  calculatedFields.reduce((prev, field) => {
    const { calculatedType } = field;

    if (calculatedType === 'geospatialFields') {
      const { geospatialType } = field;

      pushInPrev(field, `Geospatial${geospatialType}`, prev);
    } else if (calculatedType === 'enumFields') {
      const { enumName } = field;

      pushInPrev(field, `${enumName}Enumeration`, prev);
    } else if (calculatedType === 'embeddedFields' || calculatedType === 'fileFields') {
      const { array, name: name2, required, config } = field;

      if (array) {
        prev.push(`  ${name2}${arrayArgs}: [${config.name}!]!`);
      } else {
        prev.push(`  ${name2}: ${config.name}${required ? '!' : ''}`);
      }
    } else if (calculatedType === 'textFields') {
      pushInPrev(field, 'String', prev);

      return prev;
    } else if (calculatedType === 'intFields') {
      pushInPrev(field, 'Int', prev);

      return prev;
    } else if (calculatedType === 'floatFields') {
      pushInPrev(field, 'Float', prev);

      return prev;
    } else if (calculatedType === 'dateTimeFields') {
      pushInPrev(field, 'DateTime', prev);

      return prev;
    } else if (calculatedType === 'booleanFields') {
      pushInPrev(field, 'Boolean', prev);

      return prev;
    }

    return prev;
  }, entityTypeArray);

  childFields.reduce((prev, { array, name: name2, required, config: { name: childName } }) => {
    prev.push(
      `  ${name2}: ${array ? '[' : ''}${childName}${array ? '!]!' : ''}${
        !array && required ? '!' : ''
      }`,
    );
    return prev;
  }, entityTypeArray);

  entityTypeArray.push('}');

  const result = entityTypeArray.join('\n');

  return result;
};

export default createEntityType;
