import type { EntityConfig, InputCreator, TangibleEntityConfig } from '../../tsTypes';

import createEntityWhereInputType from './createEntityWhereInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';
import isOppositeRequired from './isOppositeRequired';

type ChildChain = { [inputSpecificName: string]: [InputCreator, EntityConfig] };

// fields of "XCreateInput" or (if "thruFieldName" is set) of "XCreateThru_<thruFieldName>_FieldInput" ...
// ... where the required duplex field "thruFieldName" is optional (it is filled by the parent)
const composeCreateInputDefinition = (
  entityConfig: EntityConfig,
  inputName: string,
  thruFieldName?: string,
): [string, ChildChain] => {
  const {
    booleanFields = [],
    dateTimeFields = [],
    embeddedFields = [],
    enumFields = [],
    floatFields = [],
    intFields = [],
    geospatialFields = [],
    textFields = [],
    type: configType,
  } = entityConfig;

  const childChain: ChildChain = {};

  const entityTypeArray = [`input ${inputName} {`];

  if (configType === 'tangible') {
    // the id can be set only on creation of the entity itself, not thru the required duplex field
    if (!thruFieldName) entityTypeArray.push('  id: ID');

    const { filterFields = [], duplexFields = [], relationalFields = [] } = entityConfig;

    duplexFields.reduce((prev, { array, name: name2, oppositeName, required, config }) => {
      const [childInputName, childInputCreator] = getChildInputNameAndCreator(
        config,
        array,
        isOppositeRequired(oppositeName, config) ? oppositeName : undefined,
      );

      prev.push(`  ${name2}: ${childInputName}${required && name2 !== thruFieldName ? '!' : ''}`);

      childChain[childInputName] = [childInputCreator, config];

      return prev;
    }, entityTypeArray);

    relationalFields.reduce((prev, { array, name: name2, parent, required, config }) => {
      if (parent) {
        return prev;
      }

      const [childInputName, childInputCreator] = getChildInputNameAndCreator(config, array);

      prev.push(`  ${name2}: ${childInputName}${required ? '!' : ''}`);

      childChain[childInputName] = [childInputCreator, config];

      return prev;
    }, entityTypeArray);

    // frozen fields (also filter ones) can be set on creation, "freeze" forbids only updating
    filterFields.reduce(
      (prev, { name: name2, array, required, config: config2, config: { name: entityName } }) => {
        if (array) {
          prev.push(`  ${name2}: ${entityName}WhereInput${required ? '!' : ''}`);

          childChain[`${entityName}WhereInput`] = [createEntityWhereInputType, config2];
        } else {
          prev.push(`  ${name2}: ${entityName}WhereOneInput${required ? '!' : ''}`);

          childChain[`${entityName}WhereOneInput`] = [createEntityWhereOneInputType, config2];
        }

        return prev;
      },
      entityTypeArray,
    );
  }

  textFields.reduce((prev, { array, name: name2, required }) => {
    prev.push(`  ${name2}: ${array ? '[' : ''}String${array ? '!]' : ''}${required ? '!' : ''}`);
    return prev;
  }, entityTypeArray);

  intFields.reduce((prev, { array, name: name2, required }) => {
    prev.push(`  ${name2}: ${array ? '[' : ''}Int${array ? '!]' : ''}${required ? '!' : ''}`);
    return prev;
  }, entityTypeArray);

  floatFields.reduce((prev, { array, name: name2, required }) => {
    prev.push(`  ${name2}: ${array ? '[' : ''}Float${array ? '!]' : ''}${required ? '!' : ''}`);
    return prev;
  }, entityTypeArray);

  dateTimeFields.reduce((prev, { array, name: name2, required }) => {
    prev.push(`  ${name2}: ${array ? '[' : ''}DateTime${array ? '!]' : ''}${required ? '!' : ''}`);
    return prev;
  }, entityTypeArray);

  booleanFields.reduce((prev, { array, name: name2, required }) => {
    prev.push(`  ${name2}: ${array ? '[' : ''}Boolean${array ? '!]' : ''}${required ? '!' : ''}`);
    return prev;
  }, entityTypeArray);

  enumFields.reduce((prev, { array, enumName, name: name2, required }) => {
    prev.push(
      `  ${name2}: ${array ? '[' : ''}${enumName}Enumeration${array ? '!]' : ''}${
        required ? '!' : ''
      }`,
    );
    return prev;
  }, entityTypeArray);

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
    entityTypeArray,
  );

  geospatialFields.reduce((prev, { array, name: name2, geospatialType, required }) => {
    prev.push(
      `  ${name2}: ${array ? '[' : ''}Geospatial${geospatialType}Input${array ? '!]' : ''}${
        required ? '!' : ''
      }`,
    );
    return prev;
  }, entityTypeArray);

  entityTypeArray.push('}');

  return [entityTypeArray.join('\n'), childChain];
};

const createEntityCreateInputType: InputCreator = (entityConfig) => {
  const inputName = `${entityConfig.name}CreateInput`;

  const [inputDefinition, childChain] = composeCreateInputDefinition(entityConfig, inputName);

  return [inputName, inputDefinition, childChain];
};

// "connect" / "create" inputs of relational & duplex fields

export const createEntityCreateChildInputType: InputCreator = (entityConfig) => {
  const { name, type: configType } = entityConfig;

  const inputName = `${name}CreateChildInput`;

  if (configType !== 'tangible') return [inputName, '', {}];

  const inputDefinition = `input ${inputName} {
  connect: ID
  create: ${name}CreateInput
}`;

  return [
    inputName,
    inputDefinition,
    { [`${name}CreateInput`]: [createEntityCreateInputType, entityConfig] },
  ];
};

