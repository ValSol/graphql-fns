import type { InputCreator } from '../../tsTypes';

import createEntityWhereInputType from './createEntityWhereInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';
import isOppositeRequired from './isOppositeRequired';

const createEntityCreateInputType: InputCreator = (entityConfig) => {
  const {
    booleanFields = [],
    dateTimeFields = [],
    embeddedFields = [],
    enumFields = [],
    fileFields = [],
    floatFields = [],
    intFields = [],
    geospatialFields = [],
    textFields = [],
    type: configType,
    name,
  } = entityConfig;

  const inputName = `${name}CreateInput`;
  const childChain: Record<string, any> = {};

  const entityTypeArray: Array<Array<string>> = [[`input ${name}CreateInput {`]];

  if (configType === 'tangible') {
    entityTypeArray[0].push('  id: ID');

    const { filterFields = [], duplexFields = [], relationalFields = [] } = entityConfig;

    duplexFields.reduce((prev, { name: name2, config, required }) => {
      if (required) {
        prev.push([`input ${name}CreateThru_${name2}_FieldInput {`]);
      }

      childChain[`${config.name}CreateInput`] = [createEntityCreateInputType, config];

      return prev;
    }, entityTypeArray);

    for (let i = 0; i < entityTypeArray.length; i += 1) {
      let requiredCount = 1;
      duplexFields.reduce(
        (
          prev,
          {
            array,
            name: name2,
            oppositeName,
            required,
            config,
            config: { name: relationalEntityName },
          },
        ) => {
          const oppositeRequired = isOppositeRequired(oppositeName, config);
          if (oppositeRequired) {
            prev.push(
              `  ${name2}: ${relationalEntityName}${
                array
                  ? `CreateOrPushThru_${oppositeName}_FieldChildrenInput`
                  : `CreateThru_${oppositeName}_FieldChildInput`
              }${required && requiredCount !== i ? '!' : ''}`,
            );
          } else {
            prev.push(
              `  ${name2}: ${relationalEntityName}${
                array ? 'CreateOrPushChildrenInput' : 'CreateChildInput'
              }${required && requiredCount !== i ? '!' : ''}`,
            );
          }
          if (required) requiredCount += 1;

          return prev;
        },
        entityTypeArray[i],
      );
    }

    for (let i = 0; i < entityTypeArray.length; i += 1) {
      relationalFields.reduce((prev, { array, name: name2, parent, required, config }) => {
        if (parent) {
          return prev;
        }

        const { name: relationalEntityName } = config;

        prev.push(
          `  ${name2}: ${relationalEntityName}${
            array ? 'CreateOrPushChildrenInput' : 'CreateChildInput'
          }${required ? '!' : ''}`,
        );

        childChain[`${config.name}CreateInput`] = [createEntityCreateInputType, config];

        return prev;
      }, entityTypeArray[i]);
    }

    for (let i = 0; i < entityTypeArray.length; i += 1) {
      filterFields
        .filter(({ freeze }) => !freeze)
        .reduce(
          (
            prev,
            { name: name2, array, required, config: config2, config: { name: entityName } },
          ) => {
            if (array) {
              prev.push(`  ${name2}: ${entityName}WhereInput${required ? '!' : ''}`);

              childChain[`${entityName}WhereInput`] = [createEntityWhereInputType, config2];
            } else {
              prev.push(`  ${name2}: ${entityName}WhereOneInput${required ? '!' : ''}`);

              childChain[`${entityName}WhereOneInput`] = [createEntityWhereOneInputType, config2];
            }

            return prev;
          },
          entityTypeArray[i],
        );
    }
  }

  for (let i = 0; i < entityTypeArray.length; i += 1) {
    textFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}String${array ? '!]' : ''}${required ? '!' : ''}`);
      return prev;
    }, entityTypeArray[i]);
  }

  for (let i = 0; i < entityTypeArray.length; i += 1) {
    intFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}Int${array ? '!]' : ''}${required ? '!' : ''}`);
      return prev;
    }, entityTypeArray[i]);
  }

  for (let i = 0; i < entityTypeArray.length; i += 1) {
    floatFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}Float${array ? '!]' : ''}${required ? '!' : ''}`);
      return prev;
    }, entityTypeArray[i]);
  }

  for (let i = 0; i < entityTypeArray.length; i += 1) {
    dateTimeFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}DateTime${array ? '!]' : ''}${required ? '!' : ''}`,
      );
      return prev;
    }, entityTypeArray[i]);
  }

  for (let i = 0; i < entityTypeArray.length; i += 1) {
    booleanFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}Boolean${array ? '!]' : ''}${required ? '!' : ''}`);
      return prev;
    }, entityTypeArray[i]);
  }

  for (let i = 0; i < entityTypeArray.length; i += 1) {
    enumFields.reduce((prev, { array, enumName, name: name2, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}${enumName}Enumeration${array ? '!]' : ''}${
          required ? '!' : ''
        }`,
      );
      return prev;
    }, entityTypeArray[i]);
  }

  for (let i = 0; i < entityTypeArray.length; i += 1) {
    embeddedFields.reduce(
      (prev, { array, name: name2, required, config, config: { name: embeddedName } }) => {
        prev.push(
          `  ${name2}: ${array ? '[' : ''}${embeddedName}CreateInput${array ? '!]' : ''}${
            required ? '!' : ''
          }`,
        );

        childChain[`${config.name}CreateInput`] = [createEntityCreateInputType, config];

        return prev;
      },
      entityTypeArray[i],
    );
  }

  // the same code as for embeddedFields

  for (let i = 0; i < entityTypeArray.length; i += 1) {
    fileFields.reduce(
      (prev, { array, name: name2, required, config, config: { name: embeddedName } }) => {
        prev.push(
          `  ${name2}: ${array ? '[' : ''}${embeddedName}CreateInput${array ? '!]' : ''}${
            required ? '!' : ''
          }`,
        );

        childChain[`${config.name}CreateInput`] = [createEntityCreateInputType, config];

        return prev;
      },
      entityTypeArray[i],
    );
  }

  for (let i = 0; i < entityTypeArray.length; i += 1) {
    geospatialFields.reduce((prev, { array, name: name2, geospatialType, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}Geospatial${geospatialType}Input${array ? '!]' : ''}${
          required ? '!' : ''
        }`,
      );
      return prev;
    }, entityTypeArray[i]);
  }

  for (let i = 0; i < entityTypeArray.length; i += 1) {
    entityTypeArray[i].push('}');
  }

  const entityTypeArray2 = entityTypeArray.map((arr) => arr.join('\n'));

  if (configType === 'tangible') {
    entityTypeArray2.push(`input ${name}CreateChildInput {
  connect: ID
  create: ${name}CreateInput
}
input ${name}CreateOrPushChildrenInput {
  connect: [ID!]
  create: [${name}CreateInput!]
  createPositions: [Int!]
}`);

    if (configType === 'tangible' && entityConfig?.duplexFields?.length > 0) {
      entityConfig.duplexFields.reduce((prev, { name: name2, required }) => {
        if (required) {
          entityTypeArray2.push(`input ${name}CreateThru_${name2}_FieldChildInput {
  connect: ID
  create: ${name}CreateThru_${name2}_FieldInput
}
input ${name}CreateOrPushThru_${name2}_FieldChildrenInput {
  connect: [ID!]
  create: [${name}CreateThru_${name2}_FieldInput!]
  createPositions: [Int!]
}`);
        }
        return prev;
      }, entityTypeArray2);
    }
  }

  const inputDefinition = entityTypeArray2.join('\n');

  return [inputName, inputDefinition, childChain];
};

export default createEntityCreateInputType;