export const createEntityCreateOrPushChildrenInputType: InputCreator = (entityConfig) => {
  const { name, type: configType } = entityConfig;

  const inputName = `${name}CreateOrPushChildrenInput`;

  if (configType !== 'tangible') return [inputName, '', {}];

  const inputDefinition = `input ${inputName} {
  connect: [ID!]
  create: [${name}CreateInput!]
  createPositions: [Int!]
}`;

  return [
    inputName,
    inputDefinition,
    { [`${name}CreateInput`]: [createEntityCreateInputType, entityConfig] },
  ];
};

// "Thru" inputs exist only for required duplex fields: used by the opposite field ...
// ... whose entity fills the required field by its own id

const isRequiredDuplexField = (entityConfig: EntityConfig, fieldName: string) =>
  entityConfig.type === 'tangible' &&
  (entityConfig.duplexFields || []).some(
    ({ name: name2, required }) => name2 === fieldName && required,
  );

const thruFieldInputCreators: Record<string, InputCreator> = {};

export const createEntityCreateThruFieldInputType = (fieldName: string): InputCreator => {
  if (!thruFieldInputCreators[fieldName]) {
    thruFieldInputCreators[fieldName] = (entityConfig) => {
      const inputName = `${entityConfig.name}CreateThru_${fieldName}_FieldInput`;

      if (!isRequiredDuplexField(entityConfig, fieldName)) return [inputName, '', {}];

      const [inputDefinition, childChain] = composeCreateInputDefinition(
        entityConfig,
        inputName,
        fieldName,
      );

      return [inputName, inputDefinition, childChain];
    };
  }

  return thruFieldInputCreators[fieldName];
};

const thruFieldChildInputCreators: Record<string, InputCreator> = {};

export const createEntityCreateThruFieldChildInputType = (fieldName: string): InputCreator => {
  if (!thruFieldChildInputCreators[fieldName]) {
    thruFieldChildInputCreators[fieldName] = (entityConfig) => {
      const { name } = entityConfig;

      const inputName = `${name}CreateThru_${fieldName}_FieldChildInput`;

      if (!isRequiredDuplexField(entityConfig, fieldName)) return [inputName, '', {}];

      const inputDefinition = `input ${inputName} {
  connect: ID
  create: ${name}CreateThru_${fieldName}_FieldInput
}`;

      return [
        inputName,
        inputDefinition,
        {
          [`${name}CreateThru_${fieldName}_FieldInput`]: [
            createEntityCreateThruFieldInputType(fieldName),
            entityConfig,
          ],
        },
      ];
    };
  }

  return thruFieldChildInputCreators[fieldName];
};

const thruFieldChildrenInputCreators: Record<string, InputCreator> = {};

export const createEntityCreateOrPushThruFieldChildrenInputType = (
  fieldName: string,
): InputCreator => {
  if (!thruFieldChildrenInputCreators[fieldName]) {
    thruFieldChildrenInputCreators[fieldName] = (entityConfig) => {
      const { name } = entityConfig;

      const inputName = `${name}CreateOrPushThru_${fieldName}_FieldChildrenInput`;

      if (!isRequiredDuplexField(entityConfig, fieldName)) return [inputName, '', {}];

      const inputDefinition = `input ${inputName} {
  connect: [ID!]
  create: [${name}CreateThru_${fieldName}_FieldInput!]
  createPositions: [Int!]
}`;

      return [
        inputName,
        inputDefinition,
        {
          [`${name}CreateThru_${fieldName}_FieldInput`]: [
            createEntityCreateThruFieldInputType(fieldName),
            entityConfig,
          ],
        },
      ];
    };
  }

  return thruFieldChildrenInputCreators[fieldName];
};

// creators of the "Thru" inputs of every required duplex field (to find the inputs used by custom actions)
export const composeCreateThruFieldInputCreators = (entityConfig: EntityConfig): InputCreator[] =>
  entityConfig.type === 'tangible'
    ? (entityConfig.duplexFields || [])
        .filter(({ required }) => required)
        .reduce<InputCreator[]>((prev, { name: fieldName }) => {
          prev.push(
            createEntityCreateThruFieldInputType(fieldName),
            createEntityCreateThruFieldChildInputType(fieldName),
            createEntityCreateOrPushThruFieldChildrenInputType(fieldName),
          );

          return prev;
        }, [])
    : [];

// name & creator of the input of a relational or duplex field of the parent entity: ...
// ... "oppositeRequiredName" is the name of the required opposite duplex field (filled by the parent)
export const getChildInputNameAndCreator = (
  config: TangibleEntityConfig,
  array?: boolean,
  oppositeRequiredName?: string,
): [string, InputCreator] => {
  const { name } = config;

  if (oppositeRequiredName) {
    return array
      ? [
          `${name}CreateOrPushThru_${oppositeRequiredName}_FieldChildrenInput`,
          createEntityCreateOrPushThruFieldChildrenInputType(oppositeRequiredName),
        ]
      : [
          `${name}CreateThru_${oppositeRequiredName}_FieldChildInput`,
          createEntityCreateThruFieldChildInputType(oppositeRequiredName),
        ];
  }

  return array
    ? [`${name}CreateOrPushChildrenInput`, createEntityCreateOrPushChildrenInputType]
    : [`${name}CreateChildInput`, createEntityCreateChildInputType];
};

export default createEntityCreateInputType;
